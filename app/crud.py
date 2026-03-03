from datetime import datetime
import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from sqlalchemy.orm import Session
from . import models, schemas


# =========
# Assets
# =========
def create_asset(db: Session, asset: schemas.AssetCreate) -> models.Asset:
    obj = models.Asset(name=asset.name, type=asset.type, balance=asset.balance)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_assets(db: Session) -> list[models.Asset]:
    return db.query(models.Asset).order_by(models.Asset.id.desc()).all()


def get_asset(db: Session, asset_id: int) -> models.Asset | None:
    return db.query(models.Asset).filter(models.Asset.id == asset_id).first()


def update_asset(db: Session, asset_id: int, patch: schemas.AssetUpdate) -> models.Asset | None:
    obj = get_asset(db, asset_id)
    if not obj:
        return None

    data = patch.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(obj, k, v)

    db.commit()
    db.refresh(obj)
    return obj


def delete_asset(db: Session, asset_id: int) -> bool:
    obj = get_asset(db, asset_id)
    if not obj:
        return False

    # 연결 데이터 존재 여부 체크 (있으면 삭제 금지)
    tx_exists = db.query(models.Transaction.id).filter(models.Transaction.asset_id == asset_id).first() is not None
    if tx_exists:
        raise ValueError("이 자산에 연결된 거래내역이 있어 삭제할 수 없습니다.")

    fx_exists = db.query(models.FixedExpense.id).filter(models.FixedExpense.asset_id == asset_id).first() is not None
    if fx_exists:
        raise ValueError("이 자산에 연결된 고정지출이 있어 삭제할 수 없습니다.")

    inv_exists = db.query(models.Investment.id).filter(models.Investment.asset_id == asset_id).first() is not None
    if inv_exists:
        raise ValueError("이 자산에 연결된 투자자산이 있어 삭제할 수 없습니다.")

    db.delete(obj)
    db.commit()
    return True



# ===============
# Transactions
# ===============
def create_transaction(db: Session, tx: schemas.TransactionCreate) -> models.Transaction:
    asset = get_asset(db, tx.asset_id)
    if not asset:
        raise ValueError("Asset not found")

    obj = models.Transaction(
        date=tx.date,
        type=tx.type,
        asset_id=tx.asset_id,
        category=tx.category,
        description=tx.description,
        amount=tx.amount,
    )
    db.add(obj)

    # 잔액 연동: income(+), expense(-)
    if tx.type == "income":
        asset.balance = (asset.balance or 0) + tx.amount
    elif tx.type == "expense":
        asset.balance = (asset.balance or 0) - tx.amount
    else:  # expense or investment
        asset.balance = (asset.balance or 0) - tx.amount

    db.commit()
    db.refresh(obj)
    return obj


