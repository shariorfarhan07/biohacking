import uuid
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.programme import ProgrammeRead


class AssignmentRuleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    priority: int
    conditions: dict[str, Any]
    programme_id: uuid.UUID
    is_active: bool


class AssignmentRuleCreate(BaseModel):
    name: str
    priority: int = 100
    conditions: dict[str, Any]
    programme_id: uuid.UUID
    is_active: bool = True


class AssignmentRuleUpdate(BaseModel):
    name: Optional[str] = None
    priority: Optional[int] = None
    conditions: Optional[dict[str, Any]] = None
    programme_id: Optional[uuid.UUID] = None
    is_active: Optional[bool] = None


class AssignmentRuleTestRequest(BaseModel):
    answers: dict[str, Any]


class AssignmentRuleTestResult(BaseModel):
    matched_rule_id: Optional[uuid.UUID] = None
    matched_rule_name: Optional[str] = None
    programme: Optional[ProgrammeRead] = None
    used_default_fallback: bool = False
