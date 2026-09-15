import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_db
from app.models.admin_user import AdminUser
from app.models.customer import Customer
from app.models.enums import TicketAuthorType, TicketStatus
from app.models.support_ticket import SupportTicket
from app.models.support_ticket_message import SupportTicketMessage
from app.schemas.support_ticket import (
    AdminTicketListItem,
    TicketDetailRead,
    TicketMessageCreate,
    TicketMessageRead,
    TicketStatusUpdate,
)
from app.services.email_service import send_ticket_reply_email

router = APIRouter(prefix="/admin/tickets", tags=["admin-tickets"])


def _get_ticket_or_404(db: Session, ticket_id: uuid.UUID) -> SupportTicket:
    ticket = db.get(SupportTicket, ticket_id)
    if ticket is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Ticket not found")
    return ticket


def _to_detail(ticket: SupportTicket) -> TicketDetailRead:
    return TicketDetailRead(
        id=ticket.id,
        subject=ticket.subject,
        status=ticket.status,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        customer_name=ticket.customer.full_name,
        customer_email=ticket.customer.email,
        messages=[TicketMessageRead.model_validate(m) for m in ticket.messages],
    )


@router.get("", response_model=list[AdminTicketListItem])
def list_tickets(
    status_filter: TicketStatus | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    query = db.query(SupportTicket).join(Customer)
    if status_filter is not None:
        query = query.filter(SupportTicket.status == status_filter)
    tickets = query.order_by(SupportTicket.updated_at.desc()).all()
    return [
        AdminTicketListItem(
            id=ticket.id,
            subject=ticket.subject,
            status=ticket.status,
            created_at=ticket.created_at,
            updated_at=ticket.updated_at,
            customer_name=ticket.customer.full_name,
            customer_email=ticket.customer.email,
            message_count=len(ticket.messages),
        )
        for ticket in tickets
    ]


@router.get("/{ticket_id}", response_model=TicketDetailRead)
def get_ticket(
    ticket_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    ticket = _get_ticket_or_404(db, ticket_id)
    return _to_detail(ticket)


@router.post("/{ticket_id}/messages", response_model=TicketDetailRead)
def reply_to_ticket(
    ticket_id: uuid.UUID,
    data: TicketMessageCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    ticket = _get_ticket_or_404(db, ticket_id)
    author_name = f"{admin.first_name} {admin.last_name}".strip() or admin.email
    message = SupportTicketMessage(
        ticket_id=ticket.id,
        author_type=TicketAuthorType.ADMIN,
        author_name=author_name,
        body=data.body,
    )
    db.add(message)
    db.commit()
    db.refresh(ticket)
    send_ticket_reply_email(
        to=ticket.customer.email, first_name=ticket.customer.first_name, subject=ticket.subject
    )
    return _to_detail(ticket)


@router.patch("/{ticket_id}/status", response_model=TicketDetailRead)
def update_ticket_status(
    ticket_id: uuid.UUID,
    data: TicketStatusUpdate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    ticket = _get_ticket_or_404(db, ticket_id)
    ticket.status = data.status
    db.commit()
    db.refresh(ticket)
    return _to_detail(ticket)
