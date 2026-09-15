"""MOCK EVERFIT IMPLEMENTATION.

Everfit has no public self-serve provisioning API today, so this class simulates
one behind the exact same interface (`EverfitServiceBase`) a real integration
would implement. It is deliberately obvious that this is a mock:
- IDs are deterministic and prefixed `mock_` so they can never be confused with a
  real Everfit identifier in logs or the admin UI.
- State lives in an in-memory dict for the life of the process — fine for a mock,
  since the durable source of truth is always the `EverfitAccount` row in the
  application database, not this service.
- No network calls are made.

Replace this file (and only this file) with a real HTTP-backed implementation of
`EverfitServiceBase` once Everfit exposes a supported integration path; nothing
else in the codebase needs to change — see `factory.py`.
"""

import hashlib

from app.services.everfit.base import (
    EverfitActivation,
    EverfitClient,
    EverfitClientStatus,
    EverfitProgrammeAssignment,
    EverfitServiceBase,
    EverfitServiceError,
)


def _deterministic_id(prefix: str, seed: str) -> str:
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()[:16]
    return f"{prefix}_{digest}"


class MockEverfitService(EverfitServiceBase):
    def __init__(self) -> None:
        # everfit_client_id -> {"active": bool, "programme_id": str | None}
        self._clients: dict[str, dict] = {}

    def create_client(
        self, *, external_customer_id: str, email: str, first_name: str, last_name: str
    ) -> EverfitClient:
        if not email:
            raise EverfitServiceError("Cannot create an Everfit client without an email address")

        client_id = _deterministic_id("mock_client", external_customer_id)
        self._clients.setdefault(client_id, {"active": False, "programme_id": None})
        return EverfitClient(everfit_client_id=client_id)

    def assign_programme(
        self, *, everfit_client_id: str, everfit_programme_id: str
    ) -> EverfitProgrammeAssignment:
        client = self._clients.get(everfit_client_id)
        if client is None:
            raise EverfitServiceError(f"Unknown Everfit client '{everfit_client_id}'")

        client["programme_id"] = everfit_programme_id
        return EverfitProgrammeAssignment(
            everfit_client_id=everfit_client_id, everfit_programme_id=everfit_programme_id
        )

    def activate_client(self, *, everfit_client_id: str) -> EverfitActivation:
        client = self._clients.get(everfit_client_id)
        if client is None:
            raise EverfitServiceError(f"Unknown Everfit client '{everfit_client_id}'")
        if client["programme_id"] is None:
            raise EverfitServiceError("Cannot activate a client with no assigned programme")

        client["active"] = True
        access_url = f"https://app.everfit.io/client/{everfit_client_id}"
        return EverfitActivation(everfit_client_id=everfit_client_id, access_url=access_url)

    def get_client_status(self, *, everfit_client_id: str) -> EverfitClientStatus:
        client = self._clients.get(everfit_client_id)
        if client is None:
            raise EverfitServiceError(f"Unknown Everfit client '{everfit_client_id}'")

        return EverfitClientStatus(
            everfit_client_id=everfit_client_id,
            active=client["active"],
            assigned_programme_id=client["programme_id"],
        )
