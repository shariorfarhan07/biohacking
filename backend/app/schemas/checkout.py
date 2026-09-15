import uuid
from typing import Optional

from pydantic import BaseModel

from app.models.enums import MembershipStatus


class CheckoutSessionCreate(BaseModel):
    package_id: uuid.UUID
    discount_code: Optional[str] = None


class CheckoutSessionCreated(BaseModel):
    checkout_url: str


class CheckoutSessionStatus(BaseModel):
    membership_id: uuid.UUID
    status: MembershipStatus


class BillingPortalSession(BaseModel):
    portal_url: str
