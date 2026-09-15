import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_db
from app.models.admin_user import AdminUser
from app.models.discount_code import DiscountCode
from app.schemas.discount_code import DiscountCodeCreate, DiscountCodeRead, DiscountCodeUpdate

router = APIRouter(prefix="/admin/discount-codes", tags=["admin-discount-codes"])


@router.get("", response_model=list[DiscountCodeRead])
def list_discount_codes(
    db: Session = Depends(get_db), _admin: AdminUser = Depends(get_current_admin)
):
    return db.query(DiscountCode).order_by(DiscountCode.created_at.desc()).all()


@router.post("", response_model=DiscountCodeRead, status_code=status.HTTP_201_CREATED)
def create_discount_code(
    data: DiscountCodeCreate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    if db.query(DiscountCode).filter(DiscountCode.code == data.code.upper()).first() is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "This code already exists")
    payload = data.model_dump()
    payload["code"] = payload["code"].upper()
    code = DiscountCode(**payload)
    db.add(code)
    db.commit()
    db.refresh(code)
    return code


@router.patch("/{code_id}", response_model=DiscountCodeRead)
def update_discount_code(
    code_id: uuid.UUID,
    data: DiscountCodeUpdate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    code = db.get(DiscountCode, code_id)
    if code is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Discount code not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(code, field, value)
    db.commit()
    db.refresh(code)
    return code
