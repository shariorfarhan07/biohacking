"""Data-driven programme-assignment engine.

Rules live in the `assignment_rules` table (see app/models/assignment_rule.py),
not in code, so admins can tune matching from `/admin/assignment-rules` without a
deploy. Each rule's `conditions` is a JSON predicate tree combining leaf
conditions with `all`/`any` groups, e.g. "Fat Loss + Home + 3 Days":

    {"all": [
        {"field": "goal", "op": "eq", "value": "fat_loss"},
        {"field": "training_location", "op": "eq", "value": "home"},
        {"field": "training_days_per_week", "op": "in", "value": [3]}
    ]}

Rules are evaluated in ascending `priority` order; the first full match wins. If
nothing matches, a configured default programme is used instead of raising, so a
malformed or incomplete rule set can never dead-end a paying customer.
"""

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.assignment_rule import AssignmentRule
from app.models.onboarding import OnboardingResponse
from app.models.programme import Programme


class RuleEvaluationError(Exception):
    pass


def _eval_condition(condition: dict, fields: dict) -> bool:
    if "all" in condition:
        return all(_eval_condition(c, fields) for c in condition["all"])
    if "any" in condition:
        return any(_eval_condition(c, fields) for c in condition["any"])

    field = condition.get("field")
    op = condition.get("op")
    value = condition.get("value")
    if field is None or op is None:
        raise RuleEvaluationError("Condition is missing 'field' or 'op'")

    actual = fields.get(field)
    if actual is None:
        return False

    if op == "eq":
        return actual == value
    if op == "ne":
        return actual != value
    if op == "in":
        return actual in value
    if op == "not_in":
        return actual not in value
    if op == "gte":
        return actual >= value
    if op == "lte":
        return actual <= value
    if op == "gt":
        return actual > value
    if op == "lt":
        return actual < value
    if op == "between":
        low, high = value
        return low <= actual <= high
    if op == "contains":
        return isinstance(actual, list) and value in actual
    raise RuleEvaluationError(f"Unknown operator '{op}'")


def fields_from_onboarding(onboarding: OnboardingResponse) -> dict:
    return {
        "goal": onboarding.goal.value if onboarding.goal else None,
        "training_location": (
            onboarding.training_location.value if onboarding.training_location else None
        ),
        "training_days_per_week": onboarding.training_days_per_week,
        "training_experience": (
            onboarding.training_experience.value if onboarding.training_experience else None
        ),
        "equipment": onboarding.equipment or [],
        "age": onboarding.age,
    }


class ProgrammeAssignmentEngine:
    def __init__(self, db: Session):
        self.db = db

    def evaluate_fields(self, fields: dict) -> tuple[Programme, AssignmentRule | None]:
        rules = (
            self.db.query(AssignmentRule)
            .filter(AssignmentRule.is_active.is_(True))
            .order_by(AssignmentRule.priority.asc())
            .all()
        )

        for rule in rules:
            try:
                matched = _eval_condition(rule.conditions, fields)
            except RuleEvaluationError:
                # A malformed rule must never break provisioning for a paying
                # customer — skip it and keep evaluating lower-priority rules.
                continue
            if not matched:
                continue
            programme = self.db.get(Programme, rule.programme_id)
            if programme is not None and programme.is_active:
                return programme, rule

        default_programme = (
            self.db.query(Programme)
            .filter(
                Programme.slug == settings.DEFAULT_PROGRAMME_SLUG,
                Programme.is_active.is_(True),
            )
            .first()
        )
        if default_programme is None:
            raise RuleEvaluationError(
                "No assignment rule matched and the default programme "
                f"'{settings.DEFAULT_PROGRAMME_SLUG}' does not exist or is inactive"
            )
        return default_programme, None

    def evaluate(self, onboarding: OnboardingResponse) -> tuple[Programme, AssignmentRule | None]:
        return self.evaluate_fields(fields_from_onboarding(onboarding))
