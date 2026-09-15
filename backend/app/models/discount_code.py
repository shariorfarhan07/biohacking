from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPKMixin


class DiscountCode(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "discount_codes"

    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    stripe_coupon_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    percent_off: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    amount_off_cents: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    max_redemptions: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    times_redeemed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
