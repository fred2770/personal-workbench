from collections.abc import Generator
from pathlib import Path
import sqlite3

from sqlalchemy import create_engine, event, text
from sqlalchemy.engine import Engine, URL, make_url
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import PROJECT_ROOT, settings


@event.listens_for(Engine, "connect")
def enable_sqlite_foreign_keys(dbapi_connection, _) -> None:
    if not isinstance(dbapi_connection, sqlite3.Connection):
        return
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


def normalize_database_url(database_url: str) -> str:
    """Normalize supported URLs without depending on the process working directory."""
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)

    url = make_url(database_url)
    if url.get_backend_name() == "sqlite" and url.database and url.database != ":memory:":
        database_path = Path(url.database)
        if not database_path.is_absolute():
            database_path = PROJECT_ROOT / database_path
            return url.set(database=database_path.as_posix()).render_as_string(hide_password=False)

    return database_url


def ensure_sqlite_directory(url: URL) -> None:
    if url.get_backend_name() != "sqlite" or not url.database or url.database == ":memory:":
        return

    database_path = Path(url.database)
    if not database_path.is_absolute():
        database_path = Path.cwd() / database_path
    database_path.parent.mkdir(parents=True, exist_ok=True)


database_url = normalize_database_url(settings.database_url)
parsed_database_url = make_url(database_url)
ensure_sqlite_directory(parsed_database_url)

connect_args = {"check_same_thread": False} if parsed_database_url.get_backend_name() == "sqlite" else {}
engine = create_engine(database_url, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    database = SessionLocal()
    try:
        yield database
    finally:
        database.close()


def check_database_connection() -> str:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return parsed_database_url.get_backend_name()
