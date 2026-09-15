import uuid

from pydantic import BaseModel, ConfigDict, EmailStr


class CustomerPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    first_name: str
    last_name: str
    email: EmailStr


class CustomerUpdate(BaseModel):
    first_name: str
    last_name: str
