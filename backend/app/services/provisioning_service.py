"""Orchestrates turning a paid, onboarded membership into an active Everfit
client. This is the trickiest correctness-sensitive piece in the app: it must be
safe to call more than once for the same membership (webhook replay, an admin
retry, or a race between the Stripe webhook and onboarding completion) without
ever creating a duplicate Everfit client or re-assigning a programme twice.

Idempotency strategy: each step gates on the *data already persisted* on the
EverfitAccount row (not on a status enum, which failures can leave in an
ambiguous place), so a retry always resumes from the first incomplete step.
"""

import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.enums import EverfitStatus, MembershipStatus
from app.models.everfit_account import EverfitAccount
from app.models.membership import Membership
from app.services.everfit.base import EverfitServiceError
from app.services.everfit.factory import get_everfit_service
from app.services.rules_engine import ProgrammeAssignmentEngine, RuleEvaluationError

logger = logging.getLogger(__name__)


def notify_admin_of_failure(membership: Membership, error: str) -> None:
    """Extension point for a real alert (email/Slack) once one is wired up —
    logging for now guarantees a failure is never silent, and it's also what
    surfaces the membership in the admin 'Requires Attention' queue via its
    status."""
    logger.error("Everfit provisioning failed for membership %s: %s", membership.id, error)


def provision(db: Session, membership: Membership) -> EverfitAccount:
    onboarding = membership.onboarding_response
    if onboarding is None or onboarding.completed_at is None:
        raise ValueError("Cannot provision a membership without completed onboarding")

    account = membership.everfit_account
    if account is None:
        account = EverfitAccount(membership_id=membership.id)
        db.add(account)
        membership.everfit_account = account
        db.flush()

    if account.status == EverfitStatus.ACTIVATED:
        return account  # already fully provisioned — nothing to do

    membership.status = MembershipStatus.PROVISIONING
    account.attempt_count += 1
    account.last_attempted_at = datetime.now(timezone.utc)
    account.last_error = None
    db.flush()

    everfit = get_everfit_service()
    customer = membership.customer

    try:
        if not account.everfit_client_id:
            client = everfit.create_client(
                external_customer_id=str(customer.id),
                email=customer.email,
                first_name=customer.first_name,
                last_name=customer.last_name,
            )
            account.everfit_client_id = client.everfit_client_id
            account.status = EverfitStatus.CLIENT_CREATED
            db.flush()

        if account.programme_id is None:
            engine = ProgrammeAssignmentEngine(db)
            programme, matched_rule = engine.evaluate(onboarding)
            if not programme.everfit_programme_id:
                raise EverfitServiceError(
                    f"Programme '{programme.slug}' has no everfit_programme_id configured"
                )
            everfit.assign_programme(
                everfit_client_id=account.everfit_client_id,
                everfit_programme_id=programme.everfit_programme_id,
            )
            account.programme_id = programme.id
            account.matched_rule_id = matched_rule.id if matched_rule else None
            account.status = EverfitStatus.PROGRAMME_ASSIGNED
            db.flush()

        activation = everfit.activate_client(everfit_client_id=account.everfit_client_id)
        account.access_url = activation.access_url
        account.status = EverfitStatus.ACTIVATED
        account.activated_at = datetime.now(timezone.utc)
        membership.status = MembershipStatus.PROVISIONED
        db.flush()
        return account

    except (EverfitServiceError, RuleEvaluationError) as exc:
        account.status = EverfitStatus.FAILED
        account.last_error = str(exc)
        membership.status = MembershipStatus.PROVISIONING_FAILED
        db.flush()
        notify_admin_of_failure(membership, str(exc))
        return account
