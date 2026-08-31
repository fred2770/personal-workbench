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
