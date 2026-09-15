from typing import Optional

from sqlalchemy import JSON, Boolean, Enum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPKMixin
from app.models.enums import BillingInterval


class Package(Base, UUIDPKMixin, TimestampMixin):
    """A sellable coaching plan. Fully admin-editable so pricing/copy changes never
    require a frontend deploy — the pricing page and admin editor read/write this
    same table."""

    __tablename__ = "packages"

    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    price_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="gbp")
    billing_interval: Mapped[BillingInterval] = mapped_column(
        Enum(BillingInterval, native_enum=False, length=20), nullable=False
    )
    # Stripe Prices are immutable by design — this points at a real Price object
    # created in the Stripe Dashboard/API; admins paste the id in after creating it.
    stripe_price_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    features: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    memberships: Mapped[list["Membership"]] = relationship(back_populates="package")
