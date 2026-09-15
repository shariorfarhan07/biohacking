"""Stripe webhook state machine.

Flow: verify signature -> insert-or-detect a WebhookEvent by stripe_event_id
(idempotency gate, before any side effect) -> dispatch on event.type -> update
Membership.status -> mark the event processed. Dispatch logic is itself
idempotent per-membership, so re-delivering the same event (Stripe's automatic
retries, or a manual replay) is always safe.

Always returns 200 once the signature is valid, even if a specific event's
dispatch failed internally, so Stripe doesn't hammer us with retries for an
error that persists — the failure is recorded on the WebhookEvent row instead
for later inspection, and never surfaces to any customer.
"""

import logging
from datetime import datetime, timezone

import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models.enums import MembershipStatus
from app.models.membership import Membership
from app.models.webhook_event import WebhookEvent
from app.services import stripe_service

logger = logging.getLogger("app.webhooks.stripe")

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def _find_membership_for_session(db: Session, session: dict) -> Membership | None:
    membership = (
        db.query(Membership)
        .filter(Membership.stripe_checkout_session_id == session.get("id"))
        .first()
    )
    if membership is not None:
        return membership
    membership_id = (session.get("metadata") or {}).get("membership_id")
    if membership_id:
        return db.get(Membership, membership_id)
    return None


def _find_membership_for_subscription(
    db: Session, subscription_id: str | None
) -> Membership | None:
    if not subscription_id:
        return None
    return db.query(Membership).filter(Membership.stripe_subscription_id == subscription_id).first()


def _handle_checkout_completed(db: Session, event_object: dict) -> None:
    membership = _find_membership_for_session(db, event_object)
    if membership is None:
        logger.warning(
            "checkout.session.completed with no matching membership: %s", event_object.get("id")
        )
        return

    membership.stripe_subscription_id = event_object.get("subscription")
    membership.stripe_latest_payment_intent_id = event_object.get("payment_intent")
    if membership.status == MembershipStatus.PENDING_PAYMENT:
        membership.status = MembershipStatus.ONBOARDING_PENDING
        membership.activated_at = datetime.now(timezone.utc)
    db.commit()


def _handle_invoice_payment_failed(db: Session, event_object: dict) -> None:
    membership = _find_membership_for_subscription(db, event_object.get("subscription"))
    if membership is None:
        return
    membership.status = MembershipStatus.PAYMENT_FAILED
    db.commit()


def _handle_invoice_paid(db: Session, event_object: dict) -> None:
    membership = _find_membership_for_subscription(db, event_object.get("subscription"))
    if membership is None:
        return

    payment_intent = event_object.get("payment_intent")
    if payment_intent:
        membership.stripe_latest_payment_intent_id = payment_intent

    if membership.status == MembershipStatus.PAYMENT_FAILED:
        # Payment recovered — put the membership back on the pipeline stage its
        # onboarding/provisioning state implies, rather than assuming it was new.
        everfit_account = membership.everfit_account
        onboarding = membership.onboarding_response
        if everfit_account is not None and everfit_account.status.value == "activated":
            membership.status = MembershipStatus.PROVISIONED
        elif onboarding is not None and onboarding.completed_at is not None:
            membership.status = MembershipStatus.ONBOARDING_COMPLETE
        else:
            membership.status = MembershipStatus.ONBOARDING_PENDING
    db.commit()


def _handle_subscription_deleted(db: Session, event_object: dict) -> None:
    membership = _find_membership_for_subscription(db, event_object.get("id"))
    if membership is None:
        return
    membership.status = MembershipStatus.CANCELED
    membership.canceled_at = datetime.now(timezone.utc)
    db.commit()


def _handle_charge_refunded(db: Session, event_object: dict) -> None:
    payment_intent_id = event_object.get("payment_intent")
    if not payment_intent_id:
        return
    membership = (
        db.query(Membership)
        .filter(Membership.stripe_latest_payment_intent_id == payment_intent_id)
        .first()
    )
    if membership is None:
        return
    membership.status = MembershipStatus.REFUNDED
    db.commit()


_HANDLERS = {
    "checkout.session.completed": _handle_checkout_completed,
    "invoice.payment_failed": _handle_invoice_payment_failed,
    "invoice.paid": _handle_invoice_paid,
    "customer.subscription.deleted": _handle_subscription_deleted,
    "charge.refunded": _handle_charge_refunded,
}


@router.post("/stripe", status_code=status.HTTP_200_OK)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
    db: Session = Depends(get_db),
):
    payload = await request.body()

    if not stripe_signature:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Missing Stripe-Signature header")

    try:
        event = stripe_service.verify_and_construct_event(
            payload=payload, signature_header=stripe_signature
        )
    except (ValueError, stripe.error.SignatureVerificationError) as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid webhook signature") from exc

    webhook_event = WebhookEvent(
        stripe_event_id=event["id"], event_type=event["type"], payload=event.to_dict()
    )
    db.add(webhook_event)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        existing = (
            db.query(WebhookEvent).filter(WebhookEvent.stripe_event_id == event["id"]).first()
        )
        if existing is not None and existing.processed_at is not None:
            return {"status": "already_processed"}
        webhook_event = existing

    handler = _HANDLERS.get(event["type"])
    if handler is not None:
        try:
            handler(db, event["data"]["object"])
        except Exception as exc:  # noqa: BLE001 - must not raise; Stripe retries on non-2xx
            db.rollback()
            webhook_event.processing_error = str(exc)
            db.commit()
            logger.exception("Failed to process Stripe webhook %s (%s)", event["id"], event["type"])
            return {"status": "processing_error"}

    webhook_event.processed_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "processed"}
