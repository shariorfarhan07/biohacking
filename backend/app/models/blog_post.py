from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPKMixin
from app.models.enums import PostStatus


class BlogPost(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "blog_posts"

    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    excerpt: Mapped[str] = mapped_column(Text, nullable=False, default="")
    body_markdown: Mapped[str] = mapped_column(Text, nullable=False, default="")
    cover_image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    author_name: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    status: Mapped[PostStatus] = mapped_column(
        Enum(PostStatus, native_enum=False, length=20), default=PostStatus.DRAFT, nullable=False
    )
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    # Fall back to title/excerpt on the frontend when these are blank — kept
    # optional so authoring a post doesn't require filling in SEO fields.
    seo_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    seo_description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
