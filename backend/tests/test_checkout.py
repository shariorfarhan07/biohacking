from types import SimpleNamespace
from unittest.mock import patch

from tests.conftest import register_and_login


def test_create_checkout_session_returns_redirect_url(client, sample_package):
    register_and_login(client, "checkout-user@test.com")

    fake_session = SimpleNamespace(id="cs_test_123", url="https://checkout.stripe.com/test")

    with (
        patch(
            "app.api.routes.checkout.stripe_service.ensure_stripe_customer", return_value="cus_123"
        ),
        patch(
            "app.api.routes.checkout.stripe_service.create_checkout_session",
            return_value=fake_session,
        ),
    ):
        response = client.post("/api/checkout/session", json={"package_id": str(sample_package.id)})

    assert response.status_code == 200, response.text
    assert response.json()["checkout_url"] == "https://checkout.stripe.com/test"


def test_checkout_session_status_reflects_membership(client, sample_package):
    register_and_login(client, "checkout-status@test.com")

    fake_session = SimpleNamespace(id="cs_test_456", url="https://checkout.stripe.com/test2")
    with (
        patch(
            "app.api.routes.checkout.stripe_service.ensure_stripe_customer", return_value="cus_456"
        ),
        patch(
            "app.api.routes.checkout.stripe_service.create_checkout_session",
            return_value=fake_session,
        ),
    ):
        client.post("/api/checkout/session", json={"package_id": str(sample_package.id)})

    status_response = client.get("/api/checkout/session/cs_test_456/status")
    assert status_response.status_code == 200
    assert status_response.json()["status"] == "pending_payment"


def test_checkout_requires_authentication(client, sample_package):
    response = client.post("/api/checkout/session", json={"package_id": str(sample_package.id)})
    assert response.status_code == 401


def test_checkout_rejects_unknown_package(client):
    register_and_login(client, "checkout-badpkg@test.com")
    response = client.post(
        "/api/checkout/session", json={"package_id": "00000000-0000-0000-0000-000000000000"}
    )
    assert response.status_code == 404
