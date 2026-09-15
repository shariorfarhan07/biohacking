import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict

from app.models.enums import (
    EverfitStatus,
    ExperienceLevel,
    Goal,
    MembershipStatus,
    TrainingLocation,
)


class OnboardingStepUpdate(BaseModel):
    step: int
    data: dict[str, Any]


class OnboardingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    membership_id: uuid.UUID
    current_step: int
    completed_at: Optional[datetime] = None

    goal: Optional[Goal] = None
    target_weight_kg: Optional[float] = None
    body_composition_goal: Optional[str] = None

    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    body_fat_range: Optional[str] = None

    training_experience: Optional[ExperienceLevel] = None
    training_days_per_week: Optional[int] = None
    preferred_training_days: Optional[list[str]] = None
    training_location: Optional[TrainingLocation] = None
    equipment: Optional[list[str]] = None
    session_duration_minutes: Optional[int] = None

    occupation: Optional[str] = None
    activity_level: Optional[str] = None
    daily_steps: Optional[int] = None
    sleep_hours: Optional[float] = None
    sleep_quality: Optional[str] = None
    stress_level: Optional[str] = None

    current_calorie_intake: Optional[int] = None
    food_preferences: Optional[list[str]] = None
    allergies: Optional[str] = None
    intolerances: Optional[str] = None
    meals_per_day: Optional[int] = None
    cooking_ability: Optional[str] = None
    food_budget: Optional[str] = None

    injuries: Optional[str] = None
    physical_limitations: Optional[str] = None
    health_screening_answers: Optional[dict[str, Any]] = None

    progress_photos_provided: bool = False


class OnboardingCompleteResult(BaseModel):
    membership_status: MembershipStatus
    everfit_status: EverfitStatus
