from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.db.session import check_database_connection
from app.schemas.health import HealthResponse


router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="Service health check")
def health_check() -> HealthResponse:
    try:
        database_backend = check_database_connection()
    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable",
        ) from error

    return HealthResponse(
        service=settings.app_name,
        version=settings.app_version,
        database=database_backend,
    )
