from datetime import datetime
from typing import Optional

from sqlalchemy import JSON, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPKMixin


class WebhookEvent(Base, UUIDPKMixin, TimestampMixin):
    """Idempotency ledger for Stripe webhooks. Unique on `stripe_event_id`: a
    second delivery of the same event is detected here before any side effect
    runs, so retried/duplicate webhooks never double-process a payment."""

    __tablename__ = "webhook_events"

    stripe_event_id: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    processing_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
