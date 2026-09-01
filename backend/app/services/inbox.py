from math import ceil

from sqlalchemy.orm import Session

from app.core.enums import InboxItemStatus, InboxItemType
from app.models.inbox import InboxItem, utc_now
from app.repositories import inbox as inbox_repository
from app.schemas.inbox import InboxItemCreate, InboxItemListResponse, InboxItemUpdate

TITLE_MAX_LENGTH = 80


def build_title(content: str) -> str:
    first_line = content.strip().splitlines()[0].strip()
    if len(first_line) <= TITLE_MAX_LENGTH:
        return first_line
    return f"{first_line[: TITLE_MAX_LENGTH - 1]}…"


def create_item(db: Session, payload: InboxItemCreate) -> InboxItem:
    item = InboxItem(
        title=build_title(payload.content),
        content=payload.content,
        type=payload.type,
        project_id=payload.project_id,
        status=InboxItemStatus.INBOX,
    )
    inbox_repository.create(db, item)
    db.commit()
    db.refresh(item)
    return item


def list_items(
    db: Session,
    *,
    page: int,
    page_size: int,
    query: str | None,
    item_type: InboxItemType | None,
    status: InboxItemStatus | None,
) -> InboxItemListResponse:
    items, total = inbox_repository.list_items(
        db,
        page=page,
        page_size=page_size,
        query=query,
        item_type=item_type,
        status=status,
    )
    return InboxItemListResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        pages=ceil(total / page_size) if total else 0,
    )


def update_item(db: Session, item: InboxItem, payload: InboxItemUpdate) -> InboxItem:
    values = payload.model_dump(exclude_unset=True)
    if "content" in values:
        item.content = values["content"]
        item.title = build_title(item.content)
    if "type" in values and values["type"] is not None:
        item.type = values["type"]
    if "project_id" in values:
        item.project_id = values["project_id"]
    if "status" in values and values["status"] is not None:
        item.status = values["status"]
        if item.status == InboxItemStatus.ARCHIVED:
            item.archived_at = item.archived_at or utc_now()
        else:
            item.archived_at = None
    item.updated_at = utc_now()
    db.commit()
    db.refresh(item)
    return item


def archive_item(db: Session, item: InboxItem) -> InboxItem:
    item.status = InboxItemStatus.ARCHIVED
    item.archived_at = item.archived_at or utc_now()
    item.updated_at = utc_now()
    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, item: InboxItem) -> None:
    inbox_repository.delete(db, item)
    db.commit()
