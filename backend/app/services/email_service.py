"""Abstracted email sender. The dev backend logs to the console instead of
sending real mail — swap `send_email` for a real provider (SES/Postmark/etc.)
call behind this same signature when one is configured."""

import logging

logger = logging.getLogger("app.email")


def send_email(*, to: str, subject: str, body: str) -> None:
    logger.info("EMAIL to=%s subject=%r\n%s", to, subject, body)


def send_welcome_email(*, to: str, first_name: str) -> None:
    send_email(
        to=to,
        subject="Welcome - let's get your coaching started",
        body=(
            f"Hi {first_name},\n\n"
            "Your account has been created. Once your payment is confirmed you'll be "
            "guided straight into your onboarding assessment.\n\nWelcome aboard."
        ),
    )


def send_password_reset_email(*, to: str, reset_url: str) -> None:
    send_email(
        to=to,
        subject="Reset your password",
        body=(
            "We received a request to reset your password. This link expires in 1 hour:\n\n"
            f"{reset_url}\n\nIf you didn't request this, you can safely ignore this email."
        ),
    )


def send_everfit_activated_email(*, to: str, first_name: str, programme_name: str) -> None:
    send_email(
        to=to,
        subject="Your coaching account is ready",
        body=(
            f"Hi {first_name},\n\n"
            f"Your coaching account is ready and you've been assigned to the "
            f"{programme_name} programme. Open Everfit to get started."
        ),
    )


def send_ticket_reply_email(*, to: str, first_name: str, subject: str) -> None:
    send_email(
        to=to,
        subject=f"New reply on your support ticket: {subject}",
        body=(
            f"Hi {first_name},\n\n"
            f"You've got a new reply on your support ticket \"{subject}\". "
            "Log in to your dashboard to view it and reply."
        ),
    )
