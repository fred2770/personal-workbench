"""create inbox items

Revision ID: 20260901_0001
Revises:
Create Date: 2026-09-01 00:00:00
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260901_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

inbox_item_type = sa.Enum(
    "TODO",
    "ISSUE",
    "BUG",
    "REQUIREMENT",
    "FOLLOW_UP",
    "SITE_FEEDBACK",
    "MEMO",
    name="inbox_item_type",
    native_enum=False,
    create_constraint=True,
)
inbox_item_status = sa.Enum(
    "INBOX",
    "PROCESSED",
    "ARCHIVED",
    name="inbox_item_status",
    native_enum=False,
    create_constraint=True,
)


def upgrade() -> None:
    op.create_table(
        "inbox_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("type", inbox_item_type, nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("status", inbox_item_status, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_inbox_items_project_id"), "inbox_items", ["project_id"])
    op.create_index(op.f("ix_inbox_items_status"), "inbox_items", ["status"])
    op.create_index(op.f("ix_inbox_items_type"), "inbox_items", ["type"])


def downgrade() -> None:
    op.drop_index(op.f("ix_inbox_items_type"), table_name="inbox_items")
    op.drop_index(op.f("ix_inbox_items_status"), table_name="inbox_items")
    op.drop_index(op.f("ix_inbox_items_project_id"), table_name="inbox_items")
    op.drop_table("inbox_items")
