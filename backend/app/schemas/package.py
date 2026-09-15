import uuid
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.enums import BillingInterval


class PackageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    name: str
    description: str
    price_cents: int
    currency: str
    billing_interval: BillingInterval
    features: list[str]
    is_active: bool
    sort_order: int


class PackageAdminRead(PackageRead):
    stripe_price_id: Optional[str] = None


class PackageCreate(BaseModel):
    slug: str
    name: str
    description: str
    price_cents: int
    currency: str = "gbp"
    billing_interval: BillingInterval
    features: list[str] = []
    is_active: bool = True
    sort_order: int = 0
    stripe_price_id: Optional[str] = None


class PackageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_cents: Optional[int] = None
    currency: Optional[str] = None
    billing_interval: Optional[BillingInterval] = None
    features: Optional[list[str]] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    stripe_price_id: Optional[str] = None
