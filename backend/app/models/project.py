from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, Enum as SqlEnum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import ProjectPriority, ProjectStatus
from app.db.base import Base
from app.models.inbox import utc_now

if TYPE_CHECKING:
    from app.models.inbox import InboxItem


class Project(Base):
    __tablename__ = "projects"
    __table_args__ = (
        CheckConstraint("progress >= 0 AND progress <= 100", name="ck_projects_progress_range"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[ProjectStatus] = mapped_column(
        SqlEnum(
            ProjectStatus,
            name="project_status",
            native_enum=False,
            create_constraint=True,
            validate_strings=True,
            values_callable=lambda enum: [item.value for item in enum],
        ),
        nullable=False,
        default=ProjectStatus.PLANNING,
        index=True,
    )
    priority: Mapped[ProjectPriority] = mapped_column(
        SqlEnum(
            ProjectPriority,
            name="project_priority",
            native_enum=False,
            create_constraint=True,
            validate_strings=True,
            values_callable=lambda enum: [item.value for item in enum],
        ),
        nullable=False,
        default=ProjectPriority.NORMAL,
        index=True,
    )
    progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )
    archived_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    inbox_items: Mapped[list[InboxItem]] = relationship(
        back_populates="project",
        passive_deletes=True,
    )
