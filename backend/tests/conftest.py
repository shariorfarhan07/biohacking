import os
import tempfile
from pathlib import Path

import pytest

_tmp_dir = tempfile.mkdtemp()
_db_path = Path(_tmp_dir) / "test.db"
os.environ["DATABASE_URL"] = f"sqlite:///{_db_path}"
os.environ["STRIPE_SECRET_KEY"] = "sk_test_dummy"
os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_test_dummy"
os.environ["EVERFIT_PROVIDER"] = "mock"
os.environ["DEFAULT_PROGRAMME_SLUG"] = "general-foundations"
os.environ["FRONTEND_URL"] = "http://testserver"

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import event  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

import app.models  # noqa: E402,F401
from app.core.deps import get_db as get_db_dependency  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import engine  # noqa: E402
from app.main import app as fastapi_app  # noqa: E402
from app.models.admin_user import AdminUser  # noqa: E402
from app.models.enums import AdminRole, BillingInterval  # noqa: E402
from app.models.package import Package  # noqa: E402
from app.models.programme import Programme  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _create_tables():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db():
    """Every test runs inside one outer transaction on a dedicated connection,
    with a SAVEPOINT restarted after each `session.commit()` application code
    performs — so commits inside routes/services behave normally *within* the
    test, but nothing is ever actually persisted past it. Without this, rows
    created by one test (e.g. assignment rules) leak into the next, since tests
    otherwise share one on-disk SQLite file for the whole run."""
    connection = engine.connect()
    outer_transaction = connection.begin()
    TestSession = sessionmaker(bind=connection)
    session = TestSession()

    nested = connection.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def _restart_savepoint(sess, trans):
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()

    def override_get_db():
        yield session

    fastapi_app.dependency_overrides[get_db_dependency] = override_get_db

    try:
        yield session
    finally:
        fastapi_app.dependency_overrides.pop(get_db_dependency, None)
        session.close()
        outer_transaction.rollback()
        connection.close()


@pytest.fixture()
def client(db):
    with TestClient(fastapi_app) as c:
        c.headers.update({"X-Requested-With": "fetch"})
        yield c


@pytest.fixture()
def default_programme(db):
    programme = db.query(Programme).filter(Programme.slug == "general-foundations").first()
    if programme is not None:
        return programme
    programme = Programme(
        slug="general-foundations",
        name="General Foundations",
        everfit_programme_id="efit-prog-general-foundations",
        is_active=True,
    )
    db.add(programme)
    db.commit()
    db.refresh(programme)
    return programme


@pytest.fixture()
def sample_package(db):
    package = Package(
        slug=f"fat-loss-monthly-{os.urandom(4).hex()}",
        name="Fat Loss",
        description="Test package",
        price_cents=14900,
        currency="gbp",
        billing_interval=BillingInterval.MONTHLY,
        features=["Feature A"],
        is_active=True,
        stripe_price_id="price_test_123",
    )
    db.add(package)
    db.commit()
    db.refresh(package)
    return package


@pytest.fixture()
def admin_user(db):
    admin = AdminUser(
        email=f"admin-{os.urandom(4).hex()}@test.com",
        hashed_password=hash_password("adminpass123"),
        first_name="Test",
        last_name="Admin",
        role=AdminRole.ADMIN,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


def register_and_login(client: TestClient, email: str) -> dict:
    response = client.post(
        "/api/auth/register",
        json={
            "first_name": "Test",
            "last_name": "Customer",
            "email": email,
            "password": "password123",
            "confirm_password": "password123",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()
