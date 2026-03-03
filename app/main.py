from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .models import Asset, Transaction, FixedExpense, Investment, InvestmentTransaction, Budget, Category
from .routers import assets
from .routers import transactions
from .routers import fixed_expenses
from .routers import budgets
from .routers import categories
from .routers import investments
from .routers import categories as categories_router

from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import Category

## 시작하려면 명령어 python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

DEFAULT_CATS = {
    "expense": ["식비", "교통", "주거", "통신", "의료", "할부", "기타"],
    "income": ["월급", "상여", "부수입"],
    "investment": ["주식", "코인", "예적금"],
    "fixed": ["고정지출"]
}

def seed_categories():
    db: Session = SessionLocal()
    try:
        exists = db.query(Category.id).first() is not None
        if exists:
            return
        order = 0
        for t, names in DEFAULT_CATS.items():
            for name in names:
                db.add(Category(type=t, name=name, sort_order=order, is_active=True))
                order += 1
        db.commit()
    finally:
        db.close()



# 앱 초기화
app = FastAPI(
    title="Ultimate Ledger API",
    description="개인 가계부 & 투자 관리 시스템",
    version="1.0.0"
)

# CORS 설정 (프론트엔드 연동을 위해)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 환경용, 프로덕션에서는 특정 도메인만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터베이스 테이블 생성
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    seed_categories()
    print("Database table initialization completed.")


# 기본 엔드포인트
@app.get("/")
def root():
    return {
        "message": "Ultimate Ledger API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


#  라우터 추가 
app.include_router(assets.router, prefix="/api/assets", tags=["Assets"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(fixed_expenses.router, prefix="/api/fixed", tags=["FixedExpenses"])
app.include_router(budgets.router, prefix="/api/budgets", tags=["Budgets"])
app.include_router(investments.router, prefix="/api/investments", tags=["Investments"])

app.include_router(categories_router.router, prefix="/api/categories", tags=["Categories"])


import sys
from pathlib import Path
from fastapi.staticfiles import StaticFiles


def _resolve_web_dir() -> Path:
    base_dir = Path(__file__).resolve().parent.parent
    candidates = [
        base_dir / "web",
        Path(sys.executable).resolve().parent / "web",
        Path.cwd() / "web",
    ]
    for path in candidates:
        if path.exists():
            return path
    # Keep previous behavior as final fallback.
    return base_dir / "web"


app.mount("/ui", StaticFiles(directory=_resolve_web_dir(), html=True), name="ui")
