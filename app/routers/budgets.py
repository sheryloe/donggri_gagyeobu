from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas, crud

router = APIRouter()

@router.get("/", response_model=list[schemas.BudgetOut])
def get_budgets(db: Session = Depends(get_db)):
    return crud.list_budgets(db)

@router.post("/", response_model=schemas.BudgetOut)
def upsert_budget(b: schemas.BudgetUpsert, db: Session = Depends(get_db)):
    return crud.upsert_budget(db, b)

@router.delete("/{budget_id}")
def remove_budget(budget_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_budget(db, budget_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Budget not found")
    return {"ok": True}
