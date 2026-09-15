import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import TicketAuthorType, TicketStatus


class TicketMessageCreate(BaseModel):
    body: str


class TicketMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    author_type: TicketAuthorType
    author_name: str
    body: str
    created_at: datetime


class TicketCreate(BaseModel):
    subject: str
    message: str


class TicketRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    subject: str
    status: TicketStatus
    created_at: datetime
    updated_at: datetime


class TicketDetailRead(TicketRead):
    customer_name: str
    customer_email: str
    messages: list[TicketMessageRead]


class AdminTicketListItem(TicketRead):
    customer_name: str
    customer_email: str
    message_count: int


class TicketStatusUpdate(BaseModel):
    status: TicketStatus
