from types import SimpleNamespace
from unittest.mock import patch

from tests.conftest import register_and_login


class FakeStripeEvent(dict):
    def to_dict(self):
        return dict(self)


def _make_checkout_completed_event(
    event_id: str, session_id: str, membership_id: str
) -> FakeStripeEvent:
    return FakeStripeEvent(
        {
            "id": event_id,
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": session_id,
                    "subscription": "sub_test_123",
                    "payment_intent": "pi_test_123",
                    "metadata": {"membership_id": membership_id},
                }
            },
        }
    )


def _create_pending_membership(client, sample_package, email: str) -> tuple[str, str]:
    register_and_login(client, email)
    fake_session = SimpleNamespace(id=f"cs_{email}", url="https://checkout.stripe.com/test")
    with (
        patch(
            "app.api.routes.checkout.stripe_service.ensure_stripe_customer", return_value="cus_x"
        ),
        patch(
            "app.api.routes.checkout.stripe_service.create_checkout_session",
            return_value=fake_session,
        ),
    ):
        response = client.post("/api/checkout/session", json={"package_id": str(sample_package.id)})
    checkout_url = response.json()["checkout_url"]
    status_response = client.get(f"/api/checkout/session/cs_{email}/status")
    membership_id = status_response.json()["membership_id"]
    return f"cs_{email}", membership_id


def test_webhook_activates_membership_and_is_idempotent(client, sample_package, db):
    session_id, membership_id = _create_pending_membership(
        client, sample_package, "webhook-user@test.com"
    )

    event = _make_checkout_completed_event("evt_test_1", session_id, membership_id)

    with patch(
        "app.api.routes.webhooks_stripe.stripe_service.verify_and_construct_event",
        return_value=event,
    ):
        first = client.post(
            "/api/webhooks/stripe", content=b"{}", headers={"Stripe-Signature": "t=1,v1=fake"}
        )
    assert first.status_code == 200
    assert first.json()["status"] == "processed"

    status_response = client.get(f"/api/checkout/session/{session_id}/status")
    assert status_response.json()["status"] == "onboarding_pending"

    from app.models.webhook_event import WebhookEvent

    assert db.query(WebhookEvent).filter(WebhookEvent.stripe_event_id == "evt_test_1").count() == 1

    # Replaying the exact same event must be a no-op, not double-processed.
    with patch(
        "app.api.routes.webhooks_stripe.stripe_service.verify_and_construct_event",
        return_value=event,
    ):
        second = client.post(
            "/api/webhooks/stripe", content=b"{}", headers={"Stripe-Signature": "t=1,v1=fake"}
        )
    assert second.status_code == 200
    assert second.json()["status"] == "already_processed"
    assert db.query(WebhookEvent).filter(WebhookEvent.stripe_event_id == "evt_test_1").count() == 1


def test_webhook_missing_signature_rejected(client):
    response = client.post("/api/webhooks/stripe", content=b"{}")
    assert response.status_code == 400


def test_webhook_invalid_signature_rejected(client):
    with patch(
        "app.api.routes.webhooks_stripe.stripe_service.verify_and_construct_event",
        side_effect=ValueError("bad signature"),
    ):
        response = client.post(
            "/api/webhooks/stripe", content=b"{}", headers={"Stripe-Signature": "bad"}
        )
    assert response.status_code == 400
