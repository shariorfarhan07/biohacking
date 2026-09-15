from unittest.mock import patch

from app.models.customer import Customer
from app.models.enums import MembershipStatus
from app.models.membership import Membership
from tests.conftest import register_and_login


def _admin_login(client, admin_user):
    response = client.post(
        "/api/admin/auth/login", json={"email": admin_user.email, "password": "adminpass123"}
    )
    assert response.status_code == 200, response.text


def _create_membership(
    client, db, sample_package, email: str, status: MembershipStatus
) -> Membership:
    register_and_login(client, email)
    client.post("/api/auth/logout")
    customer = db.query(Customer).filter(Customer.email == email).one()
    membership = Membership(customer_id=customer.id, package_id=sample_package.id, status=status)
    membership.stripe_latest_payment_intent_id = "pi_admin_test"
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership


def test_admin_requires_authentication(client):
    response = client.get("/api/admin/customers")
    assert response.status_code == 401


def test_admin_can_list_and_filter_customers(client, db, sample_package, admin_user):
    _create_membership(
        client, db, sample_package, "admin-list-1@test.com", MembershipStatus.PAYMENT_FAILED
    )
    _create_membership(
        client, db, sample_package, "admin-list-2@test.com", MembershipStatus.PROVISIONED
    )
    _admin_login(client, admin_user)

    all_customers = client.get("/api/admin/customers")
    assert all_customers.status_code == 200
    assert all_customers.json()["total"] >= 2

    failed_only = client.get("/api/admin/customers", params={"status": "payment_failed"})
    assert failed_only.status_code == 200
    emails = [item["email"] for item in failed_only.json()["items"]]
    assert "admin-list-1@test.com" in emails
    assert "admin-list-2@test.com" not in emails


def test_admin_customer_detail(client, db, sample_package, admin_user):
    membership = _create_membership(
        client, db, sample_package, "admin-detail@test.com", MembershipStatus.ONBOARDING_PENDING
    )
    _admin_login(client, admin_user)

    response = client.get(f"/api/admin/customers/{membership.id}")
    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "admin-detail@test.com"
    assert body["membership_status"] == "onboarding_pending"


def test_admin_refund_updates_status_and_writes_audit_log(client, db, sample_package, admin_user):
    membership = _create_membership(
        client, db, sample_package, "admin-refund@test.com", MembershipStatus.PROVISIONED
    )
    _admin_login(client, admin_user)

    with (patch("app.api.routes.admin_customers.stripe_service.create_refund") as mock_refund,):
        response = client.post(
            f"/api/admin/customers/{membership.id}/refund",
            json={"reason": "Customer requested cancellation", "cancel_subscription": False},
        )
    assert response.status_code == 200, response.text
    mock_refund.assert_called_once()

    db.refresh(membership)
    assert membership.status == MembershipStatus.REFUNDED

    from app.models.audit_log import AdminAuditLog

    logs = db.query(AdminAuditLog).filter(AdminAuditLog.target_membership_id == membership.id).all()
    assert any(log.action == "refund_issued" for log in logs)


def test_admin_refund_without_payment_intent_is_rejected(client, db, sample_package, admin_user):
    membership = _create_membership(
        client, db, sample_package, "admin-norefund@test.com", MembershipStatus.PROVISIONED
    )
    membership.stripe_latest_payment_intent_id = None
    db.commit()
    _admin_login(client, admin_user)

    response = client.post(
        f"/api/admin/customers/{membership.id}/refund",
        json={"reason": "test", "cancel_subscription": False},
    )
    assert response.status_code == 400


def test_admin_can_filter_by_everfit_active_and_programme_assigned(
    client, db, sample_package, default_programme, admin_user
):
    from datetime import datetime, timezone

    from app.models.enums import EverfitStatus
    from app.models.everfit_account import EverfitAccount

    activated = _create_membership(
        client, db, sample_package, "admin-everfit-active@test.com", MembershipStatus.PROVISIONED
    )
    db.add(
        EverfitAccount(
            membership_id=activated.id,
            everfit_client_id="mock_client_test",
            programme_id=default_programme.id,
            status=EverfitStatus.ACTIVATED,
            access_url="https://app.everfit.io/client/mock_client_test",
            activated_at=datetime.now(timezone.utc),
        )
    )
    not_yet = _create_membership(
        client,
        db,
        sample_package,
        "admin-everfit-pending@test.com",
        MembershipStatus.ONBOARDING_PENDING,
    )
    db.commit()

    _admin_login(client, admin_user)

    active_filtered = client.get("/api/admin/customers", params={"status": "everfit_active"})
    assert active_filtered.status_code == 200
    emails = [item["email"] for item in active_filtered.json()["items"]]
    assert "admin-everfit-active@test.com" in emails
    assert "admin-everfit-pending@test.com" not in emails

    programme_filtered = client.get("/api/admin/customers", params={"status": "programme_assigned"})
    assert programme_filtered.status_code == 200
    emails2 = [item["email"] for item in programme_filtered.json()["items"]]
    assert "admin-everfit-active@test.com" in emails2
    assert "admin-everfit-pending@test.com" not in emails2

    detail = client.get(f"/api/admin/customers/{activated.id}")
    assert detail.status_code == 200
    assert detail.json()["everfit_status"] == "activated"
    assert detail.json()["everfit_programme_name"] == default_programme.name


def test_requires_attention_lists_failed_provisioning(client, db, sample_package, admin_user):
    _create_membership(
        client, db, sample_package, "admin-attention@test.com", MembershipStatus.PROVISIONING_FAILED
    )
    _admin_login(client, admin_user)

    response = client.get("/api/admin/customers/requires-attention")
    assert response.status_code == 200
    emails = [item["email"] for item in response.json()["items"]]
    assert "admin-attention@test.com" in emails
