import uuid
from typing import Optional

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from app.db.base import Base, TimestampMixin, UUIDPKMixin


class AdminAuditLog(Base, UUIDPKMixin, TimestampMixin):
    """Records every admin action with side effects (refunds, programme overrides,
    manual status corrections) so there's always an accountable trail."""

    __tablename__ = "admin_audit_logs"

    admin_user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("admin_users.id"), nullable=False
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    target_membership_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("memberships.id"), nullable=True
    )
    details: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
