import uuid
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProgrammeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    name: str
    description: str
    everfit_programme_id: Optional[str] = None
    is_active: bool


class ProgrammeCreate(BaseModel):
    slug: str
    name: str
    description: str = ""
    everfit_programme_id: Optional[str] = None
    is_active: bool = True


class ProgrammeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    everfit_programme_id: Optional[str] = None
    is_active: Optional[bool] = None
