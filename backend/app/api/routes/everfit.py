from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_customer, get_db
from app.models.customer import Customer
from app.models.enums import EverfitStatus
from app.schemas.everfit import EverfitStatusRead
from app.services.membership_lookup import latest_membership_for_customer

router = APIRouter(prefix="/everfit", tags=["everfit"])


@router.get("/status", response_model=EverfitStatusRead)
def get_everfit_status(
    customer: Customer = Depends(get_current_customer), db: Session = Depends(get_db)
):
    membership = latest_membership_for_customer(db, customer)
    if membership is None or membership.everfit_account is None:
        return EverfitStatusRead(status=EverfitStatus.NOT_STARTED)

    account = membership.everfit_account
    return EverfitStatusRead(
        status=account.status,
        programme_name=account.programme.name if account.programme else None,
        access_url=account.access_url,
        last_error=None,  # never expose raw technical errors to a customer
    )
