import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DiscountCodeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    code: str
    percent_off: Optional[int] = None
    amount_off_cents: Optional[int] = None
    is_active: bool
    expires_at: Optional[datetime] = None
    max_redemptions: Optional[int] = None
    times_redeemed: int


class DiscountCodeCreate(BaseModel):
    code: str
    stripe_coupon_id: Optional[str] = None
    percent_off: Optional[int] = None
    amount_off_cents: Optional[int] = None
    is_active: bool = True
    expires_at: Optional[datetime] = None
    max_redemptions: Optional[int] = None


class DiscountCodeUpdate(BaseModel):
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None
    max_redemptions: Optional[int] = None
    percent_off: Optional[int] = None
    amount_off_cents: Optional[int] = None
