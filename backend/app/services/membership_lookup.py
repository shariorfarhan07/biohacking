from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.membership import Membership


def latest_membership_for_customer(db: Session, customer: Customer) -> Membership | None:
    """The customer dashboard and Everfit-status endpoints both operate on
    'the customer's current membership' — for this MVP that's simply their most
    recently created one (multiple concurrent memberships aren't a supported
    scenario yet)."""
    return (
        db.query(Membership)
        .filter(Membership.customer_id == customer.id)
        .order_by(Membership.created_at.desc())
        .first()
    )
