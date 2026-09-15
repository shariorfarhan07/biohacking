import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_db
from app.models.admin_user import AdminUser
from app.models.audit_log import AdminAuditLog
from app.models.customer import Customer
from app.models.enums import EverfitStatus, MembershipStatus
from app.models.everfit_account import EverfitAccount
from app.models.membership import Membership
from app.models.programme import Programme
from app.schemas.admin import (
    ActionResult,
    AdminCustomerDetail,
    AdminCustomerListItem,
    OverrideProgrammeRequest,
    RefundRequest,
    RequiresAttentionItem,
    StatusUpdateRequest,
)
from app.schemas.common import Page
from app.services import stripe_service
from app.services.everfit.factory import get_everfit_service
from app.services.provisioning_service import provision

router = APIRouter(prefix="/admin/customers", tags=["admin-customers"])

ONBOARDING_STALL_THRESHOLD = timedelta(hours=24)
PROVISIONING_STALL_THRESHOLD = timedelta(minutes=10)


def _as_aware_utc(value: datetime) -> datetime:
    """SQLite has no real timezone-aware storage, so a `DateTime(timezone=True)`
    column round-trips as a naive datetime there (Postgres preserves tzinfo
    correctly) — normalize to UTC-aware before comparing against `datetime.now()`."""
    return value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)


# Admin-facing filter keys -> a predicate applied to the customers query.
STATUS_FILTERS = {
    "payment_pending": lambda q: q.filter(Membership.status == MembershipStatus.PENDING_PAYMENT),
    "payment_failed": lambda q: q.filter(Membership.status == MembershipStatus.PAYMENT_FAILED),
    "onboarding_incomplete": lambda q: q.filter(
        Membership.status == MembershipStatus.ONBOARDING_PENDING
    ),
    "everfit_pending": lambda q: q.filter(
        Membership.status.in_([MembershipStatus.ONBOARDING_COMPLETE, MembershipStatus.PROVISIONING])
    ),
    "everfit_active": lambda q: q.filter(Membership.status == MembershipStatus.PROVISIONED),
    "programme_assigned": lambda q: q.join(EverfitAccount).filter(
        EverfitAccount.programme_id.isnot(None)
    ),
    "cancelled": lambda q: q.filter(Membership.status == MembershipStatus.CANCELED),
}


def _onboarding_status_label(membership: Membership) -> str:
    onboarding = membership.onboarding_response
    if onboarding is None:
        return "not_started"
    return "complete" if onboarding.completed_at is not None else "in_progress"


def _to_list_item(membership: Membership) -> AdminCustomerListItem:
    everfit = membership.everfit_account
    return AdminCustomerListItem(
        membership_id=membership.id,
        customer_name=membership.customer.full_name,
        email=membership.customer.email,
        package_name=membership.package.name,
        payment_status=membership.status,
        onboarding_status=_onboarding_status_label(membership),
        programme_name=everfit.programme.name if everfit and everfit.programme else None,
        everfit_status=everfit.status if everfit else EverfitStatus.NOT_STARTED,
        created_at=membership.created_at,
    )


