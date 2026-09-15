import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_db
from app.core.security import (
    ADMIN_REFRESH_COOKIE,
    TokenError,
    clear_auth_cookies,
    create_token,
    decode_token,
    set_auth_cookies,
)
from app.models.admin_user import AdminUser
from app.schemas.auth import AdminLoginRequest, AdminPublic
from app.schemas.common import MessageResponse
from app.services import auth_service

router = APIRouter(prefix="/admin/auth", tags=["admin-auth"])


def _issue_admin_session(response: Response, admin: AdminUser) -> None:
    access_token = create_token(admin.id, "admin", "access")
    refresh_token = create_token(admin.id, "admin", "refresh")
    set_auth_cookies(response, access_token, refresh_token, admin=True)


@router.post("/login", response_model=AdminPublic)
def admin_login(data: AdminLoginRequest, response: Response, db: Session = Depends(get_db)):
    admin = auth_service.authenticate_admin(db, data.email, data.password)
    _issue_admin_session(response, admin)
    return admin


@router.post("/refresh", response_model=MessageResponse)
def admin_refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get(ADMIN_REFRESH_COOKIE)
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        payload = decode_token(token, "refresh", "admin")
    except TokenError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired") from exc

    admin = db.get(AdminUser, uuid.UUID(payload["sub"]))
    if admin is None or not admin.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")

    _issue_admin_session(response, admin)
    return MessageResponse(message="Session refreshed")


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def admin_logout(response: Response):
    clear_auth_cookies(response, admin=True)


@router.get("/me", response_model=AdminPublic)
def admin_me(admin: AdminUser = Depends(get_current_admin)):
    return admin
