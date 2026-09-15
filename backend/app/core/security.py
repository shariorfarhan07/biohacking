"""Password hashing, JWT issuance/verification, and auth-cookie helpers.

Two independent auth "realms" share this module: customers and admins. They are
kept isolated by using different cookie names and a `role` claim baked into every
token, so a customer session can never be mistaken for an admin one even though
both are plain JWTs signed with the same secrets.
"""

import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Literal

import jwt
from fastapi import Response
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

Role = Literal["customer", "admin"]
TokenType = Literal["access", "refresh"]


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


def generate_raw_token() -> str:
    """A random, URL-safe token for one-time-use flows (password reset)."""
    return secrets.token_urlsafe(32)


def hash_raw_token(raw_token: str) -> str:
    """Hash a one-time-use token before storing it, same primitive as passwords."""
    return pwd_context.hash(raw_token)


def verify_raw_token(raw_token: str, hashed_token: str) -> bool:
    return pwd_context.verify(raw_token, hashed_token)


def _secret_for(token_type: TokenType) -> str:
    return settings.JWT_ACCESS_SECRET if token_type == "access" else settings.JWT_REFRESH_SECRET


def create_token(subject: uuid.UUID, role: Role, token_type: TokenType) -> str:
    now = datetime.now(timezone.utc)
    if token_type == "access":
        expires_delta = timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MINUTES)
    else:
        expires_delta = timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)

    payload = {
        "sub": str(subject),
        "role": role,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, _secret_for(token_type), algorithm=settings.JWT_ALGORITHM)


class TokenError(Exception):
    pass


def decode_token(token: str, token_type: TokenType, expected_role: Role) -> dict:
    try:
        payload = jwt.decode(token, _secret_for(token_type), algorithms=[settings.JWT_ALGORITHM])
    except jwt.PyJWTError as exc:
        raise TokenError(str(exc)) from exc

    if payload.get("type") != token_type or payload.get("role") != expected_role:
        raise TokenError("Token type or role mismatch")
    return payload


# --- Cookie helpers -------------------------------------------------------
# Customer cookies are readable across the whole API (a customer's access token
# is needed on many resource paths). Admin cookies use the same broad path but a
# distinct name, so a browser can hold a customer session and an admin session
# at the same time without collision.

CUSTOMER_ACCESS_COOKIE = "access_token"
CUSTOMER_REFRESH_COOKIE = "refresh_token"
ADMIN_ACCESS_COOKIE = "admin_access_token"
ADMIN_REFRESH_COOKIE = "admin_refresh_token"


def _cookie_kwargs(max_age: int) -> dict:
    secure = settings.COOKIE_SECURE if settings.COOKIE_SECURE is not None else settings.is_production
    return {
        "httponly": True,
        "secure": secure,
        "samesite": "lax",
        "path": "/",
        "max_age": max_age,
    }


def set_auth_cookies(
    response: Response, access_token: str, refresh_token: str, *, admin: bool = False
) -> None:
    access_name = ADMIN_ACCESS_COOKIE if admin else CUSTOMER_ACCESS_COOKIE
    refresh_name = ADMIN_REFRESH_COOKIE if admin else CUSTOMER_REFRESH_COOKIE
    response.set_cookie(
        access_name, access_token, **_cookie_kwargs(settings.JWT_ACCESS_EXPIRE_MINUTES * 60)
    )
    response.set_cookie(
        refresh_name,
        refresh_token,
        **_cookie_kwargs(settings.JWT_REFRESH_EXPIRE_DAYS * 24 * 60 * 60),
    )


def clear_auth_cookies(response: Response, *, admin: bool = False) -> None:
    access_name = ADMIN_ACCESS_COOKIE if admin else CUSTOMER_ACCESS_COOKIE
    refresh_name = ADMIN_REFRESH_COOKIE if admin else CUSTOMER_REFRESH_COOKIE
    response.delete_cookie(access_name, path="/")
    response.delete_cookie(refresh_name, path="/")