def list_transactions(db: Session, limit: int = 200, offset: int = 0) -> list[models.Transaction]:
    return (
        db.query(models.Transaction)
        .order_by(models.Transaction.date.desc(), models.Transaction.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def delete_transaction(db: Session, tx_id: int) -> bool:
    obj = db.query(models.Transaction).filter(models.Transaction.id == tx_id).first()
    if not obj:
        return False

    asset = get_asset(db, obj.asset_id)
    if asset:
        # 삭제 시 잔액 되돌리기
        if obj.type == "income":
            asset.balance = (asset.balance or 0) - obj.amount
        elif obj.type in ("expense", "investment"):
            asset.balance = (asset.balance or 0) + obj.amount
        

    db.delete(obj)
    db.commit()
    return True

def _effect(tx_type: str, amount: float) -> float:
    return amount if tx_type == "income" else -amount  # expense/investment는 -

def update_transaction(db: Session, tx_id: int, patch: schemas.TransactionUpdate) -> models.Transaction | None:
    obj = db.query(models.Transaction).filter(models.Transaction.id == tx_id).first()
    if not obj:
        return None

    old_asset_id, old_type, old_amount = obj.asset_id, obj.type, obj.amount
    data = patch.model_dump(exclude_unset=True)

    new_asset_id = data.get("asset_id", old_asset_id)
    new_type = data.get("type", old_type)
    new_amount = data.get("amount", old_amount)

    old_asset = get_asset(db, old_asset_id)
    new_asset = get_asset(db, new_asset_id)
    if not old_asset or not new_asset:
        raise ValueError("Asset not found")

    # 1) 기존 거래 효과 제거
    old_asset.balance = (old_asset.balance or 0) - _effect(old_type, old_amount)

    # 2) 거래 내용 업데이트
    for k, v in data.items():
        setattr(obj, k, v)

    # 3) 새 거래 효과 적용
    new_asset.balance = (new_asset.balance or 0) + _effect(new_type, new_amount)

    db.commit()
    db.refresh(obj)
    return obj


# ===============
# Fixed Expenses
# ===============
def create_fixed_expense(db: Session, fx: schemas.FixedExpenseCreate) -> models.FixedExpense:
    obj = models.FixedExpense(
        category=fx.category,
        description=fx.description,
        amount=fx.amount,
        start_month=fx.start_month,
        end_month=fx.end_month,
        day_of_month=fx.day_of_month,
        asset_id=fx.asset_id,
        is_active=fx.is_active,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def list_fixed_expenses(db: Session, limit: int = 500, offset: int = 0) -> list[models.FixedExpense]:
    return (
        db.query(models.FixedExpense)
        .order_by(models.FixedExpense.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def delete_fixed_expense(db: Session, fx_id: int) -> bool:
    obj = db.query(models.FixedExpense).filter(models.FixedExpense.id == fx_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True


# ===============
# Investments
# ===============
def _normalize_symbol(symbol: str, inv_type: str) -> str:
    normalized = (symbol or "").strip().upper()
    if inv_type == "crypto" and normalized and "-" not in normalized:
        normalized = f"{normalized}-USD"
    return normalized


def _calc_roi(quantity: float, average_buy_price: float, current_price: float) -> float:
    invested = quantity * average_buy_price
    if invested <= 0:
        return 0.0
    current_value = quantity * current_price
    return ((current_value - invested) / invested) * 100


def _extract_market_price(payload: dict) -> float | None:
    result = payload.get("chart", {}).get("result") or []
    if not result:
        return None

    meta = result[0].get("meta", {}) or {}
    price = meta.get("regularMarketPrice")
    if price is not None:
        return float(price)

    quotes = result[0].get("indicators", {}).get("quote", [])
    closes = quotes[0].get("close", []) if quotes else []
    for value in reversed(closes):
        if value is not None:
            return float(value)
    return None


def _fetch_market_price(symbol: str) -> float | None:
    encoded = quote(symbol, safe="")
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{encoded}?interval=1m&range=1d"
    req = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "application/json",
        },
    )
    with urlopen(req, timeout=8) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    return _extract_market_price(payload)


def create_investment(db: Session, inv: schemas.InvestmentCreate) -> models.Investment:
    asset = get_asset(db, inv.asset_id)
    if not asset:
        raise ValueError("Asset not found")

    normalized_symbol = _normalize_symbol(inv.symbol, inv.type)
    if not normalized_symbol:
        raise ValueError("Symbol is required")

    base_price = inv.current_price or inv.average_buy_price
    now = datetime.utcnow()
    obj = models.Investment(
        asset_id=inv.asset_id,
        symbol=normalized_symbol,
        name=inv.name,
        type=inv.type,
        quantity=inv.quantity,
        average_buy_price=inv.average_buy_price,
        current_price=base_price,
        roi=_calc_roi(inv.quantity, inv.average_buy_price, base_price),
        last_updated=now if inv.current_price else None,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def list_investments(db: Session) -> list[models.Investment]:
    return db.query(models.Investment).order_by(models.Investment.id.desc()).all()


def get_investment(db: Session, investment_id: int) -> models.Investment | None:
    return db.query(models.Investment).filter(models.Investment.id == investment_id).first()


def update_investment(
    db: Session,
    investment_id: int,
    patch: schemas.InvestmentUpdate,
) -> models.Investment | None:
    obj = get_investment(db, investment_id)
    if not obj:
        return None

    data = patch.model_dump(exclude_unset=True)

    if "asset_id" in data:
        asset = get_asset(db, data["asset_id"])
        if not asset:
            raise ValueError("Asset not found")

    merged_type = data.get("type", obj.type)
    if "symbol" in data:
        data["symbol"] = _normalize_symbol(data["symbol"], merged_type)
        if not data["symbol"]:
            raise ValueError("Symbol is required")
    elif "type" in data:
        data["symbol"] = _normalize_symbol(obj.symbol, merged_type)

    for k, v in data.items():
        setattr(obj, k, v)

    if obj.current_price is None:
        obj.current_price = obj.average_buy_price

    obj.roi = _calc_roi(obj.quantity, obj.average_buy_price, obj.current_price)
    if "current_price" in data:
        obj.last_updated = datetime.utcnow()

    db.commit()
    db.refresh(obj)
    return obj


def delete_investment(db: Session, investment_id: int) -> bool:
    obj = get_investment(db, investment_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True


def refresh_investment_prices(db: Session) -> tuple[int, int]:
    targets = (
        db.query(models.Investment)
        .filter(models.Investment.type.in_(["stock", "crypto", "etf"]))
        .all()
    )

    updated_count = 0
    for inv in targets:
        try:
            market_price = _fetch_market_price(inv.symbol)
        except (URLError, HTTPError, TimeoutError, ValueError):
            continue
        except Exception:
            continue

        if market_price is None:
            continue

        inv.current_price = market_price
        inv.roi = _calc_roi(inv.quantity, inv.average_buy_price, market_price)
        inv.last_updated = datetime.utcnow()
        updated_count += 1

    if updated_count:
        db.commit()

    return len(targets), updated_count

# ===============
# Budgets
# ===============
def upsert_budget(db: Session, b: schemas.BudgetUpsert) -> models.Budget:
    obj = db.query(models.Budget).filter(models.Budget.category == b.category).first()
    if obj:
        obj.amount = b.amount
    else:
        obj = models.Budget(category=b.category, amount=b.amount)
        db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def list_budgets(db: Session) -> list[models.Budget]:
    return db.query(models.Budget).order_by(models.Budget.category.asc()).all()

def delete_budget(db: Session, budget_id: int) -> bool:
    obj = db.query(models.Budget).filter(models.Budget.id == budget_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True

def list_categories(db: Session, type: str | None = None) -> list[models.Category]:
    q = db.query(models.Category).filter(models.Category.is_active == True)
    if type:
        q = q.filter(models.Category.type == type)
    return q.order_by(models.Category.type.asc(), models.Category.sort_order.asc(), models.Category.name.asc()).all()


def create_category(db: Session, c: schemas.CategoryCreate) -> models.Category:
    obj = models.Category(
        type=c.type,
        name=c.name,
        sort_order=c.sort_order,
        is_active=c.is_active,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def delete_category(db: Session, category_id: int) -> bool:
    obj = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
