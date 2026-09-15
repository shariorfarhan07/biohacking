import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_db
from app.models.admin_user import AdminUser
from app.models.programme import Programme
from app.schemas.programme import ProgrammeCreate, ProgrammeRead, ProgrammeUpdate

router = APIRouter(prefix="/admin/programmes", tags=["admin-programmes"])


@router.get("", response_model=list[ProgrammeRead])
def list_programmes(db: Session = Depends(get_db), _admin: AdminUser = Depends(get_current_admin)):
    return db.query(Programme).order_by(Programme.name.asc()).all()


@router.post("", response_model=ProgrammeRead, status_code=status.HTTP_201_CREATED)
def create_programme(
    data: ProgrammeCreate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    if db.query(Programme).filter(Programme.slug == data.slug).first() is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "A programme with this slug already exists")
    programme = Programme(**data.model_dump())
    db.add(programme)
    db.commit()
    db.refresh(programme)
    return programme


@router.patch("/{programme_id}", response_model=ProgrammeRead)
def update_programme(
    programme_id: uuid.UUID,
    data: ProgrammeUpdate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    programme = db.get(Programme, programme_id)
    if programme is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Programme not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(programme, field, value)
    db.commit()
    db.refresh(programme)
    return programme
