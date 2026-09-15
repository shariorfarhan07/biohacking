from fastapi import APIRouter

from app.api.routes import (
    admin_auth,
    admin_blog,
    admin_customers,
    admin_discount_codes,
    admin_packages,
    admin_tickets,
    assignment_rules,
    auth,
    billing,
    blog,
    checkout,
    contact,
    dashboard,
    everfit,
    health,
    onboarding,
    packages,
    programmes,
    tickets,
    webhooks_stripe,
)

api_router = APIRouter(prefix="/api")

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(admin_auth.router)
api_router.include_router(packages.router)
api_router.include_router(blog.router)
api_router.include_router(checkout.router)
api_router.include_router(billing.router)
api_router.include_router(webhooks_stripe.router)
api_router.include_router(onboarding.router)
api_router.include_router(everfit.router)
api_router.include_router(dashboard.router)
api_router.include_router(contact.router)
api_router.include_router(programmes.router)
api_router.include_router(assignment_rules.router)
api_router.include_router(admin_packages.router)
api_router.include_router(admin_discount_codes.router)
api_router.include_router(admin_blog.router)
api_router.include_router(admin_customers.router)
api_router.include_router(tickets.router)
api_router.include_router(admin_tickets.router)
