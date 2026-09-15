import uuid

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.db.base import Base, TimestampMixin, UUIDPKMixin
from app.models.enums import TicketStatus


class SupportTicket(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "support_tickets"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("customers.id"), index=True, nullable=False
    )
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[TicketStatus] = mapped_column(
        Enum(TicketStatus, native_enum=False, length=20),
        default=TicketStatus.OPEN,
        nullable=False,
        index=True,
    )

    customer: Mapped["Customer"] = relationship()
    messages: Mapped[list["SupportTicketMessage"]] = relationship(
        back_populates="ticket",
        order_by="SupportTicketMessage.created_at",
        cascade="all, delete-orphan",
    )
