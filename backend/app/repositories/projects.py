from sqlalchemy import func, or_, select, update
from sqlalchemy.orm import Session

from app.core.enums import ProjectPriority, ProjectStatus
from app.models.inbox import InboxItem
from app.models.project import Project


def create(db: Session, project: Project) -> Project:
    db.add(project)
    db.flush()
    db.refresh(project)
    return project


def get_by_id(db: Session, project_id: int) -> Project | None:
    return db.get(Project, project_id)


def list_projects(
    db: Session,
    *,
    page: int,
    page_size: int,
    query: str | None,
    status: ProjectStatus | None,
    priority: ProjectPriority | None,
) -> tuple[list[Project], int]:
    filters = []
    if query:
        pattern = f"%{query.strip()}%"
        filters.append(or_(Project.name.ilike(pattern), Project.description.ilike(pattern)))
    if status is not None:
        filters.append(Project.status == status)
    else:
        filters.append(Project.status != ProjectStatus.ARCHIVED)
    if priority is not None:
        filters.append(Project.priority == priority)

    total = db.scalar(select(func.count()).select_from(Project).where(*filters)) or 0
    statement = (
        select(Project)
        .where(*filters)
        .order_by(Project.updated_at.desc(), Project.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return list(db.scalars(statement).all()), total


def clear_inbox_project_id(db: Session, project_id: int) -> None:
    db.execute(
        update(InboxItem)
        .where(InboxItem.project_id == project_id)
        .values(project_id=None)
    )


def delete(db: Session, project: Project) -> None:
    db.delete(project)
