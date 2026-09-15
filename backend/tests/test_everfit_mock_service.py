import pytest

from app.services.everfit.base import EverfitServiceError
from app.services.everfit.mock_service import MockEverfitService


def test_create_client_is_deterministic_for_same_customer():
    service = MockEverfitService()
    first = service.create_client(
        external_customer_id="cust-1", email="a@test.com", first_name="A", last_name="B"
    )
    second = service.create_client(
        external_customer_id="cust-1", email="a@test.com", first_name="A", last_name="B"
    )
    assert first.everfit_client_id == second.everfit_client_id
    assert first.everfit_client_id.startswith("mock_client_")


def test_full_provisioning_lifecycle():
    service = MockEverfitService()
    client = service.create_client(
        external_customer_id="cust-2", email="b@test.com", first_name="B", last_name="C"
    )
    service.assign_programme(
        everfit_client_id=client.everfit_client_id, everfit_programme_id="prog-1"
    )
    activation = service.activate_client(everfit_client_id=client.everfit_client_id)

    assert activation.access_url.endswith(client.everfit_client_id)

    status = service.get_client_status(everfit_client_id=client.everfit_client_id)
    assert status.active is True
    assert status.assigned_programme_id == "prog-1"


def test_activating_without_programme_fails():
    service = MockEverfitService()
    client = service.create_client(
        external_customer_id="cust-3", email="c@test.com", first_name="C", last_name="D"
    )
    with pytest.raises(EverfitServiceError):
        service.activate_client(everfit_client_id=client.everfit_client_id)


def test_operations_on_unknown_client_fail():
    service = MockEverfitService()
    with pytest.raises(EverfitServiceError):
        service.assign_programme(everfit_client_id="mock_client_unknown", everfit_programme_id="x")
