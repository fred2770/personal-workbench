import os
from pathlib import Path
import sqlite3
import subprocess
import sys


BACKEND_DIR = Path(__file__).resolve().parents[1]


def run_alembic(database_path: Path, revision: str) -> None:
    environment = os.environ.copy()
    environment["DATABASE_URL"] = f"sqlite:///{database_path.as_posix()}"
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", revision],
        cwd=BACKEND_DIR,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stderr


def test_project_migration_preserves_existing_inbox_rows(tmp_path: Path) -> None:
    database_path = tmp_path / "migration-test.db"
    run_alembic(database_path, "20260901_0001")

    with sqlite3.connect(database_path) as connection:
        connection.execute(
            """
            INSERT INTO inbox_items
                (title, content, type, project_id, status, created_at, updated_at, archived_at)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "迁移前记录",
                "迁移前 Inbox 正文",
                "TODO",
                999,
                "INBOX",
                "2026-09-01 00:00:00",
                "2026-09-01 00:00:00",
                None,
            ),
        )
        connection.commit()

    run_alembic(database_path, "head")

    with sqlite3.connect(database_path) as connection:
        row = connection.execute(
            "SELECT title, content, project_id FROM inbox_items"
        ).fetchone()
        foreign_keys = connection.execute("PRAGMA foreign_key_list(inbox_items)").fetchall()

    assert row == ("迁移前记录", "迁移前 Inbox 正文", None)
    assert any(
        key[2] == "projects" and key[3] == "project_id" and key[6] == "SET NULL"
        for key in foreign_keys
    )
