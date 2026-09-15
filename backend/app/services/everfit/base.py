"""The Everfit integration boundary.

Everfit does not currently publish a documented, self-serve API for third-party
provisioning. This module defines the abstraction the rest of the application
codes against (`EverfitServiceBase`) so that everything outside `app/services/
everfit/` is completely ignorant of whether it's talking to a mock or a real
integration. `app/services/everfit/mock_service.py` is a clearly-marked mock used
until a real Everfit integration path exists; swapping it for a real
implementation is a matter of writing a new class that satisfies this same
interface and pointing `factory.get_everfit_service()` at it — no caller changes.

All calls are designed to be safe to retry: implementations should treat
`create_client`/`assign_programme`/`activate_client` as idempotent for a given
`external_customer_id`, and callers (see app/services/provisioning_service.py)
additionally avoid re-invoking a step that has already succeeded.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass


class EverfitServiceError(Exception):
    """Raised when a provisioning step fails. Callers persist the message onto
    EverfitAccount.last_error and must never surface it verbatim to a customer."""


@dataclass(frozen=True)
class EverfitClient:
    everfit_client_id: str


@dataclass(frozen=True)
class EverfitProgrammeAssignment:
    everfit_client_id: str
    everfit_programme_id: str


@dataclass(frozen=True)
class EverfitActivation:
    everfit_client_id: str
    access_url: str


@dataclass(frozen=True)
class EverfitClientStatus:
    everfit_client_id: str
    active: bool
    assigned_programme_id: str | None


class EverfitServiceBase(ABC):
    @abstractmethod
    def create_client(
        self, *, external_customer_id: str, email: str, first_name: str, last_name: str
    ) -> EverfitClient:
        """Create (or return the existing) Everfit client for this customer."""

    @abstractmethod
    def assign_programme(
        self, *, everfit_client_id: str, everfit_programme_id: str
    ) -> EverfitProgrammeAssignment:
        """Assign a programme to an already-created Everfit client."""

    @abstractmethod
    def activate_client(self, *, everfit_client_id: str) -> EverfitActivation:
        """Activate the client's coaching access and return their access URL."""

    @abstractmethod
    def get_client_status(self, *, everfit_client_id: str) -> EverfitClientStatus:
        """Fetch the current state of a client directly from Everfit."""
