import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_customer, get_db
from app.models.customer import Customer
from app.models.enums import TicketAuthorType, TicketStatus
from app.models.support_ticket import SupportTicket
from app.models.support_ticket_message import SupportTicketMessage
from app.schemas.support_ticket import (
    TicketCreate,
    TicketDetailRead,
    TicketMessageCreate,
    TicketMessageRead,
    TicketRead,
)

router = APIRouter(prefix="/tickets", tags=["tickets"])


def _get_owned_ticket(db: Session, ticket_id: uuid.UUID, customer: Customer) -> SupportTicket:
    ticket = db.get(SupportTicket, ticket_id)
    if ticket is None or ticket.customer_id != customer.id:
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


@router.get("", response_model=list[TicketRead])
def list_my_tickets(
    customer: Customer = Depends(get_current_customer), db: Session = Depends(get_db)
):
    return (
        db.query(SupportTicket)
        .filter(SupportTicket.customer_id == customer.id)
        .order_by(SupportTicket.updated_at.desc())
        .all()
    )


@router.post("", response_model=TicketDetailRead, status_code=status.HTTP_201_CREATED)
def create_ticket(
    data: TicketCreate,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    ticket = SupportTicket(customer_id=customer.id, subject=data.subject, status=TicketStatus.OPEN)
    db.add(ticket)
    db.flush()
    message = SupportTicketMessage(
        ticket_id=ticket.id,
        author_type=TicketAuthorType.CUSTOMER,
        author_name=customer.full_name,
        body=data.message,
    )
    db.add(message)
    db.commit()
    db.refresh(ticket)
    return _to_detail(ticket)


@router.get("/{ticket_id}", response_model=TicketDetailRead)
def get_ticket(
    ticket_id: uuid.UUID,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    ticket = _get_owned_ticket(db, ticket_id, customer)
    return _to_detail(ticket)


@router.post("/{ticket_id}/messages", response_model=TicketDetailRead)
def reply_to_ticket(
    ticket_id: uuid.UUID,
    data: TicketMessageCreate,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    ticket = _get_owned_ticket(db, ticket_id, customer)
    message = SupportTicketMessage(
        ticket_id=ticket.id,
        author_type=TicketAuthorType.CUSTOMER,
        author_name=customer.full_name,
        body=data.body,
    )
    db.add(message)
    # A reply from the customer means the ticket needs a human again, even if
    # it had been marked resolved.
    if ticket.status == TicketStatus.RESOLVED:
        ticket.status = TicketStatus.OPEN
    db.commit()
    db.refresh(ticket)
    return _to_detail(ticket)


@router.post("/{ticket_id}/resolve", response_model=TicketDetailRead)
def resolve_ticket(
    ticket_id: uuid.UUID,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    ticket = _get_owned_ticket(db, ticket_id, customer)
    ticket.status = TicketStatus.RESOLVED
    db.commit()
    db.refresh(ticket)
    return _to_detail(ticket)
