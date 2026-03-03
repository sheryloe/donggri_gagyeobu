from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud

router = APIRouter()


@router.get("/", response_model=list[schemas.FixedExpenseOut])
def get_fixed_expenses(
    limit: int = Query(default=500, ge=1, le=5000),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    return crud.list_fixed_expenses(db, limit=limit, offset=offset)


@router.post("/", response_model=schemas.FixedExpenseOut)
def add_fixed_expense(fx: schemas.FixedExpenseCreate, db: Session = Depends(get_db)):
    return crud.create_fixed_expense(db, fx)


@router.delete("/{fx_id}")
def remove_fixed_expense(fx_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_fixed_expense(db, fx_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Fixed expense not found")
    return {"ok": True}
