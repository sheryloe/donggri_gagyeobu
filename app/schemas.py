from pydantic import BaseModel, Field
from datetime import datetime, date as dt_date
from typing import Optional, Literal


# ======================
# Assets
# ======================
class AssetBase(BaseModel):
    name: str = Field(..., min_length=1)
    type: str = Field(default="bank")  # bank/card/cash/investment
    balance: float = Field(default=0.0)


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    balance: Optional[float] = None


class AssetOut(AssetBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ======================
# Transactions
# ======================
TransactionType = Literal["income", "expense", "investment"]  # transfer는 다음에


class TransactionBase(BaseModel):
    date: dt_date
    type: TransactionType
    asset_id: int
    category: Optional[str] = None
    description: Optional[str] = None
    amount: float = Field(..., gt=0)


class TransactionCreate(TransactionBase):
    pass


class TransactionOut(TransactionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TransactionUpdate(BaseModel):
    date: Optional[dt_date] = None
    type: Optional[TransactionType] = None
    asset_id: Optional[int] = None
    category: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = Field(default=None, gt=0)




# ======================
# Fixed Expenses
# ======================
class FixedExpenseBase(BaseModel):
    category: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)

    start_month: str = Field(..., pattern=r"^\d{4}-\d{2}$")  # YYYY-MM
    end_month: str = Field(..., pattern=r"^\d{4}-\d{2}$")    # YYYY-MM (지금 UI는 필수)

    day_of_month: int = Field(default=1, ge=1, le=31)
    asset_id: Optional[int] = None
    is_active: bool = True


class FixedExpenseCreate(FixedExpenseBase):
    pass


class FixedExpenseOut(FixedExpenseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ======================
# Investments
# ======================
InvestmentType = Literal["stock", "crypto", "etf", "fund"]


class InvestmentBase(BaseModel):
    asset_id: int
    symbol: str = Field(..., min_length=1, max_length=30)
    name: Optional[str] = None
    type: InvestmentType = "stock"
    quantity: float = Field(..., gt=0)
    average_buy_price: float = Field(..., gt=0)
    current_price: Optional[float] = Field(default=None, gt=0)


class InvestmentCreate(InvestmentBase):
    pass


class InvestmentUpdate(BaseModel):
    asset_id: Optional[int] = None
    symbol: Optional[str] = Field(default=None, min_length=1, max_length=30)
    name: Optional[str] = None
    type: Optional[InvestmentType] = None
    quantity: Optional[float] = Field(default=None, gt=0)
    average_buy_price: Optional[float] = Field(default=None, gt=0)
    current_price: Optional[float] = Field(default=None, gt=0)


class InvestmentOut(InvestmentBase):
    id: int
    roi: Optional[float] = None
    last_updated: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class InvestmentRefreshOut(BaseModel):
    total: int
    updated: int

# ======================
# Budgets
# ======================
class BudgetUpsert(BaseModel):
    category: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)

class BudgetOut(BudgetUpsert):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
# ======================
# Categories
# ======================
class CategoryCreate(BaseModel):
    type: str = Field(..., min_length=1)  # expense/income/investment/fixed
    name: str = Field(..., min_length=1)
    sort_order: int = 0
    is_active: bool = True


class CategoryOut(CategoryCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
