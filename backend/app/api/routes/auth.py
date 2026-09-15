import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_customer, get_db
from app.core.security import (
    CUSTOMER_REFRESH_COOKIE,
    TokenError,
    clear_auth_cookies,
    create_token,
    decode_token,
    set_auth_cookies,
)
from app.models.customer import Customer
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    PasswordResetConfirmSchema,
    PasswordResetRequestSchema,
    RegisterRequest,
)
from app.schemas.common import MessageResponse
from app.schemas.customer import CustomerPublic, CustomerUpdate
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


def _issue_session(response: Response, customer: Customer) -> None:
    access_token = create_token(customer.id, "customer", "access")
    refresh_token = create_token(customer.id, "customer", "refresh")
    set_auth_cookies(response, access_token, refresh_token)


@router.post("/register", response_model=CustomerPublic, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    customer = auth_service.register_customer(db, data)
    _issue_session(response, customer)
    return customer


@router.post("/login", response_model=CustomerPublic)
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    customer = auth_service.authenticate_customer(db, data.email, data.password)
    _issue_session(response, customer)
    return customer


@router.post("/refresh", response_model=MessageResponse)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get(CUSTOMER_REFRESH_COOKIE)
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        payload = decode_token(token, "refresh", "customer")
    except TokenError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired") from exc

    customer = db.get(Customer, uuid.UUID(payload["sub"]))
    if customer is None or not customer.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")

    _issue_session(response, customer)
    return MessageResponse(message="Session refreshed")


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):
    clear_auth_cookies(response)


@router.get("/me", response_model=CustomerPublic)
def me(customer: Customer = Depends(get_current_customer)):
    return customer


@router.patch("/me", response_model=CustomerPublic)
def update_me(
    data: CustomerUpdate,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    customer.first_name = data.first_name.strip()
    customer.last_name = data.last_name.strip()
    db.commit()
    db.refresh(customer)
    return customer


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    data: ChangePasswordRequest,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    auth_service.change_password(db, customer, data.current_password, data.new_password)
    return MessageResponse(message="Password updated")


@router.post("/password-reset/request", response_model=MessageResponse)
def password_reset_request(data: PasswordResetRequestSchema, db: Session = Depends(get_db)):
    auth_service.request_password_reset(db, data.email)
    return MessageResponse(message="If that email exists, we've sent a reset link")


@router.post("/password-reset/confirm", response_model=MessageResponse)
def password_reset_confirm(data: PasswordResetConfirmSchema, db: Session = Depends(get_db)):
    auth_service.confirm_password_reset(db, data.token, data.new_password)
    return MessageResponse(message="Password has been reset")
