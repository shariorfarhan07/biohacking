import uuid
from collections.abc import Generator

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.security import (
    ADMIN_ACCESS_COOKIE,
    CUSTOMER_ACCESS_COOKIE,
    TokenError,
    decode_token,
)
from app.db.session import get_db as _get_db
from app.models.admin_user import AdminUser
from app.models.customer import Customer

get_db = _get_db


def get_current_customer(request: Request, db: Session = Depends(get_db)) -> Customer:
    token = request.cookies.get(CUSTOMER_ACCESS_COOKIE)
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        payload = decode_token(token, "access", "customer")
    except TokenError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired") from exc

    customer = db.get(Customer, uuid.UUID(payload["sub"]))
    if customer is None or not customer.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    return customer


def get_current_admin(request: Request, db: Session = Depends(get_db)) -> AdminUser:
    token = request.cookies.get(ADMIN_ACCESS_COOKIE)
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        payload = decode_token(token, "access", "admin")
    except TokenError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired") from exc

    admin = db.get(AdminUser, uuid.UUID(payload["sub"]))
    if admin is None or not admin.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    return admin


__all__ = ["get_db", "get_current_customer", "get_current_admin", "Generator"]
