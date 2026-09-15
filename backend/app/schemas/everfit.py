from typing import Optional

from pydantic import BaseModel

from app.models.enums import EverfitStatus


class EverfitStatusRead(BaseModel):
    status: EverfitStatus
    programme_name: Optional[str] = None
    access_url: Optional[str] = None
    last_error: Optional[str] = None
