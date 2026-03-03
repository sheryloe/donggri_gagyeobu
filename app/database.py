from pathlib import Path
import os
import shutil
import sys

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import event


def _resolve_db_dir() -> Path:
    # Optional override for advanced users.
    custom = os.getenv("DONGGRI_LEDGER_DATA_DIR")
    if custom:
        return Path(custom).expanduser().resolve()

    # Frozen EXE: keep DB outside dist/_internal so rebuild does not wipe it.
    if getattr(sys, "frozen", False):
        local_app_data = Path(os.getenv("LOCALAPPDATA", str(Path.home() / "AppData" / "Local")))
        return local_app_data / "donggri-ledger" / "data"

    # Local development.
    return Path(__file__).resolve().parent.parent / "data"


DB_DIR = _resolve_db_dir()
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "ledger.db"


def _migrate_legacy_db_if_needed() -> None:
    if not getattr(sys, "frozen", False):
        return
    if DB_PATH.exists():
        return

    exe_dir = Path(sys.executable).resolve().parent
    legacy_candidates = [
        exe_dir / "_internal" / "data" / "ledger.db",
        exe_dir / "data" / "ledger.db",
    ]
    for old_path in legacy_candidates:
        if old_path.exists():
            try:
                shutil.copy2(old_path, DB_PATH)
                break
            except OSError:
                # Continue boot even if migration copy fails.
                pass


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
