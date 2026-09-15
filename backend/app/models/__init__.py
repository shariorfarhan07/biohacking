"""Import every model so SQLAlchemy's mapper registry (and Alembic autogenerate)
can see them all, and so string-based relationship() references resolve."""

from app.models.admin_user import AdminUser
from app.models.assignment_rule import AssignmentRule
from app.models.audit_log import AdminAuditLog
from app.models.blog_post import BlogPost
from app.models.contact_message import ContactMessage
from app.models.customer import Customer
from app.models.discount_code import DiscountCode
from app.models.everfit_account import EverfitAccount
from app.models.membership import Membership
from app.models.onboarding import OnboardingResponse
from app.models.package import Package
from app.models.password_reset_token import PasswordResetToken
from app.models.programme import Programme
from app.models.support_ticket import SupportTicket
from app.models.support_ticket_message import SupportTicketMessage
from app.models.webhook_event import WebhookEvent

__all__ = [
    "AdminUser",
    "AssignmentRule",
    "AdminAuditLog",
    "BlogPost",
    "ContactMessage",
    "Customer",
    "DiscountCode",
    "EverfitAccount",
    "Membership",
    "OnboardingResponse",
    "Package",
    "PasswordResetToken",
    "Programme",
    "SupportTicket",
    "SupportTicketMessage",
    "WebhookEvent",
]
