import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel

from app.models.enums import EverfitStatus, MembershipStatus
from app.schemas.onboarding import OnboardingRead
from app.schemas.package import PackageAdminRead


class AdminCustomerListItem(BaseModel):
    membership_id: uuid.UUID
    customer_name: str
    email: str
    package_name: str
    payment_status: MembershipStatus
    onboarding_status: str
    programme_name: Optional[str] = None
    everfit_status: EverfitStatus
    created_at: datetime


class AdminCustomerDetail(BaseModel):
    membership_id: uuid.UUID
    customer_id: uuid.UUID
    customer_name: str
    email: str
    package: PackageAdminRead
    membership_status: MembershipStatus
    stripe_subscription_id: Optional[str] = None
    next_billing_date: Optional[datetime] = None
    activated_at: Optional[datetime] = None
    canceled_at: Optional[datetime] = None
    onboarding: Optional[OnboardingRead] = None
    everfit_status: EverfitStatus
    everfit_client_id: Optional[str] = None
    everfit_programme_name: Optional[str] = None
    everfit_access_url: Optional[str] = None
    everfit_last_error: Optional[str] = None
    everfit_attempt_count: int
    created_at: datetime


class RequiresAttentionItem(BaseModel):
    membership_id: uuid.UUID
    customer_name: str
    email: str
    reason: str


class RefundRequest(BaseModel):
    reason: str
    cancel_subscription: bool = False


class OverrideProgrammeRequest(BaseModel):
    programme_id: uuid.UUID
    reason: str


class StatusUpdateRequest(BaseModel):
    status: MembershipStatus
    reason: str


class ActionResult(BaseModel):
    status: str
    detail: Optional[dict[str, Any]] = None
