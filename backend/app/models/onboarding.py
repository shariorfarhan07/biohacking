import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.db.base import Base, TimestampMixin, UUIDPKMixin
from app.models.enums import ExperienceLevel, Goal, TrainingLocation


class OnboardingResponse(Base, UUIDPKMixin, TimestampMixin):
    """One row per membership. Supports partial save/resume via `current_step`;
    `answers_raw` mirrors the full payload so new questions can be added without a
    migration, while the structured columns below are what the rules engine and
    admin UI actually read."""

    __tablename__ = "onboarding_responses"

    membership_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("memberships.id"), unique=True, nullable=False
    )
    current_step: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Step 1 — Goals
    goal: Mapped[Optional[Goal]] = mapped_column(
        Enum(Goal, native_enum=False, length=30), nullable=True
    )
    target_weight_kg: Mapped[Optional[float]] = mapped_column(nullable=True)
    body_composition_goal: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Step 2 — Personal
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    height_cm: Mapped[Optional[float]] = mapped_column(nullable=True)
    weight_kg: Mapped[Optional[float]] = mapped_column(nullable=True)
    body_fat_range: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Step 3 — Training
    training_experience: Mapped[Optional[ExperienceLevel]] = mapped_column(
        Enum(ExperienceLevel, native_enum=False, length=20), nullable=True
    )
    training_days_per_week: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    preferred_training_days: Mapped[Optional[list[str]]] = mapped_column(JSON, nullable=True)
    training_location: Mapped[Optional[TrainingLocation]] = mapped_column(
        Enum(TrainingLocation, native_enum=False, length=20), nullable=True
    )
    equipment: Mapped[Optional[list[str]]] = mapped_column(JSON, nullable=True)
    session_duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Step 4 — Lifestyle
    occupation: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    activity_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    daily_steps: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    sleep_hours: Mapped[Optional[float]] = mapped_column(nullable=True)
    sleep_quality: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    stress_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Step 5 — Nutrition
    current_calorie_intake: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    food_preferences: Mapped[Optional[list[str]]] = mapped_column(JSON, nullable=True)
    allergies: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    intolerances: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    meals_per_day: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    cooking_ability: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    food_budget: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Step 6 — Health / limitations
    injuries: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    physical_limitations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    health_screening_answers: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Step 7 — Progress photos (files aren't stored server-side yet; this simply
    # records that the customer supplied them so coaches know to expect them).
    progress_photos_provided: Mapped[bool] = mapped_column(default=False, nullable=False)

    # Full raw payload, forward-compatible with new questions.
    answers_raw: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    membership: Mapped["Membership"] = relationship(back_populates="onboarding_response")
