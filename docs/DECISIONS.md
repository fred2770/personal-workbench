# DECISIONS - 关键决策

## ADR-001 模块化单体
个人工作台首版无需微服务，优先降低开发和部署复杂度。

## ADR-002 首版 SQLite
本机启动简单，通过 DATABASE_URL 给 PostgreSQL 留升级路径。

## ADR-003 React + TypeScript + Vite
工程成熟、可维护性好、开发启动直接。

## ADR-004 FastAPI
API 开发直接，Python 生态成熟，自带 OpenAPI 文档便于测试。

## ADR-005 首版不做复杂权限/微服务
优先跑通个人实际工作闭环。

## ADR-006 数据库结构通过 Alembic 演进
从 Phase 2 起不再由应用启动时执行 `create_all`。SQLite 与 PostgreSQL 共用 SQLAlchemy 模型和 Alembic 版本迁移，启动前显式执行 `alembic upgrade head`，避免后续模型变化依赖删表重建。

## ADR-007 Project 删除与归档边界
Project 与 InboxItem 建立一对多关系，`inbox_items.project_id` 使用可空外键并采用 `ON DELETE SET NULL`。归档只改变项目状态并保留关联，默认项目列表和新建记录的项目选择隐藏已归档项目；永久删除项目时保留 Inbox 历史记录并自动改为未归类，避免项目生命周期操作造成捕获内容丢失。
