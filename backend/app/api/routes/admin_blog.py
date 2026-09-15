import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_db
from app.models.admin_user import AdminUser
from app.models.blog_post import BlogPost
from app.models.enums import PostStatus
from app.schemas.blog_post import BlogPostCreate, BlogPostRead, BlogPostUpdate

router = APIRouter(prefix="/admin/blog", tags=["admin-blog"])


@router.get("", response_model=list[BlogPostRead])
def list_posts(db: Session = Depends(get_db), _admin: AdminUser = Depends(get_current_admin)):
    return db.query(BlogPost).order_by(BlogPost.created_at.desc()).all()


@router.post("", response_model=BlogPostRead, status_code=status.HTTP_201_CREATED)
def create_post(
    data: BlogPostCreate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    if db.query(BlogPost).filter(BlogPost.slug == data.slug).first() is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "This slug already exists")
    payload = data.model_dump()
    if payload["status"] == PostStatus.PUBLISHED:
        payload["published_at"] = datetime.now(timezone.utc)
    post = BlogPost(**payload)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("/{post_id}", response_model=BlogPostRead)
def get_post(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    post = db.get(BlogPost, post_id)
    if post is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Post not found")
    return post


@router.patch("/{post_id}", response_model=BlogPostRead)
def update_post(
    post_id: uuid.UUID,
    data: BlogPostUpdate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    post = db.get(BlogPost, post_id)
    if post is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Post not found")
    updates = data.model_dump(exclude_unset=True)
    # First transition into "published" stamps the public date; later edits
    # to an already-published post must not silently bump it back to now.
    if updates.get("status") == PostStatus.PUBLISHED and post.published_at is None:
        post.published_at = datetime.now(timezone.utc)
    for field, value in updates.items():
        setattr(post, field, value)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    post = db.get(BlogPost, post_id)
    if post is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Post not found")
    db.delete(post)
    db.commit()
