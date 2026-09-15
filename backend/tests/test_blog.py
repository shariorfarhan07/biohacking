def _admin_login(client, admin_user):
    response = client.post(
        "/api/admin/auth/login", json={"email": admin_user.email, "password": "adminpass123"}
    )
    assert response.status_code == 200, response.text


def test_draft_post_not_visible_publicly(client, admin_user):
    _admin_login(client, admin_user)

    create = client.post(
        "/api/admin/blog",
        json={"slug": "draft-post", "title": "Draft Post", "excerpt": "e", "body_markdown": "b"},
    )
    assert create.status_code == 201, create.text
    assert create.json()["status"] == "draft"
    assert create.json()["published_at"] is None

    listing = client.get("/api/blog")
    assert listing.status_code == 200
    assert not any(p["slug"] == "draft-post" for p in listing.json())

    detail = client.get("/api/blog/draft-post")
    assert detail.status_code == 404


def test_publishing_a_post_makes_it_public_and_stamps_published_at(client, admin_user):
    _admin_login(client, admin_user)

    create = client.post(
        "/api/admin/blog",
        json={"slug": "published-post", "title": "Published Post", "excerpt": "e", "body_markdown": "b"},
    )
    post_id = create.json()["id"]

    publish = client.patch(f"/api/admin/blog/{post_id}", json={"status": "published"})
    assert publish.status_code == 200
    published_at = publish.json()["published_at"]
    assert published_at is not None

    listing = client.get("/api/blog")
    assert any(p["slug"] == "published-post" for p in listing.json())

    detail = client.get("/api/blog/published-post")
    assert detail.status_code == 200
    assert detail.json()["title"] == "Published Post"

    # A later edit that keeps it published must not re-stamp published_at.
    edit = client.patch(f"/api/admin/blog/{post_id}", json={"title": "Published Post (edited)"})
    assert edit.status_code == 200
    assert edit.json()["published_at"] == published_at


def test_blog_post_duplicate_slug_rejected(client, admin_user):
    _admin_login(client, admin_user)
    client.post(
        "/api/admin/blog",
        json={"slug": "dupe-slug", "title": "A", "excerpt": "", "body_markdown": ""},
    )
    response = client.post(
        "/api/admin/blog",
        json={"slug": "dupe-slug", "title": "B", "excerpt": "", "body_markdown": ""},
    )
    assert response.status_code == 409


def test_blog_admin_routes_require_admin_auth(client):
    assert client.get("/api/admin/blog").status_code == 401
    assert client.post("/api/admin/blog", json={"slug": "x", "title": "x"}).status_code == 401


def test_blog_post_delete(client, admin_user):
    _admin_login(client, admin_user)
    create = client.post(
        "/api/admin/blog",
        json={"slug": "to-delete", "title": "To Delete", "excerpt": "", "body_markdown": ""},
    )
    post_id = create.json()["id"]

    delete = client.delete(f"/api/admin/blog/{post_id}")
    assert delete.status_code == 204

    listing = client.get("/api/admin/blog")
    assert not any(p["id"] == post_id for p in listing.json())
