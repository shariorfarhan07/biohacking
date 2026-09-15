import os

import pytest

from app.models.assignment_rule import AssignmentRule
from app.models.programme import Programme
from app.services.rules_engine import ProgrammeAssignmentEngine, RuleEvaluationError


@pytest.fixture()
def rule_setup(db, default_programme):
    suffix = os.urandom(4).hex()
    home_programme = Programme(
        slug=f"fat-loss-home-{suffix}",
        name="Fat Loss Home",
        everfit_programme_id="efit-fl-home",
        is_active=True,
    )
    gym_programme = Programme(
        slug=f"fat-loss-gym-{suffix}",
        name="Fat Loss Gym",
        everfit_programme_id="efit-fl-gym",
        is_active=True,
    )
    db.add_all([home_programme, gym_programme])
    db.flush()

    db.add_all(
        [
            AssignmentRule(
                name=f"fat loss home low freq {suffix}",
                priority=10,
                conditions={
                    "all": [
                        {"field": "goal", "op": "eq", "value": "fat_loss"},
                        {"field": "training_location", "op": "eq", "value": "home"},
                        {"field": "training_days_per_week", "op": "in", "value": [2, 3]},
                    ]
                },
                programme_id=home_programme.id,
                is_active=True,
            ),
            AssignmentRule(
                name=f"fat loss gym {suffix}",
                priority=20,
                conditions={"all": [{"field": "goal", "op": "eq", "value": "fat_loss"}]},
                programme_id=gym_programme.id,
                is_active=True,
            ),
        ]
    )
    db.commit()
    return {"home": home_programme, "gym": gym_programme}


def test_combined_conditions_match_most_specific_rule(db, rule_setup):
    engine = ProgrammeAssignmentEngine(db)
    programme, rule = engine.evaluate_fields(
        {"goal": "fat_loss", "training_location": "home", "training_days_per_week": 3}
    )
    assert programme.id == rule_setup["home"].id
    assert rule is not None


def test_falls_back_to_less_specific_rule_when_days_dont_match(db, rule_setup):
    engine = ProgrammeAssignmentEngine(db)
    programme, rule = engine.evaluate_fields(
        {"goal": "fat_loss", "training_location": "home", "training_days_per_week": 6}
    )
    # Doesn't satisfy the low-frequency home rule (priority 10), but does match
    # the broader "fat_loss -> gym programme" rule at priority 20.
    assert programme.id == rule_setup["gym"].id


def test_falls_back_to_default_programme_when_nothing_matches(db, rule_setup, default_programme):
    engine = ProgrammeAssignmentEngine(db)
    programme, rule = engine.evaluate_fields(
        {"goal": "muscle_building", "training_location": "gym"}
    )
    assert programme.id == default_programme.id
    assert rule is None


def test_malformed_rule_is_skipped_not_fatal(db, default_programme):
    bad_programme = Programme(
        slug=f"bad-{os.urandom(4).hex()}", name="Bad", everfit_programme_id="x", is_active=True
    )
    db.add(bad_programme)
    db.flush()
    db.add(
        AssignmentRule(
            name=f"malformed-{os.urandom(4).hex()}",
            priority=1,
            conditions={"all": [{"field": "goal"}]},  # missing "op" — malformed
            programme_id=bad_programme.id,
            is_active=True,
        )
    )
    db.commit()

    engine = ProgrammeAssignmentEngine(db)
    programme, rule = engine.evaluate_fields({"goal": "general_health"})
    assert programme.id == default_programme.id


def test_raises_when_no_match_and_no_default_programme_configured(db, monkeypatch):
    from app.core.config import settings

    monkeypatch.setattr(settings, "DEFAULT_PROGRAMME_SLUG", f"no-such-slug-{os.urandom(4).hex()}")

    engine = ProgrammeAssignmentEngine(db)
    with pytest.raises(RuleEvaluationError):
        engine.evaluate_fields({"goal": "nonexistent_goal"})
