"""Real Stripe SDK integration. Every call here talks to Stripe directly — there
is no mock mode for payments, per the rule that a payment must never be faked.
`STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` come from the environment only and
never reach the frontend; the frontend only ever receives the resulting
`checkout_url`/`portal_url` strings.
"""

import uuid

import stripe

from app.core.config import settings
from app.models.customer import Customer
from app.models.discount_code import DiscountCode
from app.models.package import Package

stripe.api_key = settings.STRIPE_SECRET_KEY


def ensure_stripe_customer(customer: Customer) -> str:
    """Idempotent lookup-then-create: reuses `customer.stripe_customer_id` if set,
    otherwise creates a new Stripe Customer and returns its id for the caller to
    persist."""

    if customer.stripe_customer_id:
        return customer.stripe_customer_id

    stripe_customer = stripe.Customer.create(
        email=customer.email,
        name=customer.full_name,
        metadata={"customer_id": str(customer.id)},
    )
    return stripe_customer.id


def create_checkout_session(
    *,
    customer: Customer,
    stripe_customer_id: str,
    package: Package,
    membership_id: uuid.UUID,
    discount_code: DiscountCode | None = None,
) -> stripe.checkout.Session:
    if not package.stripe_price_id:
        raise ValueError(f"Package '{package.slug}' has no stripe_price_id configured")

    kwargs: dict = {
        "mode": "subscription",
        "customer": stripe_customer_id,
        "line_items": [{"price": package.stripe_price_id, "quantity": 1}],
        "success_url": (
            f"{settings.FRONTEND_URL}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
        ),
        "cancel_url": f"{settings.FRONTEND_URL}/checkout/canceled",
        "metadata": {"membership_id": str(membership_id), "customer_id": str(customer.id)},
        "subscription_data": {
            "metadata": {"membership_id": str(membership_id), "customer_id": str(customer.id)}
        },
    }

    if discount_code and discount_code.stripe_coupon_id:
        kwargs["discounts"] = [{"coupon": discount_code.stripe_coupon_id}]

    return stripe.checkout.Session.create(**kwargs)


def retrieve_checkout_session(session_id: str) -> stripe.checkout.Session:
    return stripe.checkout.Session.retrieve(session_id)


def create_billing_portal_session(*, stripe_customer_id: str) -> stripe.billing_portal.Session:
    return stripe.billing_portal.Session.create(
        customer=stripe_customer_id,
        return_url=f"{settings.FRONTEND_URL}/dashboard/billing",
    )


def create_refund(*, payment_intent_id: str, reason: str | None = None) -> stripe.Refund:
    return stripe.Refund.create(
        payment_intent=payment_intent_id,
        metadata={"reason": reason} if reason else None,
    )


def cancel_subscription(*, stripe_subscription_id: str) -> stripe.Subscription:
    return stripe.Subscription.cancel(stripe_subscription_id)


def verify_and_construct_event(*, payload: bytes, signature_header: str) -> stripe.Event:
    return stripe.Webhook.construct_event(payload, signature_header, settings.STRIPE_WEBHOOK_SECRET)
