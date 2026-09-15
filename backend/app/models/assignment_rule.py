import uuid

from sqlalchemy import JSON, Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.db.base import Base, TimestampMixin, UUIDPKMixin


class AssignmentRule(Base, UUIDPKMixin, TimestampMixin):
    """A single rule in the programme-assignment engine. `conditions` is a JSON
    predicate tree, e.g.:

        {"all": [
            {"field": "goal", "op": "eq", "value": "fat_loss"},
            {"field": "training_location", "op": "eq", "value": "home"},
            {"field": "training_days_per_week", "op": "in", "value": [3]}
        ]}

    Rules are evaluated in `priority` order (ascending); the first full match wins.
    Kept in the database (not hardcoded) so admins can tune matching without a
    deploy — see app/services/rules_engine.py and the admin `/assignment-rules`
    screens, including the dry-run "test rule" tool.
    """

    __tablename__ = "assignment_rules"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=100, nullable=False, index=True)
    conditions: Mapped[dict] = mapped_column(JSON, nullable=False)
    programme_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("programmes.id"), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    programme: Mapped["Programme"] = relationship()
