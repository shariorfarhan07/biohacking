from functools import lru_cache

from app.core.config import settings
from app.services.everfit.base import EverfitServiceBase
from app.services.everfit.mock_service import MockEverfitService


@lru_cache
def get_everfit_service() -> EverfitServiceBase:
    """Returns the singleton EverfitService for this process. `EVERFIT_PROVIDER`
    is read from settings so a future real implementation can be switched in via
    configuration alone. The mock keeps its state in memory, so it must stay a
    singleton for the life of the process rather than being re-instantiated per
    request."""

    provider = settings.EVERFIT_PROVIDER.lower()
    if provider == "mock":
        return MockEverfitService()

    raise NotImplementedError(
        f"No EverfitService implementation registered for EVERFIT_PROVIDER='{provider}'. "
        "Only 'mock' is available until a real Everfit integration path exists."
    )
