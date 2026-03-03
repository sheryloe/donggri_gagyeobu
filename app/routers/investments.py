from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import crud, schemas

router = APIRouter()


@router.get("/", response_model=list[schemas.InvestmentOut])
def get_investments(db: Session = Depends(get_db)):
    return crud.list_investments(db)


@router.post("/", response_model=schemas.InvestmentOut)
def add_investment(inv: schemas.InvestmentCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_investment(db, inv)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/refresh-prices", response_model=schemas.InvestmentRefreshOut)
def refresh_prices(db: Session = Depends(get_db)):
    total, updated = crud.refresh_investment_prices(db)
    return {"total": total, "updated": updated}


@router.patch("/{investment_id}", response_model=schemas.InvestmentOut)
def patch_investment(
    investment_id: int,
    patch: schemas.InvestmentUpdate,
    db: Session = Depends(get_db),
):
    try:
        obj = crud.update_investment(db, investment_id, patch)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not obj:
        raise HTTPException(status_code=404, detail="Investment not found")
    return obj


@router.delete("/{investment_id}")
def remove_investment(investment_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_investment(db, investment_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Investment not found")
    return {"ok": True}
