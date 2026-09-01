from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.enums import ProjectPriority, ProjectStatus
from app.db.session import get_db
from app.models.project import Project
from app.schemas.project import (
    ProjectCreate,
    ProjectListResponse,
    ProjectResponse,
    ProjectUpdate,
)
from app.services import projects as project_service

router = APIRouter(prefix="/projects", tags=["projects"])


def project_not_found() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Project not found",
    )


def database_error(db: Session, error: SQLAlchemyError) -> HTTPException:
    db.rollback()
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Database operation failed",
    )


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Annotated[Session, Depends(get_db)],
) -> Project:
    try:
        return project_service.create_project(db, payload)
    except SQLAlchemyError as error:
        raise database_error(db, error) from error


@router.get("", response_model=ProjectListResponse)
def list_projects(
    db: Annotated[Session, Depends(get_db)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    q: Annotated[str | None, Query(max_length=200)] = None,
    status_filter: Annotated[ProjectStatus | None, Query(alias="status")] = None,
    priority_filter: Annotated[ProjectPriority | None, Query(alias="priority")] = None,
) -> ProjectListResponse:
    try:
        return project_service.list_projects(
            db,
            page=page,
            page_size=page_size,
            query=q,
            status=status_filter,
            priority=priority_filter,
        )
    except SQLAlchemyError as error:
        raise database_error(db, error) from error


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> Project:
    try:
        return project_service.require_project(db, project_id)
    except project_service.ProjectNotFoundError as error:
        raise project_not_found() from error
    except SQLAlchemyError as error:
        raise database_error(db, error) from error


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> Project:
    try:
        project = project_service.require_project(db, project_id)
        return project_service.update_project(db, project, payload)
    except project_service.ProjectNotFoundError as error:
        raise project_not_found() from error
    except SQLAlchemyError as error:
        raise database_error(db, error) from error


@router.post("/{project_id}/archive", response_model=ProjectResponse)
def archive_project(
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> Project:
    try:
        project = project_service.require_project(db, project_id)
        return project_service.archive_project(db, project)
    except project_service.ProjectNotFoundError as error:
        raise project_not_found() from error
    except SQLAlchemyError as error:
        raise database_error(db, error) from error


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    try:
        project = project_service.require_project(db, project_id)
        project_service.delete_project(db, project)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except project_service.ProjectNotFoundError as error:
        raise project_not_found() from error
    except SQLAlchemyError as error:
        raise database_error(db, error) from error
