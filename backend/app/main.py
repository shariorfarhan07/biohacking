from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging

configure_logging()

app = FastAPI(
    title="Coaching Platform API",
    description="Backend for package sales, onboarding, and Everfit provisioning.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pragmatic CSRF mitigation: cookie-based auth means a malicious site could
# otherwise trigger authenticated state-changing requests via a simple form
# POST. Requiring this header on every mutation (which only same-origin
# JavaScript can set) blocks that without needing a token exchange. The Stripe
# webhook is exempt since Stripe can't send custom headers we control.
_CSRF_EXEMPT_PREFIXES = ("/api/webhooks",)
_SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


@app.middleware("http")
async def csrf_header_guard(request: Request, call_next):
    if request.method not in _SAFE_METHODS and not request.url.path.startswith(
        _CSRF_EXEMPT_PREFIXES
    ):
        if request.headers.get("x-requested-with") != "fetch":
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Missing required X-Requested-With header"},
            )
    return await call_next(request)


app.include_router(api_router)


@app.get("/")
def root():
    return {"service": "coaching-platform-api", "status": "ok"}
