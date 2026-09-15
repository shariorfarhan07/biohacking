from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    generate_raw_token,
    hash_password,
    hash_raw_token,
    verify_password,
    verify_raw_token,
)
from app.models.admin_user import AdminUser
from app.models.customer import Customer
from app.models.password_reset_token import PasswordResetToken
from app.schemas.auth import RegisterRequest
from app.services.email_service import send_password_reset_email, send_welcome_email

PASSWORD_RESET_TOKEN_TTL = timedelta(hours=1)


def register_customer(db: Session, data: RegisterRequest) -> Customer:
    existing = db.query(Customer).filter(Customer.email == data.email.lower()).first()
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")

    customer = Customer(
        email=data.email.lower(),
        hashed_password=hash_password(data.password),
        first_name=data.first_name.strip(),
        last_name=data.last_name.strip(),
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    send_welcome_email(to=customer.email, first_name=customer.first_name)
    return customer


def authenticate_customer(db: Session, email: str, password: str) -> Customer:
    customer = db.query(Customer).filter(Customer.email == email.lower()).first()
    if customer is None or not verify_password(password, customer.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    if not customer.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "This account has been deactivated")
    return customer


def authenticate_admin(db: Session, email: str, password: str) -> AdminUser:
    admin = db.query(AdminUser).filter(AdminUser.email == email.lower()).first()
    if admin is None or not verify_password(password, admin.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    if not admin.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "This account has been deactivated")
    return admin


def change_password(
    db: Session, customer: Customer, current_password: str, new_password: str
) -> None:
    if not verify_password(current_password, customer.hashed_password):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect")
    customer.hashed_password = hash_password(new_password)
    db.commit()


def request_password_reset(db: Session, email: str) -> None:
    """Always succeeds from the caller's point of view regardless of whether the
    email exists, to avoid leaking account existence."""
    customer = db.query(Customer).filter(Customer.email == email.lower()).first()
    if customer is None:
        return

    raw_token = generate_raw_token()
    reset_token = PasswordResetToken(
        customer_id=customer.id,
        token_hash=hash_raw_token(raw_token),
        expires_at=datetime.now(timezone.utc) + PASSWORD_RESET_TOKEN_TTL,
    )
    db.add(reset_token)
    db.commit()

    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
    send_password_reset_email(to=customer.email, reset_url=reset_url)


def confirm_password_reset(db: Session, raw_token: str, new_password: str) -> None:
    now = datetime.now(timezone.utc)
    candidates = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.used_at.is_(None), PasswordResetToken.expires_at > now)
        .order_by(PasswordResetToken.created_at.desc())
        .all()
    )

    matching = next(
        (t for t in candidates if verify_raw_token(raw_token, t.token_hash)),
        None,
    )
    if matching is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "This reset link is invalid or has expired"
        )

    customer = db.get(Customer, matching.customer_id)
    if customer is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "This reset link is invalid or has expired"
        )

    customer.hashed_password = hash_password(new_password)
    matching.used_at = now
    db.commit()
