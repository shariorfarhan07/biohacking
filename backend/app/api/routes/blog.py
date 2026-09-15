from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models.blog_post import BlogPost
from app.models.enums import PostStatus
from app.schemas.blog_post import BlogPostRead

router = APIRouter(prefix="/blog", tags=["blog"])


@router.get("", response_model=list[BlogPostRead])
def list_posts(db: Session = Depends(get_db)):
    return (
        db.query(BlogPost)
        .filter(BlogPost.status == PostStatus.PUBLISHED)
        .order_by(BlogPost.published_at.desc())
        .all()
    )


@router.get("/{slug}", response_model=BlogPostRead)
def get_post(slug: str, db: Session = Depends(get_db)):
    post = (
        db.query(BlogPost)
        .filter(BlogPost.slug == slug, BlogPost.status == PostStatus.PUBLISHED)
        .first()
    )
    if post is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Post not found")
    return post
