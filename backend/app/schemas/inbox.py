from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.enums import InboxItemStatus, InboxItemType


class InboxItemCreate(BaseModel):
    content: str = Field(max_length=20_000)
    type: InboxItemType = InboxItemType.TODO
    project_id: int | None = Field(default=None, ge=1)

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: str) -> str:
        content = value.strip()
        if not content:
            raise ValueError("内容不能为空")
        return content


class InboxItemUpdate(BaseModel):
    content: str | None = Field(default=None, max_length=20_000)
    type: InboxItemType | None = None
    project_id: int | None = Field(default=None, ge=1)
    status: InboxItemStatus | None = None

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: str | None) -> str | None:
        if value is None:
            raise ValueError("内容不能为空")
        content = value.strip()
        if not content:
            raise ValueError("内容不能为空")
        return content

    @field_validator("type", "status")
    @classmethod
    def reject_null_enum(cls, value: InboxItemType | InboxItemStatus | None):
        if value is None:
            raise ValueError("字段不能为 null")
        return value


class InboxItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    type: InboxItemType
    project_id: int | None
    status: InboxItemStatus
    created_at: datetime
    updated_at: datetime
    archived_at: datetime | None

    @field_validator("created_at", "updated_at", "archived_at", mode="before")
    @classmethod
    def ensure_utc_timezone(cls, value: datetime | None) -> datetime | None:
        if value is not None and value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value


class InboxItemListResponse(BaseModel):
    items: list[InboxItemResponse]
    page: int
    page_size: int
    total: int
    pages: int
