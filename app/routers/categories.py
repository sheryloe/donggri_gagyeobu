from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas, crud

router = APIRouter()

@router.get("/", response_model=list[schemas.CategoryOut])
def get_categories(
    type: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return crud.list_categories(db, type=type)

@router.post("/", response_model=schemas.CategoryOut)
def add_category(c: schemas.CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db, c)

@router.delete("/{category_id}")
def remove_category(category_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_category(db, category_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"ok": True}
