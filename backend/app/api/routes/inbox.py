from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.enums import InboxItemStatus, InboxItemType
from app.db.session import get_db
from app.models.inbox import InboxItem
from app.repositories import inbox as inbox_repository
from app.schemas.inbox import (
    InboxItemCreate,
    InboxItemListResponse,
    InboxItemResponse,
    InboxItemUpdate,
)
from app.services import inbox as inbox_service
from app.services import projects as project_service

router = APIRouter(prefix="/inbox", tags=["inbox"])


def get_item_or_404(db: Session, item_id: int) -> InboxItem:
    item = inbox_repository.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inbox item not found")
    return item


def database_error(db: Session, error: SQLAlchemyError) -> HTTPException:
    db.rollback()
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Database operation failed",
    )


@router.post("", response_model=InboxItemResponse, status_code=status.HTTP_201_CREATED)
def create_inbox_item(
    payload: InboxItemCreate,
    db: Annotated[Session, Depends(get_db)],
) -> InboxItem:
    try:
        return inbox_service.create_item(db, payload)
    except project_service.ProjectNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found") from error
    except SQLAlchemyError as error:
        raise database_error(db, error) from error


@router.get("", response_model=InboxItemListResponse)
def list_inbox_items(
    db: Annotated[Session, Depends(get_db)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    q: Annotated[str | None, Query(max_length=200)] = None,
    item_type: Annotated[InboxItemType | None, Query(alias="type")] = None,
    status_filter: Annotated[InboxItemStatus | None, Query(alias="status")] = None,
) -> InboxItemListResponse:
    try:
        return inbox_service.list_items(
            db,
            page=page,
            page_size=page_size,
            query=q,
            item_type=item_type,
            status=status_filter,
        )
    except SQLAlchemyError as error:
        raise database_error(db, error) from error


@router.get("/{item_id}", response_model=InboxItemResponse)
def get_inbox_item(
    item_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> InboxItem:
    try:
        return get_item_or_404(db, item_id)
    except SQLAlchemyError as error:
        raise database_error(db, error) from error


@router.patch("/{item_id}", response_model=InboxItemResponse)
def update_inbox_item(
    item_id: int,
    payload: InboxItemUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> InboxItem:
    try:
        return inbox_service.update_item(db, get_item_or_404(db, item_id), payload)
    except project_service.ProjectNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found") from error
    except SQLAlchemyError as error:
        raise database_error(db, error) from error


@router.post("/{item_id}/archive", response_model=InboxItemResponse)
def archive_inbox_item(
    item_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> InboxItem:
    try:
        return inbox_service.archive_item(db, get_item_or_404(db, item_id))
    except SQLAlchemyError as error:
        raise database_error(db, error) from error


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inbox_item(
    item_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    try:
        inbox_service.delete_item(db, get_item_or_404(db, item_id))
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except SQLAlchemyError as error:
        raise database_error(db, error) from error
