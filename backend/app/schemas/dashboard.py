from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.enums import EverfitStatus, MembershipStatus
from app.schemas.customer import CustomerPublic


class DashboardMembership(BaseModel):
    status: MembershipStatus
    package_name: str
    next_billing_date: Optional[datetime] = None


class DashboardOnboarding(BaseModel):
    completed: bool
    current_step: int


class DashboardEverfit(BaseModel):
    status: EverfitStatus
    programme_name: Optional[str] = None
    access_url: Optional[str] = None


class DashboardRead(BaseModel):
    customer: CustomerPublic
    membership: DashboardMembership
    onboarding: DashboardOnboarding
    everfit: DashboardEverfit
