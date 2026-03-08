from pathlib import Path
import os
import shutil
import sys

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import event


def _default_appdata_dir() -> Path:
    local_app_data = Path(os.getenv("LOCALAPPDATA", str(Path.home() / "AppData" / "Local")))
    return local_app_data / "donggri-ledger" / "data"


def _repo_data_dir() -> Path:
    return Path(__file__).resolve().parent.parent / "data"


def _resolve_db_dir() -> Path:
    # Optional override for advanced users.
    custom = os.getenv("DONGGRI_LEDGER_DATA_DIR")
    if custom:
        return Path(custom).expanduser().resolve()

    # Use a single default location for both EXE and local runs.
    return _default_appdata_dir()


DB_DIR = _resolve_db_dir()
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "ledger.db"


def _safe_copy_if_needed(source: Path, target: Path) -> bool:
    if not source.exists():
        return False

    try:
        if target.exists():
            # Keep the newer DB when both paths exist.
            if source.resolve() == target.resolve():
                return False
            if source.stat().st_mtime <= target.stat().st_mtime + 1:
                return False
        shutil.copy2(source, target)
        return True
    except OSError:
        # Continue boot even if copy fails.
        return False


def _migrate_legacy_db_if_needed() -> None:
    if os.getenv("DONGGRI_LEDGER_DATA_DIR"):
        return

    # Bring local/dev DB into the canonical AppData DB when needed.
    repo_db = _repo_data_dir() / "ledger.db"
    _safe_copy_if_needed(repo_db, DB_PATH)

    # EXE migration: copy old bundled DB locations if present.
    if not getattr(sys, "frozen", False):
        return

    exe_dir = Path(sys.executable).resolve().parent
    legacy_candidates = (
        exe_dir / "_internal" / "data" / "ledger.db",
        exe_dir / "data" / "ledger.db",
    )
    for old_path in legacy_candidates:
        if _safe_copy_if_needed(old_path, DB_PATH):
            break


_migrate_legacy_db_if_needed()
DATABASE_URL = f"sqlite:///{DB_PATH}"

# SQLAlchemy 엔진 생성
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite용 설정
)

# 세션 팩토리
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 클래스
Base = declarative_base()

# DB 세션 의존성 (FastAPI에서 사용)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.close()


def run_lightweight_migrations() -> None:
    """Apply minimal additive schema updates for existing SQLite files."""
    with engine.begin() as conn:
        asset_rows = conn.exec_driver_sql("PRAGMA table_info(assets)").fetchall()
        asset_cols = {row[1] for row in asset_rows}

        if "card_settlement_day" not in asset_cols:
            conn.exec_driver_sql(
                "ALTER TABLE assets ADD COLUMN card_settlement_day INTEGER"
            )
        if "card_settlement_asset_id" not in asset_cols:
            conn.exec_driver_sql(
                "ALTER TABLE assets ADD COLUMN card_settlement_asset_id INTEGER"
            )

        rows = conn.exec_driver_sql("PRAGMA table_info(transactions)").fetchall()
        cols = {row[1] for row in rows}

        if "payment_method" not in cols:
            conn.exec_driver_sql(
                "ALTER TABLE transactions ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'asset'"
            )
        if "card_asset_id" not in cols:
            conn.exec_driver_sql(
                "ALTER TABLE transactions ADD COLUMN card_asset_id INTEGER"
            )
        if "settlement_date" not in cols:
            conn.exec_driver_sql(
                "ALTER TABLE transactions ADD COLUMN settlement_date DATE"
            )
        if "is_settled" not in cols:
            conn.exec_driver_sql(
                "ALTER TABLE transactions ADD COLUMN is_settled INTEGER NOT NULL DEFAULT 0"
            )

        conn.exec_driver_sql(
            "UPDATE transactions SET payment_method='asset' WHERE payment_method IS NULL OR payment_method=''"
        )
        conn.exec_driver_sql(
            "UPDATE transactions SET is_settled=0 WHERE is_settled IS NULL"
        )
