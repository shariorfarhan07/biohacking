from app.models.customer import Customer
from app.models.enums import MembershipStatus
from app.models.membership import Membership
from tests.conftest import register_and_login


def _create_onboarding_ready_membership(client, db, sample_package, email: str) -> str:
    register_and_login(client, email)
    customer = db.query(Customer).filter(Customer.email == email).one()
    membership = Membership(
        customer_id=customer.id,
        package_id=sample_package.id,
        status=MembershipStatus.ONBOARDING_PENDING,
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return str(membership.id)


def test_onboarding_step_save_and_resume(client, db, sample_package):
    membership_id = _create_onboarding_ready_membership(
        client, db, sample_package, "onboard-user@test.com"
    )

    step1 = client.patch(
        f"/api/onboarding/{membership_id}/step",
        json={"step": 1, "data": {"goal": "fat_loss", "target_weight_kg": 80}},
    )
    assert step1.status_code == 200, step1.text
    assert step1.json()["goal"] == "fat_loss"
    assert step1.json()["current_step"] == 1

    step3 = client.patch(
        f"/api/onboarding/{membership_id}/step",
        json={
            "step": 3,
            "data": {"training_location": "home", "training_days_per_week": 3},
        },
    )
    assert step3.status_code == 200
    assert step3.json()["training_location"] == "home"
    assert step3.json()["current_step"] == 3

    resumed = client.get(f"/api/onboarding/{membership_id}")
    assert resumed.status_code == 200
    assert resumed.json()["goal"] == "fat_loss"
    assert resumed.json()["training_days_per_week"] == 3


def test_onboarding_step_ignores_fields_outside_allowlist(client, db, sample_package):
    membership_id = _create_onboarding_ready_membership(
        client, db, sample_package, "onboard-allowlist@test.com"
    )
    response = client.patch(
        f"/api/onboarding/{membership_id}/step",
        json={"step": 1, "data": {"goal": "fat_loss", "injuries": "should not be settable here"}},
    )
    assert response.status_code == 200
    assert response.json()["injuries"] is None


def test_complete_onboarding_triggers_provisioning(client, db, sample_package, default_programme):
    membership_id = _create_onboarding_ready_membership(
        client, db, sample_package, "onboard-complete@test.com"
    )
    client.patch(
        f"/api/onboarding/{membership_id}/step",
        json={"step": 1, "data": {"goal": "general_health"}},
    )
    client.patch(
        f"/api/onboarding/{membership_id}/step",
        json={"step": 3, "data": {"training_location": "gym", "training_days_per_week": 4}},
    )

    complete = client.post(f"/api/onboarding/{membership_id}/complete")
    assert complete.status_code == 200, complete.text
    body = complete.json()
    assert body["membership_status"] == "provisioned"
    assert body["everfit_status"] == "activated"

    everfit_status = client.get("/api/everfit/status")
    assert everfit_status.status_code == 200
    assert everfit_status.json()["status"] == "activated"
    assert everfit_status.json()["access_url"] is not None


def test_complete_onboarding_requires_goal_and_location(client, db, sample_package):
    membership_id = _create_onboarding_ready_membership(
        client, db, sample_package, "onboard-incomplete@test.com"
    )
    response = client.post(f"/api/onboarding/{membership_id}/complete")
    assert response.status_code == 400


def test_onboarding_step_rejects_before_payment_confirmed(client, db, sample_package):
    register_and_login(client, "onboard-unpaid@test.com")
    customer = db.query(Customer).filter(Customer.email == "onboard-unpaid@test.com").one()
    membership = Membership(
        customer_id=customer.id,
        package_id=sample_package.id,
        status=MembershipStatus.PENDING_PAYMENT,
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)

    response = client.patch(
        f"/api/onboarding/{membership.id}/step", json={"step": 1, "data": {"goal": "fat_loss"}}
    )
    assert response.status_code == 400


def test_onboarding_of_other_customers_membership_is_404(client, db, sample_package):
    membership_id = _create_onboarding_ready_membership(
        client, db, sample_package, "onboard-owner@test.com"
    )
    client.post("/api/auth/logout")
    register_and_login(client, "onboard-intruder@test.com")

    response = client.get(f"/api/onboarding/{membership_id}")
    assert response.status_code == 404
