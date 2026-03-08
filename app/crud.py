from datetime import datetime, date as dt_date
import calendar
import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from sqlalchemy.orm import Session
from . import models, schemas


# =========
# Assets
# =========
def _normalize_asset_card_settings(
    asset_type: str,
    card_settlement_day: int | None,
    card_settlement_asset_id: int | None,
) -> tuple[int | None, int | None]:
    if (asset_type or "").lower() != "card":
        return None, None
    return card_settlement_day, card_settlement_asset_id


def create_asset(db: Session, asset: schemas.AssetCreate) -> models.Asset:
    card_day, card_settlement_asset_id = _normalize_asset_card_settings(
        asset.type,
        asset.card_settlement_day,
        asset.card_settlement_asset_id,
    )
    if (asset.type or "").lower() == "card":
        if card_day is None:
            raise ValueError("카드 자산은 결제일(매월 몇 일)이 필요합니다.")
        if card_settlement_asset_id is None:
            raise ValueError("카드 자산은 결제 통장 설정이 필요합니다.")
        settlement_asset = get_asset(db, card_settlement_asset_id)
        if not settlement_asset:
            raise ValueError("카드 결제 통장 자산을 찾을 수 없습니다.")
        if (settlement_asset.type or "").lower() not in ("cash", "bank"):
            raise ValueError("카드 결제 통장은 은행/현금 자산이어야 합니다.")

    obj = models.Asset(
        name=asset.name,
        type=asset.type,
        balance=asset.balance,
        card_settlement_day=card_day,
        card_settlement_asset_id=card_settlement_asset_id,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_assets(db: Session) -> list[models.Asset]:
    settle_due_card_transactions(db)
    return db.query(models.Asset).order_by(models.Asset.id.desc()).all()


def get_asset(db: Session, asset_id: int) -> models.Asset | None:
    return db.query(models.Asset).filter(models.Asset.id == asset_id).first()


def update_asset(db: Session, asset_id: int, patch: schemas.AssetUpdate) -> models.Asset | None:
    obj = get_asset(db, asset_id)
    if not obj:
        return None

    data = patch.model_dump(exclude_unset=True)
    merged_type = data.get("type", obj.type)
    if merged_type.lower() != "card":
        data["card_settlement_day"] = None
        data["card_settlement_asset_id"] = None
    elif "card_settlement_day" not in data and "card_settlement_asset_id" not in data:
        data["card_settlement_day"] = obj.card_settlement_day
        data["card_settlement_asset_id"] = obj.card_settlement_asset_id

    if merged_type.lower() == "card":
        final_day = data.get("card_settlement_day", obj.card_settlement_day)
        final_asset_id = data.get("card_settlement_asset_id", obj.card_settlement_asset_id)
        if final_day is None:
            raise ValueError("카드 자산은 결제일(매월 몇 일)이 필요합니다.")
        if final_asset_id is None:
            raise ValueError("카드 자산은 결제 통장 설정이 필요합니다.")
        settlement_asset = get_asset(db, final_asset_id)
        if not settlement_asset:
            raise ValueError("카드 결제 통장 자산을 찾을 수 없습니다.")
        if settlement_asset.id == asset_id:
            raise ValueError("카드 결제 통장은 자기 자신으로 설정할 수 없습니다.")
        if (settlement_asset.type or "").lower() not in ("cash", "bank"):
            raise ValueError("카드 결제 통장은 은행/현금 자산이어야 합니다.")

    for k, v in data.items():
        setattr(obj, k, v)

    db.commit()
    db.refresh(obj)
    return obj


def delete_asset(db: Session, asset_id: int, force: bool = False) -> bool:
    obj = get_asset(db, asset_id)
    if not obj:
        return False

    tx_count = (
        db.query(models.Transaction.id)
        .filter(
            (models.Transaction.asset_id == asset_id)
            | (models.Transaction.card_asset_id == asset_id)
        )
        .count()
    )
    fx_count = db.query(models.FixedExpense.id).filter(models.FixedExpense.asset_id == asset_id).count()
    inv_count = db.query(models.Investment.id).filter(models.Investment.asset_id == asset_id).count()
    card_cfg_count = (
        db.query(models.Asset.id)
        .filter(models.Asset.card_settlement_asset_id == asset_id)
        .count()
    )

    has_refs = (tx_count + fx_count + inv_count + card_cfg_count) > 0
    if has_refs and not force:
        latest_tx = (
            db.query(models.Transaction)
            .filter(
                (models.Transaction.asset_id == asset_id)
                | (models.Transaction.card_asset_id == asset_id)
            )
            .order_by(models.Transaction.date.desc(), models.Transaction.id.desc())
            .first()
        )
        tx_hint = ""
        if latest_tx:
            tx_type_label = {"income": "수입", "expense": "지출", "investment": "투자"}.get(
                latest_tx.type,
                latest_tx.type,
            )
            tx_hint = (
                f" | 예시 거래: {latest_tx.date} {tx_type_label} "
                f"{latest_tx.description or '-'} {int(latest_tx.amount):,}원"
            )
        raise ValueError(
            f"연결된 데이터가 있어 삭제할 수 없습니다. 거래 {tx_count}건, 고정지출 {fx_count}건, 투자 {inv_count}건, 카드결제설정 {card_cfg_count}건{tx_hint}"
        )

    if has_refs and force:
        investment_ids = [
            inv_id
            for (inv_id,) in db.query(models.Investment.id).filter(models.Investment.asset_id == asset_id).all()
        ]
        if investment_ids:
            (
                db.query(models.InvestmentTransaction)
                .filter(models.InvestmentTransaction.investment_id.in_(investment_ids))
                .delete(synchronize_session=False)
            )

        (
            db.query(models.Transaction)
            .filter(
                (models.Transaction.asset_id == asset_id)
                | (models.Transaction.card_asset_id == asset_id)
            )
            .delete(synchronize_session=False)
        )
        (
            db.query(models.Asset)
            .filter(models.Asset.card_settlement_asset_id == asset_id)
            .update(
                {models.Asset.card_settlement_asset_id: None},
                synchronize_session=False,
            )
        )
        db.query(models.FixedExpense).filter(models.FixedExpense.asset_id == asset_id).delete(synchronize_session=False)
        db.query(models.Investment).filter(models.Investment.asset_id == asset_id).delete(synchronize_session=False)

    db.delete(obj)
    db.commit()
    return True



# ===============
# Transactions
# ===============
def _effect(tx_type: str, amount: float) -> float:
    return amount if tx_type == "income" else -amount


def _normalize_payment_method(payment_method: str | None) -> str:
    return "card" if payment_method == "card" else "asset"


def _is_card_payment(payment_method: str, tx_type: str) -> bool:
    return payment_method == "card" and tx_type in ("expense", "investment")


def _compute_card_settlement_date(tx_date: dt_date, settlement_day: int) -> dt_date:
    year = tx_date.year
    month = tx_date.month + 1
    if month > 12:
        year += 1
        month = 1
    last_day = calendar.monthrange(year, month)[1]
    day = max(1, min(int(settlement_day), last_day))
    return dt_date(year, month, day)


def _resolve_card_payment_fields(
    db: Session,
    *,
    tx_date: dt_date,
    fallback_asset_id: int | None,
    tx_type: str,
    payment_method: str,
    card_asset_id: int | None,
    settlement_date: dt_date | None,
) -> tuple[int, int, dt_date]:
    if not _is_card_payment(payment_method, tx_type):
        if fallback_asset_id is None:
            raise ValueError("Asset not found")
        return fallback_asset_id, 0, settlement_date or tx_date

    if card_asset_id is None:
        raise ValueError("신용카드 결제는 카드 자산을 선택해야 합니다.")

    card_asset = get_asset(db, card_asset_id)
    if not card_asset:
        raise ValueError("Card asset not found")
    if (card_asset.type or "").lower() != "card":
        raise ValueError("선택한 결제수단은 카드 자산이어야 합니다.")

    settlement_asset_id = card_asset.card_settlement_asset_id
    if settlement_asset_id is None and fallback_asset_id is not None:
        fallback_asset = get_asset(db, fallback_asset_id)
        if fallback_asset and (fallback_asset.type or "").lower() != "card":
            settlement_asset_id = fallback_asset_id
    if settlement_asset_id is None:
        raise ValueError("카드 설정에서 결제 통장을 먼저 지정해주세요.")
    settlement_asset = get_asset(db, settlement_asset_id)
    if not settlement_asset:
        raise ValueError("카드 결제 통장 자산을 찾을 수 없습니다.")
    if (settlement_asset.type or "").lower() not in ("cash", "bank"):
        raise ValueError("카드 결제 통장은 은행/현금 자산이어야 합니다.")

    resolved_date = settlement_date
    if resolved_date is None:
        day = card_asset.card_settlement_day
        if day is None:
            raise ValueError("카드 설정에서 결제일(매월 몇 일)을 먼저 지정해주세요.")
        resolved_date = _compute_card_settlement_date(tx_date, day)
    return settlement_asset_id, card_asset.id, resolved_date


def settle_due_card_transactions(db: Session, as_of: dt_date | None = None) -> int:
    target_date = as_of or datetime.now().date()
    due_txs = (
        db.query(models.Transaction)
        .filter(models.Transaction.payment_method == "card")
        .filter(models.Transaction.is_settled == False)
        .filter(models.Transaction.settlement_date.isnot(None))
        .filter(models.Transaction.settlement_date <= target_date)
        .all()
    )

    settled_count = 0
    for tx in due_txs:
        asset = get_asset(db, tx.asset_id)
        if not asset:
            continue
        asset.balance = (asset.balance or 0) - tx.amount
        tx.is_settled = True
        settled_count += 1

    if settled_count:
        db.commit()
    return settled_count


def create_transaction(db: Session, tx: schemas.TransactionCreate) -> models.Transaction:
    settle_due_card_transactions(db)

    input_asset = get_asset(db, tx.asset_id)
    if not input_asset:
        raise ValueError("Asset not found")

    payment_method = _normalize_payment_method(tx.payment_method)
    resolved_card_asset_id = tx.card_asset_id
    if (
        (input_asset.type or "").lower() == "card"
        and tx.type in ("expense", "investment")
        and payment_method != "card"
    ):
        payment_method = "card"
        resolved_card_asset_id = input_asset.id

    if payment_method == "card" and tx.type == "income":
        raise ValueError("수입은 신용카드 결제 방식으로 등록할 수 없습니다.")

    resolved_asset_id, resolved_card_asset_id, resolved_settlement_date = _resolve_card_payment_fields(
        db,
        tx_date=tx.date,
        fallback_asset_id=tx.asset_id,
        tx_type=tx.type,
        payment_method=payment_method,
        card_asset_id=resolved_card_asset_id,
        settlement_date=tx.settlement_date,
    )
    settlement_asset = get_asset(db, resolved_asset_id)
    if not settlement_asset:
        raise ValueError("Asset not found")

    is_card = _is_card_payment(payment_method, tx.type)
    obj = models.Transaction(
        date=tx.date,
        type=tx.type,
        asset_id=resolved_asset_id,
        payment_method=payment_method,
        card_asset_id=resolved_card_asset_id if is_card else None,
        settlement_date=resolved_settlement_date if is_card else None,
        is_settled=False,
        category=tx.category,
        description=tx.description,
        amount=tx.amount,
    )
    db.add(obj)

    if is_card:
        if resolved_settlement_date and resolved_settlement_date <= datetime.now().date():
            settlement_asset.balance = (settlement_asset.balance or 0) - tx.amount
            obj.is_settled = True
    else:
        settlement_asset.balance = (settlement_asset.balance or 0) + _effect(tx.type, tx.amount)

    db.commit()
    db.refresh(obj)
    return obj


def list_transactions(db: Session, limit: int = 200, offset: int = 0) -> list[models.Transaction]:
    settle_due_card_transactions(db)
    return (
        db.query(models.Transaction)
        .order_by(models.Transaction.date.desc(), models.Transaction.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def delete_transaction(db: Session, tx_id: int) -> bool:
    settle_due_card_transactions(db)

    obj = db.query(models.Transaction).filter(models.Transaction.id == tx_id).first()
    if not obj:
        return False

    asset = get_asset(db, obj.asset_id)
    payment_method = _normalize_payment_method(getattr(obj, "payment_method", "asset"))

    if asset:
        if _is_card_payment(payment_method, obj.type):
            if obj.is_settled:
                asset.balance = (asset.balance or 0) + obj.amount
        else:
            asset.balance = (asset.balance or 0) - _effect(obj.type, obj.amount)

    db.delete(obj)
    db.commit()
    return True


def update_transaction(db: Session, tx_id: int, patch: schemas.TransactionUpdate) -> models.Transaction | None:
    settle_due_card_transactions(db)

    obj = db.query(models.Transaction).filter(models.Transaction.id == tx_id).first()
    if not obj:
        return None

    old_asset_id = obj.asset_id
    old_type = obj.type
    old_amount = obj.amount
    old_payment_method = _normalize_payment_method(getattr(obj, "payment_method", "asset"))
    old_is_settled = bool(getattr(obj, "is_settled", False))
    old_card_asset_id = getattr(obj, "card_asset_id", None)
    old_settlement_date = getattr(obj, "settlement_date", None)

    data = patch.model_dump(exclude_unset=True)

    new_date = data.get("date", obj.date)
    new_asset_id = data.get("asset_id", old_asset_id)
    new_type = data.get("type", old_type)
    new_amount = data.get("amount", old_amount)
    new_payment_method = _normalize_payment_method(data.get("payment_method", old_payment_method))
    new_card_asset_id = data.get("card_asset_id", old_card_asset_id)
    new_settlement_date = data.get("settlement_date", old_settlement_date)

    input_new_asset = get_asset(db, new_asset_id)
    if not input_new_asset:
        raise ValueError("Asset not found")
    if (
        (input_new_asset.type or "").lower() == "card"
        and new_type in ("expense", "investment")
        and new_payment_method != "card"
    ):
        new_payment_method = "card"
        new_card_asset_id = input_new_asset.id

    if new_payment_method == "card" and new_type == "income":
        raise ValueError("수입은 신용카드 결제 방식으로 등록할 수 없습니다.")

    resolved_asset_id, resolved_card_asset_id, resolved_settlement_date = _resolve_card_payment_fields(
        db,
        tx_date=new_date,
        fallback_asset_id=new_asset_id,
        tx_type=new_type,
        payment_method=new_payment_method,
        card_asset_id=new_card_asset_id,
        settlement_date=new_settlement_date,
    )

    old_asset = get_asset(db, old_asset_id)
    new_asset = get_asset(db, resolved_asset_id)
    if not old_asset or not new_asset:
        raise ValueError("Asset not found")

    # 1) 기존 거래 효과 제거
    if _is_card_payment(old_payment_method, old_type):
        if old_is_settled:
            old_asset.balance = (old_asset.balance or 0) + old_amount
    else:
        old_asset.balance = (old_asset.balance or 0) - _effect(old_type, old_amount)

    # 2) 거래 내용 업데이트
    for k, v in data.items():
        setattr(obj, k, v)

    obj.payment_method = new_payment_method
    obj.asset_id = resolved_asset_id
    now_date = datetime.now().date()

    # 3) 새 거래 효과 적용
    if _is_card_payment(new_payment_method, new_type):
        obj.card_asset_id = resolved_card_asset_id
        obj.settlement_date = resolved_settlement_date
        should_settle = bool(resolved_settlement_date and resolved_settlement_date <= now_date)
        obj.is_settled = should_settle
        if should_settle:
            new_asset.balance = (new_asset.balance or 0) - new_amount
    else:
        obj.card_asset_id = None
        obj.settlement_date = None
        obj.is_settled = False
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

