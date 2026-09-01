# Personal Workbench

Personal Workbench 是用于统一承接快速记录、项目、工作事项、备忘与附件的个人工作台。

当前仓库已完成 Phase 0 工程基线、Phase 1 工作台 UI Shell，以及 Phase 2 Quick Capture → SQLite → Inbox 真实业务闭环。

## 技术栈

- Frontend: React 19 + TypeScript + Vite
- Backend: FastAPI + SQLAlchemy + Alembic
- Database: SQLite（默认），通过 `DATABASE_URL` 可切换 PostgreSQL
- Test: pytest

## 本地地址

- Frontend: <http://127.0.0.1:5173>
- Backend: <http://127.0.0.1:8800>
- Health API: <http://127.0.0.1:8800/api/v1/health>
- API docs: <http://127.0.0.1:8800/docs>

## 环境要求

- Node.js 22.12+
- npm 10+
- Python 3.10+

以下命令以 Windows PowerShell 为例。

## 启动后端

```powershell
cd E:\project\personal-workbench\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python -m alembic upgrade head
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8800
```

默认数据库文件为 `backend/data/personal_workbench.db`。首次启动和拉取到新迁移后必须先执行 `python -m alembic upgrade head`，应用启动不会删除或重建已有表。若需覆盖配置，可先在项目根目录执行：

```powershell
Copy-Item .env.example .env
```

PostgreSQL 可使用 `postgresql://user:password@host:5432/database` 或 `postgresql+psycopg://...` 形式的 `DATABASE_URL`；项目会将前一种形式规范化为 psycopg 3 驱动。

## 启动前端

另开一个 PowerShell 窗口：

```powershell
cd E:\project\personal-workbench\frontend
npm install
npm run dev
```

前端默认请求 `http://127.0.0.1:8800`。如需修改，在根目录 `.env` 中设置 `VITE_API_BASE_URL`。

## 验证

前端：

```powershell
cd E:\project\personal-workbench\frontend
npm run typecheck
npm run build
```

后端：

```powershell
cd E:\project\personal-workbench\backend
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m alembic current
.\.venv\Scripts\python.exe -c "from app.main import app; paths = app.openapi()['paths']; assert '/api/v1/health' in paths and '/api/v1/inbox' in paths; print('import and OpenAPI check passed')"
```

## 目录

```text
frontend/        React + TypeScript + Vite
backend/app/     FastAPI 应用、API、模型、服务、仓储、配置与 Schema
backend/alembic/ Alembic 数据库迁移
backend/tests/   后端 pytest
tests/           后续跨前后端集成与端到端测试
docs/            产品、架构、UI、研发流程与进度文档
scripts/         项目辅助脚本
```

开发前请先阅读 `AGENTS.md` 与 `docs/` 下的项目基线文档。
