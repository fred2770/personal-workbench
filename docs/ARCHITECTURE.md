# ARCHITECTURE - 架构基线

## 总体架构
首版使用模块化单体：
Browser → React + TypeScript + Vite → HTTP/JSON → FastAPI → Service/Repository → SQLite。

附件：Browser → FastAPI Upload API → Local Storage。

后续：SQLite → PostgreSQL；Local Storage → 可配置 Storage。

## Frontend
建议使用 React、TypeScript、Vite、React Router、TanStack Query。全局状态确有需要时再使用 Zustand。不要同时引入多个同类状态库/UI库。

## Backend
FastAPI + Pydantic + SQLAlchemy + Alembic + pytest。

建议结构：backend/app/{api,core,models,schemas,services,repositories} 与 backend/tests。

## Database
首版 SQLite，通过 DATABASE_URL 留 PostgreSQL 兼容路径。

## 附件
数据库保存附件元数据和路径，不直接存大文件二进制；避免文件名冲突、路径穿越和危险文件类型。

## API
统一 `/api/v1/...`，列表接口支持分页，错误响应尽量统一。

## 部署
功能稳定后再加入 Docker 一键部署，不在 Phase 0 过早复杂化。
