from typing import Optional

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPKMixin


class Programme(Base, UUIDPKMixin, TimestampMixin):
    """Mirrors an Everfit programme so the assignment engine and admin UI can
    reference one without calling Everfit on every read. `everfit_programme_id` is
    the external identifier used by EverfitService.assign_programme()."""

    __tablename__ = "programmes"

    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    everfit_programme_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
