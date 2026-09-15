import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_db
from app.models.admin_user import AdminUser
from app.models.package import Package
from app.schemas.package import PackageAdminRead, PackageCreate, PackageUpdate

router = APIRouter(prefix="/admin/packages", tags=["admin-packages"])


@router.get("", response_model=list[PackageAdminRead])
def list_packages(db: Session = Depends(get_db), _admin: AdminUser = Depends(get_current_admin)):
    return db.query(Package).order_by(Package.sort_order.asc()).all()


@router.get("/{package_id}", response_model=PackageAdminRead)
def get_package(
    package_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    package = db.get(Package, package_id)
    if package is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Package not found")
    return package


@router.post("", response_model=PackageAdminRead, status_code=status.HTTP_201_CREATED)
def create_package(
    data: PackageCreate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    if db.query(Package).filter(Package.slug == data.slug).first() is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "A package with this slug already exists")
    package = Package(**data.model_dump())
    db.add(package)
    db.commit()
    db.refresh(package)
    return package


@router.patch("/{package_id}", response_model=PackageAdminRead)
def update_package(
    package_id: uuid.UUID,
    data: PackageUpdate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    package = db.get(Package, package_id)
    if package is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Package not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(package, field, value)
    db.commit()
    db.refresh(package)
    return package
