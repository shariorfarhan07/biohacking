import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.enums import PostStatus


class BlogPostRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    excerpt: str
    body_markdown: str
    cover_image_url: Optional[str] = None
    author_name: str
    status: PostStatus
    published_at: Optional[datetime] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class BlogPostCreate(BaseModel):
    slug: str
    title: str
    excerpt: str = ""
    body_markdown: str = ""
    cover_image_url: Optional[str] = None
    author_name: str = ""
    status: PostStatus = PostStatus.DRAFT
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    body_markdown: Optional[str] = None
    cover_image_url: Optional[str] = None
    author_name: Optional[str] = None
    status: Optional[PostStatus] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
