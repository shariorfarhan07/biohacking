from tests.conftest import register_and_login


def _admin_login(client, admin_user):
    response = client.post(
        "/api/admin/auth/login", json={"email": admin_user.email, "password": "adminpass123"}
    )
    assert response.status_code == 200, response.text


def test_customer_can_create_and_read_own_ticket(client):
    register_and_login(client, "ticket-owner@test.com")

    create = client.post(
        "/api/tickets", json={"subject": "Billing question", "message": "Why was I charged twice?"}
    )
    assert create.status_code == 201, create.text
    body = create.json()
    assert body["status"] == "open"
    assert len(body["messages"]) == 1
    assert body["messages"][0]["author_type"] == "customer"

    listing = client.get("/api/tickets")
    assert listing.status_code == 200
    assert any(t["id"] == body["id"] for t in listing.json())

    detail = client.get(f"/api/tickets/{body['id']}")
    assert detail.status_code == 200
    assert detail.json()["subject"] == "Billing question"


def test_customer_cannot_read_another_customers_ticket(client):
    register_and_login(client, "owner@test.com")
    create = client.post("/api/tickets", json={"subject": "s", "message": "m"})
    ticket_id = create.json()["id"]

    client.post("/api/auth/logout")
    register_and_login(client, "intruder@test.com")

    response = client.get(f"/api/tickets/{ticket_id}")
    assert response.status_code == 404


def test_admin_can_list_and_reply_to_ticket(client, admin_user):
    register_and_login(client, "customer@test.com")
    create = client.post(
        "/api/tickets", json={"subject": "Can't log in", "message": "Password reset isn't working"}
    )
    ticket_id = create.json()["id"]

    client.post("/api/auth/logout")
    _admin_login(client, admin_user)

    listing = client.get("/api/admin/tickets")
    assert listing.status_code == 200
    item = next(t for t in listing.json() if t["id"] == ticket_id)
    assert item["customer_email"] == "customer@test.com"
    assert item["message_count"] == 1

    reply = client.post(f"/api/admin/tickets/{ticket_id}/messages", json={"body": "Try again now"})
    assert reply.status_code == 200
    assert len(reply.json()["messages"]) == 2
    assert reply.json()["messages"][-1]["author_type"] == "admin"


def test_customer_reply_reopens_resolved_ticket(client, admin_user):
    register_and_login(client, "reopen@test.com")
    create = client.post("/api/tickets", json={"subject": "s", "message": "m"})
    ticket_id = create.json()["id"]

    client.post("/api/auth/logout")
    _admin_login(client, admin_user)
    resolve = client.patch(f"/api/admin/tickets/{ticket_id}/status", json={"status": "resolved"})
    assert resolve.json()["status"] == "resolved"

    client.post("/api/admin/auth/logout")
    login = client.post(
        "/api/auth/login", json={"email": "reopen@test.com", "password": "password123"}
    )
    assert login.status_code == 200, login.text

    reply = client.post(f"/api/tickets/{ticket_id}/messages", json={"body": "Still broken"})
    assert reply.status_code == 200
    assert reply.json()["status"] == "open"


def test_admin_ticket_routes_require_admin_auth(client):
    assert client.get("/api/admin/tickets").status_code == 401
    assert client.post("/api/admin/tickets/00000000-0000-0000-0000-000000000000/messages", json={"body": "x"}).status_code == 401
