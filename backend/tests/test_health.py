from fastapi.testclient import TestClient

from app.db.session import normalize_database_url


def test_health_check_returns_api_and_database_status(client: TestClient) -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "Personal Workbench API",
        "version": "0.1.0",
        "database": "sqlite",
    }


def test_generic_postgresql_url_uses_psycopg_3_driver() -> None:
    database_url = "postgresql://workbench:secret@localhost:5432/workbench"

    assert normalize_database_url(database_url) == (
        "postgresql+psycopg://workbench:secret@localhost:5432/workbench"
    )
