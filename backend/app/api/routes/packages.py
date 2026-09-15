from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models.package import Package
from app.schemas.package import PackageRead

router = APIRouter(prefix="/packages", tags=["packages"])


@router.get("", response_model=list[PackageRead])
def list_packages(db: Session = Depends(get_db)):
    return (
        db.query(Package)
        .filter(Package.is_active.is_(True))
        .order_by(Package.sort_order.asc())
        .all()
    )


@router.get("/{slug}", response_model=PackageRead)
def get_package(slug: str, db: Session = Depends(get_db)):
    package = db.query(Package).filter(Package.slug == slug, Package.is_active.is_(True)).first()
    if package is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Package not found")
    return package
