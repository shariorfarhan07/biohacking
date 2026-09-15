from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_customer, get_db
from app.models.customer import Customer
from app.models.enums import EverfitStatus
from app.schemas.dashboard import (
    DashboardEverfit,
    DashboardMembership,
    DashboardOnboarding,
    DashboardRead,
)
from app.services.membership_lookup import latest_membership_for_customer

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardRead)
def get_dashboard(
    customer: Customer = Depends(get_current_customer), db: Session = Depends(get_db)
):
    membership = latest_membership_for_customer(db, customer)
    if membership is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No membership found for this account yet")

    onboarding = membership.onboarding_response
    everfit_account = membership.everfit_account

    return DashboardRead(
        customer=customer,
        membership=DashboardMembership(
            status=membership.status,
            package_name=membership.package.name,
            next_billing_date=membership.next_billing_date,
        ),
        onboarding=DashboardOnboarding(
            completed=bool(onboarding and onboarding.completed_at is not None),
            current_step=onboarding.current_step if onboarding else 1,
        ),
        everfit=DashboardEverfit(
            status=everfit_account.status if everfit_account else EverfitStatus.NOT_STARTED,
            programme_name=(
                everfit_account.programme.name
                if everfit_account and everfit_account.programme
                else None
            ),
            access_url=everfit_account.access_url if everfit_account else None,
        ),
    )
