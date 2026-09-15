import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.db.base import Base, TimestampMixin, UUIDPKMixin
from app.models.enums import EverfitStatus


class EverfitAccount(Base, UUIDPKMixin, TimestampMixin):
    """Provisioning state for one membership, decoupled from Membership.status so
    vendor-specific detail (client id, last error, retry count) never leaks into
    the core pipeline model. `status` advances strictly forward
    (not_started -> client_created -> programme_assigned -> activated), and
    provisioning_service checks this before every EverfitService call so retries
    resume from the right step instead of restarting or double-provisioning."""

    __tablename__ = "everfit_accounts"

    membership_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("memberships.id"), unique=True, nullable=False
    )
    everfit_client_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    programme_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("programmes.id"), nullable=True
    )
    matched_rule_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("assignment_rules.id"), nullable=True
    )
    status: Mapped[EverfitStatus] = mapped_column(
        Enum(EverfitStatus, native_enum=False, length=20),
        default=EverfitStatus.NOT_STARTED,
        nullable=False,
    )
    access_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    last_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    attempt_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_attempted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    activated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    membership: Mapped["Membership"] = relationship(back_populates="everfit_account")
    programme: Mapped[Optional["Programme"]] = relationship()
