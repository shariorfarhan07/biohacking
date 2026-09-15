import uuid

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.db.base import Base, TimestampMixin, UUIDPKMixin
from app.models.enums import TicketAuthorType


class SupportTicketMessage(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "support_ticket_messages"

    ticket_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("support_tickets.id"), index=True, nullable=False
    )
    author_type: Mapped[TicketAuthorType] = mapped_column(
        Enum(TicketAuthorType, native_enum=False, length=20), nullable=False
    )
    # Denormalized at write time (same reasoning as BlogPost.author_name) so a
    # message keeps showing who actually wrote it even if that person's name
    # changes, or their account is later deactivated.
    author_name: Mapped[str] = mapped_column(String(150), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)

    ticket: Mapped["SupportTicket"] = relationship(back_populates="messages")
