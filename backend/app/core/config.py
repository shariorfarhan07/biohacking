from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENV: str = "development"

    DATABASE_URL: str = "sqlite:///./app.db"

    JWT_ACCESS_SECRET: str = "dev-access-secret-change-me"
    JWT_REFRESH_SECRET: str = "dev-refresh-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_EXPIRE_DAYS: int = 30

    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    FRONTEND_URL: str = "http://localhost:3000"

    # Overrides the "secure" flag on auth cookies. Left unset, it follows
    # is_production (secure in prod, not in dev) — the right default once a
    # deployment has HTTPS. Set explicitly to false for a production-flagged
    # deployment still running over plain HTTP (no domain/TLS yet), or the
    # browser will silently refuse to store the session cookie.
    COOKIE_SECURE: Optional[bool] = None

    EVERFIT_PROVIDER: str = "mock"
    EVERFIT_API_KEY: str = ""

    DEFAULT_PROGRAMME_SLUG: str = "general-foundations"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def is_production(self) -> bool:
        return self.ENV == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
