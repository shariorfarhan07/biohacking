from tests.conftest import register_and_login


def test_register_login_me_logout(client):
    data = register_and_login(client, "auth-user@test.com")
    assert data["email"] == "auth-user@test.com"

    me = client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "auth-user@test.com"

    logout = client.post("/api/auth/logout")
    assert logout.status_code == 204

    me_after_logout = client.get("/api/auth/me")
    assert me_after_logout.status_code == 401


def test_register_duplicate_email_rejected(client):
    register_and_login(client, "dupe@test.com")
    client.post("/api/auth/logout")

    response = client.post(
        "/api/auth/register",
        json={
            "first_name": "Another",
            "last_name": "Person",
            "email": "dupe@test.com",
            "password": "password123",
            "confirm_password": "password123",
        },
    )
    assert response.status_code == 409


def test_login_wrong_password_rejected(client):
    register_and_login(client, "wrongpass@test.com")
    client.post("/api/auth/logout")

    response = client.post(
        "/api/auth/login", json={"email": "wrongpass@test.com", "password": "not-the-password"}
    )
    assert response.status_code == 401


def test_mutating_request_without_csrf_header_is_rejected(client):
    client.headers.pop("X-Requested-With", None)
    response = client.post(
        "/api/auth/register",
        json={
            "first_name": "No",
            "last_name": "Header",
            "email": "noheader@test.com",
            "password": "password123",
            "confirm_password": "password123",
        },
    )
    assert response.status_code == 403
