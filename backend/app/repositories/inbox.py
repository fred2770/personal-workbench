from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.enums import InboxItemStatus, InboxItemType
from app.models.inbox import InboxItem


def create(db: Session, item: InboxItem) -> InboxItem:
    db.add(item)
    db.flush()
    db.refresh(item)
    return item


def get_by_id(db: Session, item_id: int) -> InboxItem | None:
    return db.scalar(
        select(InboxItem)
        .options(selectinload(InboxItem.project))
        .where(InboxItem.id == item_id)
    )


def list_items(
    db: Session,
    *,
    page: int,
    page_size: int,
    query: str | None,
    item_type: InboxItemType | None,
    status: InboxItemStatus | None,
) -> tuple[list[InboxItem], int]:
    filters = []
    if query:
        pattern = f"%{query.strip()}%"
        filters.append(or_(InboxItem.title.ilike(pattern), InboxItem.content.ilike(pattern)))
    if item_type is not None:
        filters.append(InboxItem.type == item_type)
    if status is not None:
        filters.append(InboxItem.status == status)

    total = db.scalar(select(func.count()).select_from(InboxItem).where(*filters)) or 0
    statement = (
        select(InboxItem)
        .options(selectinload(InboxItem.project))
        .where(*filters)
        .order_by(InboxItem.created_at.desc(), InboxItem.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return list(db.scalars(statement).all()), total


def delete(db: Session, item: InboxItem) -> None:
    db.delete(item)
