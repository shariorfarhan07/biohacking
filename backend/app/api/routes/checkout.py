from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_customer, get_db
from app.models.customer import Customer
from app.models.discount_code import DiscountCode
from app.models.enums import MembershipStatus
from app.models.membership import Membership
from app.models.package import Package
from app.schemas.checkout import (
    CheckoutSessionCreate,
    CheckoutSessionCreated,
    CheckoutSessionStatus,
)
from app.services import stripe_service

router = APIRouter(prefix="/checkout", tags=["checkout"])


def _resolve_discount_code(db: Session, code: str | None) -> DiscountCode | None:
    if not code:
        return None
    discount_code = (
        db.query(DiscountCode)
        .filter(DiscountCode.code == code.upper(), DiscountCode.is_active.is_(True))
        .first()
    )
    if discount_code is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired discount code")
    return discount_code


@router.post("/session", response_model=CheckoutSessionCreated)
def create_checkout_session(
    data: CheckoutSessionCreate,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    package = db.get(Package, data.package_id)
    if package is None or not package.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Package not found")

    discount_code = _resolve_discount_code(db, data.discount_code)

    stripe_customer_id = stripe_service.ensure_stripe_customer(customer)
    if customer.stripe_customer_id != stripe_customer_id:
        customer.stripe_customer_id = stripe_customer_id
        db.commit()

    # A durable pipeline record is created up front, before the redirect, so the
    # customer's journey is trackable even if the Stripe webhook is delayed.
    membership = Membership(
        customer_id=customer.id,
        package_id=package.id,
        status=MembershipStatus.PENDING_PAYMENT,
        discount_code_id=discount_code.id if discount_code else None,
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)

    try:
        session = stripe_service.create_checkout_session(
            customer=customer,
            stripe_customer_id=stripe_customer_id,
            package=package,
            membership_id=membership.id,
            discount_code=discount_code,
        )
    except Exception as exc:  # Stripe SDK errors, misconfigured price ids, etc.
        db.delete(membership)
        db.commit()
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY, "We couldn't start checkout — please try again shortly"
        ) from exc

    membership.stripe_checkout_session_id = session.id
    db.commit()

    return CheckoutSessionCreated(checkout_url=session.url)


@router.get("/session/{session_id}/status", response_model=CheckoutSessionStatus)
def get_checkout_session_status(
    session_id: str,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    membership = (
        db.query(Membership)
        .filter(
            Membership.stripe_checkout_session_id == session_id,
            Membership.customer_id == customer.id,
        )
        .first()
    )
    if membership is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Checkout session not found")

    return CheckoutSessionStatus(membership_id=membership.id, status=membership.status)


@router.post("/dev-session", response_model=CheckoutSessionStatus)
def create_dev_checkout_session(
    data: CheckoutSessionCreate,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    """Local-dev-only bypass that skips Stripe entirely and drops the
    membership straight into onboarding, exactly where a real webhook would
    leave it. Hidden behind a 404 in production so it can never be reached
    outside a dev environment."""
    if settings.is_production:
        raise HTTPException(status.HTTP_404_NOT_FOUND)

    package = db.get(Package, data.package_id)
    if package is None or not package.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Package not found")

    discount_code = _resolve_discount_code(db, data.discount_code)

    membership = Membership(
        customer_id=customer.id,
        package_id=package.id,
        status=MembershipStatus.ONBOARDING_PENDING,
        discount_code_id=discount_code.id if discount_code else None,
        activated_at=datetime.now(timezone.utc),
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)

    return CheckoutSessionStatus(membership_id=membership.id, status=membership.status)
