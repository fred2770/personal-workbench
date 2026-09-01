from math import ceil

from sqlalchemy.orm import Session

from app.core.enums import ProjectPriority, ProjectStatus
from app.models.inbox import utc_now
from app.models.project import Project
from app.repositories import projects as project_repository
from app.schemas.project import ProjectCreate, ProjectListResponse, ProjectUpdate


class ProjectNotFoundError(Exception):
    pass


def require_project(db: Session, project_id: int) -> Project:
    project = project_repository.get_by_id(db, project_id)
    if project is None:
        raise ProjectNotFoundError
    return project


def create_project(db: Session, payload: ProjectCreate) -> Project:
    project = Project(
        name=payload.name,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
        progress=payload.progress,
        archived_at=utc_now() if payload.status == ProjectStatus.ARCHIVED else None,
    )
    project_repository.create(db, project)
    db.commit()
    db.refresh(project)
    return project


def list_projects(
    db: Session,
    *,
    page: int,
    page_size: int,
    query: str | None,
    status: ProjectStatus | None,
    priority: ProjectPriority | None,
) -> ProjectListResponse:
    projects, total = project_repository.list_projects(
        db,
        page=page,
        page_size=page_size,
        query=query,
        status=status,
        priority=priority,
    )
    return ProjectListResponse(
        items=projects,
        page=page,
        page_size=page_size,
        total=total,
        pages=ceil(total / page_size) if total else 0,
    )


def update_project(db: Session, project: Project, payload: ProjectUpdate) -> Project:
    values = payload.model_dump(exclude_unset=True)
    for field in ("name", "description", "priority", "progress"):
        if field in values:
            setattr(project, field, values[field])
    if "status" in values:
        project.status = values["status"]
        if project.status == ProjectStatus.ARCHIVED:
            project.archived_at = project.archived_at or utc_now()
        else:
            project.archived_at = None
    project.updated_at = utc_now()
    db.commit()
    db.refresh(project)
    return project


def archive_project(db: Session, project: Project) -> Project:
    project.status = ProjectStatus.ARCHIVED
    project.archived_at = project.archived_at or utc_now()
    project.updated_at = utc_now()
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project: Project) -> None:
    project_repository.clear_inbox_project_id(db, project.id)
    project_repository.delete(db, project)
    db.commit()
