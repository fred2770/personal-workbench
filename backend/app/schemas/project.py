from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.enums import ProjectPriority, ProjectStatus


def normalize_name(value: str) -> str:
    name = value.strip()
    if not name:
        raise ValueError("项目名称不能为空")
    return name


class ProjectCreate(BaseModel):
    name: str = Field(max_length=160)
    description: str = Field(default="", max_length=5_000)
    status: ProjectStatus = ProjectStatus.PLANNING
    priority: ProjectPriority = ProjectPriority.NORMAL
    progress: int = Field(default=0, ge=0, le=100)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return normalize_name(value)

    @field_validator("description")
    @classmethod
    def normalize_description(cls, value: str) -> str:
        return value.strip()


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=160)
    description: str | None = Field(default=None, max_length=5_000)
    status: ProjectStatus | None = None
    priority: ProjectPriority | None = None
    progress: int | None = Field(default=None, ge=0, le=100)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("项目名称不能为空")
        return normalize_name(value)

    @field_validator("description")
    @classmethod
    def normalize_description(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("项目描述不能为 null")
        return value.strip()

    @field_validator("status", "priority", "progress")
    @classmethod
    def reject_null_fields(cls, value):
        if value is None:
            raise ValueError("字段不能为 null")
        return value


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    status: ProjectStatus
    priority: ProjectPriority
    progress: int
    created_at: datetime
    updated_at: datetime
    archived_at: datetime | None

    @field_validator("created_at", "updated_at", "archived_at", mode="before")
    @classmethod
    def ensure_utc_timezone(cls, value: datetime | None) -> datetime | None:
        if value is not None and value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value


class ProjectListResponse(BaseModel):
    items: list[ProjectResponse]
    page: int
    page_size: int
    total: int
    pages: int
