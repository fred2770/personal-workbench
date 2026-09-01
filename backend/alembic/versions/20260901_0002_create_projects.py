"""create projects and link inbox items

Revision ID: 20260901_0002
Revises: 20260901_0001
Create Date: 2026-09-01 00:00:01
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260901_0002"
down_revision: str | None = "20260901_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

project_status = sa.Enum(
    "PLANNING",
    "ACTIVE",
    "PAUSED",
    "COMPLETED",
    "ARCHIVED",
    name="project_status",
    native_enum=False,
    create_constraint=True,
)
project_priority = sa.Enum(
    "HIGH",
    "NORMAL",
    "LOW",
    name="project_priority",
    native_enum=False,
    create_constraint=True,
)


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", project_status, nullable=False),
        sa.Column("priority", project_priority, nullable=False),
        sa.Column("progress", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "progress >= 0 AND progress <= 100",
            name="ck_projects_progress_range",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_projects_name"), "projects", ["name"])
    op.create_index(op.f("ix_projects_priority"), "projects", ["priority"])
    op.create_index(op.f("ix_projects_status"), "projects", ["status"])

    # Phase 2 exposed project_id before Project existed, so any legacy non-null
    # value is an unresolvable placeholder. Preserve the Inbox row and clear it
    # before introducing the real foreign key.
    op.execute(sa.text("UPDATE inbox_items SET project_id = NULL WHERE project_id IS NOT NULL"))

    with op.batch_alter_table("inbox_items") as batch_op:
        batch_op.create_foreign_key(
            "fk_inbox_items_project_id_projects",
            "projects",
            ["project_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    with op.batch_alter_table("inbox_items") as batch_op:
        batch_op.drop_constraint(
            "fk_inbox_items_project_id_projects",
            type_="foreignkey",
        )

    op.drop_index(op.f("ix_projects_status"), table_name="projects")
    op.drop_index(op.f("ix_projects_priority"), table_name="projects")
    op.drop_index(op.f("ix_projects_name"), table_name="projects")
    op.drop_table("projects")
