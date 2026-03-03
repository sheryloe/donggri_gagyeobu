from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas, crud

router = APIRouter()


@router.get("/", response_model=list[schemas.TransactionOut])
def get_transactions(
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    return crud.list_transactions(db, limit=limit, offset=offset)


@router.post("/", response_model=schemas.TransactionOut)
def add_transaction(tx: schemas.TransactionCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_transaction(db, tx)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{tx_id}")
def remove_transaction(tx_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_transaction(db, tx_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"ok": True}

@router.patch("/{tx_id}", response_model=schemas.TransactionOut)
def patch_transaction(tx_id: int, patch: schemas.TransactionUpdate, db: Session = Depends(get_db)):
    try:
        obj = crud.update_transaction(db, tx_id, patch)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not obj:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return obj

