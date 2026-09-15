from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_customer, get_db
from app.models.customer import Customer
from app.schemas.checkout import BillingPortalSession
from app.services import stripe_service

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/portal-session", response_model=BillingPortalSession)
def create_portal_session(
    customer: Customer = Depends(get_current_customer), db: Session = Depends(get_db)
):
    if not customer.stripe_customer_id:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "No billing account found for this customer yet"
        )
    try:
        session = stripe_service.create_billing_portal_session(
            stripe_customer_id=customer.stripe_customer_id
        )
    except Exception as exc:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY, "We couldn't open billing management — please try again"
        ) from exc
    return BillingPortalSession(portal_url=session.url)
