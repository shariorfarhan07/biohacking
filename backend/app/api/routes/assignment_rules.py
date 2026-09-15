import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_db
from app.models.admin_user import AdminUser
from app.models.assignment_rule import AssignmentRule
from app.schemas.assignment_rule import (
    AssignmentRuleCreate,
    AssignmentRuleRead,
    AssignmentRuleTestRequest,
    AssignmentRuleTestResult,
    AssignmentRuleUpdate,
)
from app.services.rules_engine import ProgrammeAssignmentEngine, RuleEvaluationError

router = APIRouter(prefix="/admin/assignment-rules", tags=["admin-assignment-rules"])


@router.get("", response_model=list[AssignmentRuleRead])
def list_rules(db: Session = Depends(get_db), _admin: AdminUser = Depends(get_current_admin)):
    return db.query(AssignmentRule).order_by(AssignmentRule.priority.asc()).all()


@router.post("", response_model=AssignmentRuleRead, status_code=status.HTTP_201_CREATED)
def create_rule(
    data: AssignmentRuleCreate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    rule = AssignmentRule(**data.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.patch("/{rule_id}", response_model=AssignmentRuleRead)
def update_rule(
    rule_id: uuid.UUID,
    data: AssignmentRuleUpdate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    rule = db.get(AssignmentRule, rule_id)
    if rule is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Rule not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(rule, field, value)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rule(
    rule_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    rule = db.get(AssignmentRule, rule_id)
    if rule is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Rule not found")
    rule.is_active = False
    db.commit()


@router.post("/test", response_model=AssignmentRuleTestResult)
def test_rule(
    data: AssignmentRuleTestRequest,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    engine = ProgrammeAssignmentEngine(db)
    try:
        programme, matched_rule = engine.evaluate_fields(data.answers)
    except RuleEvaluationError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc

    return AssignmentRuleTestResult(
        matched_rule_id=matched_rule.id if matched_rule else None,
        matched_rule_name=matched_rule.name if matched_rule else None,
        programme=programme,
        used_default_fallback=matched_rule is None,
    )