@router.get("", response_model=Page[AdminCustomerListItem])
def list_customers(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    query = db.query(Membership).join(Customer).join(Membership.package)

    if status_filter:
        predicate = STATUS_FILTERS.get(status_filter)
        if predicate is None:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, f"Unknown status filter '{status_filter}'"
            )
        query = predicate(query)

    if search:
        like = f"%{search.lower()}%"
        query = query.filter(
            or_(
                Customer.email.ilike(like),
                Customer.first_name.ilike(like),
                Customer.last_name.ilike(like),
            )
        )

    total = query.count()
    memberships = (
        query.order_by(Membership.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return Page(
        items=[_to_list_item(m) for m in memberships], total=total, page=page, page_size=page_size
    )


@router.get("/requires-attention", response_model=Page[RequiresAttentionItem])
def requires_attention(
    db: Session = Depends(get_db), _admin: AdminUser = Depends(get_current_admin)
):
    now = datetime.now(timezone.utc)
    memberships = (
        db.query(Membership)
        .join(Customer)
        .filter(
            Membership.status.in_(
                [
                    MembershipStatus.PROVISIONING_FAILED,
                    MembershipStatus.PAYMENT_FAILED,
                    MembershipStatus.ONBOARDING_COMPLETE,
                    MembershipStatus.PROVISIONING,
                    MembershipStatus.ONBOARDING_PENDING,
                ]
            )
        )
        .order_by(Membership.created_at.asc())
        .all()
    )

    items: list[RequiresAttentionItem] = []
    for membership in memberships:
        reason = None
        if membership.status == MembershipStatus.PROVISIONING_FAILED:
            reason = "Everfit provisioning failed"
        elif membership.status == MembershipStatus.PAYMENT_FAILED:
            reason = "Payment failed"
        elif membership.status == MembershipStatus.ONBOARDING_COMPLETE:
            reason = "Onboarding complete → Everfit pending"
        elif (
            membership.status == MembershipStatus.PROVISIONING
            and membership.updated_at
            and now - _as_aware_utc(membership.updated_at) > PROVISIONING_STALL_THRESHOLD
        ):
            reason = "Everfit provisioning stuck"
        elif (
            membership.status == MembershipStatus.ONBOARDING_PENDING
            and now - _as_aware_utc(membership.created_at) > ONBOARDING_STALL_THRESHOLD
        ):
            reason = "Paid → onboarding incomplete"

        if reason:
            items.append(
                RequiresAttentionItem(
                    membership_id=membership.id,
                    customer_name=membership.customer.full_name,
                    email=membership.customer.email,
                    reason=reason,
                )
            )

    return Page(items=items, total=len(items), page=1, page_size=len(items) or 1)


def _get_membership_or_404(db: Session, membership_id: uuid.UUID) -> Membership:
    membership = db.get(Membership, membership_id)
    if membership is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")
    return membership


@router.get("/{membership_id}", response_model=AdminCustomerDetail)
def get_customer_detail(
    membership_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    membership = _get_membership_or_404(db, membership_id)
    everfit = membership.everfit_account

    return AdminCustomerDetail(
        membership_id=membership.id,
        customer_id=membership.customer_id,
        customer_name=membership.customer.full_name,
        email=membership.customer.email,
        package=membership.package,
        membership_status=membership.status,
        stripe_subscription_id=membership.stripe_subscription_id,
        next_billing_date=membership.next_billing_date,
        activated_at=membership.activated_at,
        canceled_at=membership.canceled_at,
        onboarding=membership.onboarding_response,
        everfit_status=everfit.status if everfit else EverfitStatus.NOT_STARTED,
        everfit_client_id=everfit.everfit_client_id if everfit else None,
        everfit_programme_name=(everfit.programme.name if everfit and everfit.programme else None),
        everfit_access_url=everfit.access_url if everfit else None,
        everfit_last_error=everfit.last_error if everfit else None,
        everfit_attempt_count=everfit.attempt_count if everfit else 0,
        created_at=membership.created_at,
    )


def _write_audit_log(
    db: Session, admin: AdminUser, action: str, membership_id: uuid.UUID, details: dict
) -> None:
    db.add(
        AdminAuditLog(
            admin_user_id=admin.id,
            action=action,
            target_membership_id=membership_id,
            details=details,
        )
    )


@router.post("/{membership_id}/refund", response_model=ActionResult)
def refund_customer(
    membership_id: uuid.UUID,
    data: RefundRequest,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    membership = _get_membership_or_404(db, membership_id)
    if not membership.stripe_latest_payment_intent_id:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "No payment found on this membership to refund"
        )

    try:
        stripe_service.create_refund(
            payment_intent_id=membership.stripe_latest_payment_intent_id, reason=data.reason
        )
        if data.cancel_subscription and membership.stripe_subscription_id:
            stripe_service.cancel_subscription(
                stripe_subscription_id=membership.stripe_subscription_id
            )
    except Exception as exc:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY, "Stripe refund failed — no changes were made"
        ) from exc

    membership.status = MembershipStatus.REFUNDED
    if data.cancel_subscription:
        membership.canceled_at = datetime.now(timezone.utc)
    _write_audit_log(
        db,
        admin,
        "refund_issued",
        membership.id,
        {"reason": data.reason, "cancel_subscription": data.cancel_subscription},
    )
    db.commit()
    return ActionResult(status="refunded")


@router.post("/{membership_id}/override-programme", response_model=ActionResult)
def override_programme(
    membership_id: uuid.UUID,
    data: OverrideProgrammeRequest,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    membership = _get_membership_or_404(db, membership_id)
    programme = db.get(Programme, data.programme_id)
    if programme is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Programme not found")

    everfit_account = membership.everfit_account
    if everfit_account is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "This customer has no Everfit account yet — complete provisioning first",
        )

    if not programme.everfit_programme_id:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Programme '{programme.slug}' has no Everfit programme id set",
        )

    try:
        get_everfit_service().assign_programme(
            everfit_client_id=everfit_account.everfit_client_id,
            everfit_programme_id=programme.everfit_programme_id,
        )
    except Exception as exc:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY, "Everfit programme reassignment failed"
        ) from exc

    everfit_account.programme_id = programme.id
    everfit_account.matched_rule_id = None
    _write_audit_log(
        db,
        admin,
        "programme_override",
        membership.id,
        {"programme_id": str(programme.id), "reason": data.reason},
    )
    db.commit()
    return ActionResult(status="programme_overridden")


@router.post("/{membership_id}/everfit/retry", response_model=ActionResult)
def retry_everfit_provisioning(
    membership_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    membership = _get_membership_or_404(db, membership_id)
    if (
        membership.onboarding_response is None
        or membership.onboarding_response.completed_at is None
    ):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Onboarding must be completed before provisioning can run"
        )

    account = provision(db, membership)
    _write_audit_log(
        db, admin, "everfit_retry", membership.id, {"resulting_status": account.status.value}
    )
    db.commit()
    return ActionResult(status="retried", detail={"everfit_status": account.status.value})


@router.patch("/{membership_id}/status", response_model=ActionResult)
def correct_status(
    membership_id: uuid.UUID,
    data: StatusUpdateRequest,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    membership = _get_membership_or_404(db, membership_id)
    previous_status = membership.status
    membership.status = data.status
    _write_audit_log(
        db,
        admin,
        "manual_status_correction",
        membership.id,
        {"from": previous_status.value, "to": data.status.value, "reason": data.reason},
    )
    db.commit()
    return ActionResult(status="updated")
