import os
from datetime import datetime, timezone

from app.core.security import hash_password
from app.models.customer import Customer
from app.models.enums import EverfitStatus, Goal, MembershipStatus, TrainingLocation
from app.models.membership import Membership
from app.models.onboarding import OnboardingResponse
from app.models.programme import Programme
from app.services.provisioning_service import provision


def _make_membership(db, sample_package, default_programme, *, with_everfit_id=True):
    suffix = os.urandom(4).hex()
    customer = Customer(
        email=f"provision-{suffix}@test.com",
        hashed_password=hash_password("password123"),
        first_name="Prov",
        last_name="Test",
    )
    db.add(customer)
    db.flush()

    membership = Membership(
        customer_id=customer.id,
        package_id=sample_package.id,
        status=MembershipStatus.ONBOARDING_COMPLETE,
    )
    db.add(membership)
    db.flush()

    onboarding = OnboardingResponse(
        membership_id=membership.id,
        goal=Goal.GENERAL_HEALTH,
        training_location=TrainingLocation.GYM,
        training_days_per_week=3,
        completed_at=datetime.now(timezone.utc),
    )
    db.add(onboarding)
    membership.onboarding_response = onboarding
    db.commit()
    db.refresh(membership)
    return membership


def test_provision_activates_membership_end_to_end(db, sample_package, default_programme):
    membership = _make_membership(db, sample_package, default_programme)

    account = provision(db, membership)

    assert account.status == EverfitStatus.ACTIVATED
    assert account.everfit_client_id is not None
    assert account.access_url is not None
    assert membership.status == MembershipStatus.PROVISIONED


def test_provision_is_idempotent_on_repeat_calls(db, sample_package, default_programme):
    membership = _make_membership(db, sample_package, default_programme)

    first = provision(db, membership)
    first_client_id = first.everfit_client_id
    first_attempts = first.attempt_count

    second = provision(db, membership)

    assert second.everfit_client_id == first_client_id
    assert second.status == EverfitStatus.ACTIVATED
    # Already-activated accounts short-circuit before incrementing attempt_count.
    assert second.attempt_count == first_attempts


def test_provision_fails_gracefully_when_programme_misconfigured(db, sample_package):
    broken_programme = Programme(
        slug=f"broken-{os.urandom(4).hex()}",
        name="Broken",
        everfit_programme_id=None,  # misconfigured on purpose
        is_active=True,
    )
    db.add(broken_programme)
    db.flush()

    from app.core.config import settings

    original_slug = settings.DEFAULT_PROGRAMME_SLUG
    settings.DEFAULT_PROGRAMME_SLUG = broken_programme.slug
    try:
        membership = _make_membership(db, sample_package, broken_programme)
        account = provision(db, membership)
    finally:
        settings.DEFAULT_PROGRAMME_SLUG = original_slug

    assert account.status == EverfitStatus.FAILED
    assert account.last_error is not None
    assert membership.status == MembershipStatus.PROVISIONING_FAILED


def test_provision_raises_without_completed_onboarding(db, sample_package, default_programme):
    import pytest

    customer = Customer(
        email=f"noonboarding-{os.urandom(4).hex()}@test.com",
        hashed_password=hash_password("password123"),
        first_name="No",
        last_name="Onboarding",
    )
    db.add(customer)
    db.flush()
    membership = Membership(
        customer_id=customer.id,
        package_id=sample_package.id,
        status=MembershipStatus.ONBOARDING_PENDING,
    )
    db.add(membership)
    db.commit()

    with pytest.raises(ValueError):
        provision(db, membership)
