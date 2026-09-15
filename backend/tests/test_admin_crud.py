def _admin_login(client, admin_user):
    response = client.post(
        "/api/admin/auth/login", json={"email": admin_user.email, "password": "adminpass123"}
    )
    assert response.status_code == 200, response.text


def test_programme_crud(client, admin_user):
    _admin_login(client, admin_user)

    create = client.post(
        "/api/admin/programmes",
        json={"slug": "test-programme-1", "name": "Test Programme", "description": "desc"},
    )
    assert create.status_code == 201, create.text
    programme_id = create.json()["id"]

    listing = client.get("/api/admin/programmes")
    assert listing.status_code == 200
    assert any(p["id"] == programme_id for p in listing.json())

    update = client.patch(f"/api/admin/programmes/{programme_id}", json={"is_active": False})
    assert update.status_code == 200
    assert update.json()["is_active"] is False


def test_programme_duplicate_slug_rejected(client, admin_user):
    _admin_login(client, admin_user)
    client.post(
        "/api/admin/programmes", json={"slug": "dupe-programme", "name": "A", "description": ""}
    )
    response = client.post(
        "/api/admin/programmes", json={"slug": "dupe-programme", "name": "B", "description": ""}
    )
    assert response.status_code == 409


def test_assignment_rule_crud_and_dry_run(client, admin_user):
    _admin_login(client, admin_user)

    programme = client.post(
        "/api/admin/programmes",
        json={
            "slug": "rule-test-programme",
            "name": "Rule Test Programme",
            "everfit_programme_id": "efit-rule-test",
        },
    ).json()

    create = client.post(
        "/api/admin/assignment-rules",
        json={
            "name": "Test rule",
            "priority": 5,
            "conditions": {"all": [{"field": "goal", "op": "eq", "value": "performance"}]},
            "programme_id": programme["id"],
        },
    )
    assert create.status_code == 201, create.text
    rule_id = create.json()["id"]

    listing = client.get("/api/admin/assignment-rules")
    assert any(r["id"] == rule_id for r in listing.json())

    dry_run = client.post(
        "/api/admin/assignment-rules/test", json={"answers": {"goal": "performance"}}
    )
    assert dry_run.status_code == 200
    assert dry_run.json()["matched_rule_id"] == rule_id
    assert dry_run.json()["programme"]["id"] == programme["id"]

    update = client.patch(f"/api/admin/assignment-rules/{rule_id}", json={"priority": 99})
    assert update.status_code == 200
    assert update.json()["priority"] == 99

    delete = client.delete(f"/api/admin/assignment-rules/{rule_id}")
    assert delete.status_code == 204

    after_delete = client.get("/api/admin/assignment-rules")
    deleted_rule = next(r for r in after_delete.json() if r["id"] == rule_id)
    assert deleted_rule["is_active"] is False


def test_admin_package_crud(client, admin_user):
    _admin_login(client, admin_user)

    create = client.post(
        "/api/admin/packages",
        json={
            "slug": "admin-crud-package",
            "name": "Admin CRUD Package",
            "description": "desc",
            "price_cents": 5000,
            "billing_interval": "monthly",
            "features": ["Feature 1"],
        },
    )
    assert create.status_code == 201, create.text
    package_id = create.json()["id"]

    listing = client.get("/api/admin/packages")
    assert any(p["id"] == package_id for p in listing.json())

    update = client.patch(f"/api/admin/packages/{package_id}", json={"price_cents": 6000})
    assert update.status_code == 200
    assert update.json()["price_cents"] == 6000


def test_discount_code_crud(client, admin_user):
    _admin_login(client, admin_user)

    create = client.post(
        "/api/admin/discount-codes",
        json={"code": "testcode10", "percent_off": 10},
    )
    assert create.status_code == 201, create.text
    assert create.json()["code"] == "TESTCODE10"
    code_id = create.json()["id"]

    listing = client.get("/api/admin/discount-codes")
    assert any(c["id"] == code_id for c in listing.json())

    update = client.patch(f"/api/admin/discount-codes/{code_id}", json={"is_active": False})
    assert update.status_code == 200
    assert update.json()["is_active"] is False


def test_contact_form_and_admin_inbox(client, admin_user):
    submit = client.post(
        "/api/contact",
        json={
            "name": "Jane Doe",
            "email": "jane@example.com",
            "subject": "Question about coaching",
            "message": "How does onboarding work?",
        },
    )
    assert submit.status_code == 200

    unauthenticated = client.get("/api/admin/contact-messages")
    assert unauthenticated.status_code == 401

    _admin_login(client, admin_user)
    inbox = client.get("/api/admin/contact-messages")
    assert inbox.status_code == 200
    assert any(m["email"] == "jane@example.com" for m in inbox.json())
