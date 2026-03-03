from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud

router = APIRouter()


@router.get("/", response_model=list[schemas.AssetOut])
def list_assets(db: Session = Depends(get_db)):
    return crud.get_assets(db)


@router.post("/", response_model=schemas.AssetOut)
def create_asset(asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    return crud.create_asset(db, asset)


@router.get("/{asset_id}", response_model=schemas.AssetOut)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    obj = crud.get_asset(db, asset_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Asset not found")
    return obj


@router.patch("/{asset_id}", response_model=schemas.AssetOut)
def patch_asset(asset_id: int, patch: schemas.AssetUpdate, db: Session = Depends(get_db)):
    obj = crud.update_asset(db, asset_id, patch)
    if not obj:
        raise HTTPException(status_code=404, detail="Asset not found")
    return obj


@router.delete("/{asset_id}")
def remove_asset(asset_id: int, db: Session = Depends(get_db)):
    try:
        ok = crud.delete_asset(db, asset_id)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))  # 충돌(연결 데이터 존재)

    if not ok:
        raise HTTPException(status_code=404, detail="Asset not found")

    return {"ok": True}
