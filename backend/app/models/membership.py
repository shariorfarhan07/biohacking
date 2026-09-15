import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.db.base import Base, TimestampMixin, UUIDPKMixin
from app.models.enums import MembershipStatus


class Membership(Base, UUIDPKMixin, TimestampMixin):
    """The central pipeline object: one row per purchase. Every stage of the
    customer journey (payment, onboarding, provisioning) reads and writes the
    `status` field here, which is what both the customer dashboard and the admin
    dashboard render from."""

    __tablename__ = "memberships"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("customers.id"), index=True, nullable=False
    )
    package_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("packages.id"), nullable=False
    )

    stripe_checkout_session_id: Mapped[Optional[str]] = mapped_column(
        String(255), unique=True, nullable=True
    )
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(
        String(255), unique=True, nullable=True, index=True
    )
    # Tracked so an admin-initiated or Stripe-initiated refund can be matched back
    # to the payment that funded this membership, without a second lookup.
    stripe_latest_payment_intent_id: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True, index=True
    )

    status: Mapped[MembershipStatus] = mapped_column(
        Enum(MembershipStatus, native_enum=False, length=30),
        default=MembershipStatus.PENDING_PAYMENT,
        nullable=False,
        index=True,
    )

    discount_code_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("discount_codes.id"), nullable=True
    )

    activated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    canceled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    next_billing_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    customer: Mapped["Customer"] = relationship(back_populates="memberships")
    package: Mapped["Package"] = relationship(back_populates="memberships")
    discount_code: Mapped[Optional["DiscountCode"]] = relationship()
    onboarding_response: Mapped[Optional["OnboardingResponse"]] = relationship(
        back_populates="membership", uselist=False, cascade="all, delete-orphan"
    )
    everfit_account: Mapped[Optional["EverfitAccount"]] = relationship(
        back_populates="membership", uselist=False, cascade="all, delete-orphan"
    )
