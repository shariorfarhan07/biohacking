import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_customer, get_db
from app.models.customer import Customer
from app.models.enums import MembershipStatus
from app.models.membership import Membership
from app.models.onboarding import OnboardingResponse
from app.schemas.onboarding import OnboardingCompleteResult, OnboardingRead, OnboardingStepUpdate
from app.services.provisioning_service import provision

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

TOTAL_STEPS = 8

# Fields accepted from each wizard step's `data` payload. Anything outside this
# allowlist is stored only in `answers_raw`, never assigned onto a column, so an
# unexpected key can never write to an arbitrary model attribute.
STEP_FIELDS: dict[int, list[str]] = {
    1: ["goal", "target_weight_kg", "body_composition_goal"],
    2: ["age", "height_cm", "weight_kg", "body_fat_range"],
    3: [
        "training_experience",
        "training_days_per_week",
        "preferred_training_days",
        "training_location",
        "equipment",
        "session_duration_minutes",
    ],
    4: [
        "occupation",
        "activity_level",
        "daily_steps",
        "sleep_hours",
        "sleep_quality",
        "stress_level",
    ],
    5: [
        "current_calorie_intake",
        "food_preferences",
        "allergies",
        "intolerances",
        "meals_per_day",
        "cooking_ability",
        "food_budget",
    ],
    6: ["injuries", "physical_limitations", "health_screening_answers"],
    7: ["progress_photos_provided"],
    8: [],  # review step only reads back prior answers; nothing new to save
}


def _get_owned_membership(db: Session, membership_id: uuid.UUID, customer: Customer) -> Membership:
    membership = db.get(Membership, membership_id)
    if membership is None or membership.customer_id != customer.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Membership not found")
    return membership


def _get_or_create_onboarding(db: Session, membership: Membership) -> OnboardingResponse:
    if membership.onboarding_response is not None:
        return membership.onboarding_response
    onboarding = OnboardingResponse(membership_id=membership.id)
    db.add(onboarding)
    membership.onboarding_response = onboarding
    db.flush()
    return onboarding


@router.get("/{membership_id}", response_model=OnboardingRead)
def get_onboarding(
    membership_id: uuid.UUID,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    membership = _get_owned_membership(db, membership_id, customer)
    onboarding = _get_or_create_onboarding(db, membership)
    db.commit()
    db.refresh(onboarding)
    return onboarding


@router.patch("/{membership_id}/step", response_model=OnboardingRead)
def save_onboarding_step(
    membership_id: uuid.UUID,
    data: OnboardingStepUpdate,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    if data.step < 1 or data.step > TOTAL_STEPS:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, f"step must be between 1 and {TOTAL_STEPS}"
        )

    membership = _get_owned_membership(db, membership_id, customer)
    if membership.status not in (
        MembershipStatus.ONBOARDING_PENDING,
        MembershipStatus.ONBOARDING_COMPLETE,
    ):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Onboarding isn't available for this membership yet — payment must be confirmed first",
        )

    onboarding = _get_or_create_onboarding(db, membership)

    allowed_fields = set(STEP_FIELDS.get(data.step, []))
    for field, value in data.data.items():
        if field in allowed_fields:
            setattr(onboarding, field, value)

    merged_raw = dict(onboarding.answers_raw or {})
    merged_raw.update(data.data)
    onboarding.answers_raw = merged_raw
    onboarding.current_step = max(onboarding.current_step, data.step)

    db.commit()
    db.refresh(onboarding)
    return onboarding


@router.post("/{membership_id}/complete", response_model=OnboardingCompleteResult)
def complete_onboarding(
    membership_id: uuid.UUID,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    membership = _get_owned_membership(db, membership_id, customer)
    if membership.status not in (
        MembershipStatus.ONBOARDING_PENDING,
        MembershipStatus.ONBOARDING_COMPLETE,
    ):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Onboarding isn't available for this membership yet — payment must be confirmed first",
        )

    onboarding = _get_or_create_onboarding(db, membership)
    if onboarding.goal is None or onboarding.training_location is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Please complete the goals and training sections before submitting",
        )

    if onboarding.completed_at is None:
        onboarding.completed_at = datetime.now(timezone.utc)
        membership.status = MembershipStatus.ONBOARDING_COMPLETE
        db.commit()

    everfit_account = provision(db, membership)
    db.commit()

    return OnboardingCompleteResult(
        membership_status=membership.status,
        everfit_status=everfit_account.status,
    )
