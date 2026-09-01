from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum as SqlEnum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import InboxItemStatus, InboxItemType
from app.db.base import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class InboxItem(Base):
    __tablename__ = "inbox_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[InboxItemType] = mapped_column(
        SqlEnum(
            InboxItemType,
            name="inbox_item_type",
            native_enum=False,
            create_constraint=True,
            validate_strings=True,
            values_callable=lambda enum: [item.value for item in enum],
        ),
        nullable=False,
        index=True,
    )
    project_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    status: Mapped[InboxItemStatus] = mapped_column(
        SqlEnum(
            InboxItemStatus,
            name="inbox_item_status",
            native_enum=False,
            create_constraint=True,
            validate_strings=True,
            values_callable=lambda enum: [item.value for item in enum],
        ),
        nullable=False,
        default=InboxItemStatus.INBOX,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )
    archived_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
