from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_db
from app.models.admin_user import AdminUser
from app.models.contact_message import ContactMessage
from app.schemas.common import MessageResponse
from app.schemas.contact import ContactMessageCreate, ContactMessageRead

router = APIRouter(tags=["contact"])


@router.post("/contact", response_model=MessageResponse)
def submit_contact_message(data: ContactMessageCreate, db: Session = Depends(get_db)):
    message = ContactMessage(**data.model_dump())
    db.add(message)
    db.commit()
    return MessageResponse(message="Thanks — we'll be in touch shortly")


@router.get("/admin/contact-messages", response_model=list[ContactMessageRead])
def list_contact_messages(
    db: Session = Depends(get_db), _admin: AdminUser = Depends(get_current_admin)
):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()
