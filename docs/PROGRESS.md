# PROGRESS - 当前进度

## 当前阶段

Phase 0：工程基线已完成（2026-09-01）。

## 本轮已完成

- 建立 `frontend/`：React + TypeScript + Vite，默认端口 5173。
- 建立 `backend/`：FastAPI 模块化目录，默认端口 8800。
- 配置 SQLAlchemy 与默认 SQLite 数据库。
- 支持通过 `DATABASE_URL` 切换 PostgreSQL，并使用 psycopg 3 驱动。
- 建立 `GET /api/v1/health`，包含 API、版本与数据库连接状态。
- 前端通过统一 API client 调用 health，明确展示 loading、API 在线和 API 离线状态。
- 建立干净、专业、响应式的 Dashboard 壳子；业务入口保持禁用并标注后续阶段，未提前实现复杂业务。
- 加入根目录 `.env.example`，完善 `.gitignore`。
- 建立后端 pytest，并补齐前端 typecheck/build 脚本。
- 更新 README 的环境准备、启动与验证命令。

## 实际验证

- `npm run typecheck`：通过。
- `npm run build`：通过，Vite 生产构建成功。
- `.venv\Scripts\python.exe -m pytest`：通过，health 与 PostgreSQL URL 兼容测试共 `2 passed`。
- FastAPI 应用导入与 OpenAPI 路径检查：通过。
- Uvicorn 在 `127.0.0.1:8800` 实际启动：通过。
- `GET /api/v1/health`：HTTP 200，返回 `status=ok`、`database=sqlite`。
- Swagger UI `/docs`：HTTP 200。
- Vite 在 `127.0.0.1:5173` 实际启动：通过。
- 浏览器桌面与手机视口检查：API 在线可见，手机端无横向溢出，控制台无 error/warning。
- 浏览器离线态回归：停止后端后显示“API 离线”，恢复后可重新检查为“API 在线”。

## Phase 0 完成标准

- [x] 前后端可启动
- [x] health 正常
- [x] 前端可调用后端
- [x] Dashboard 壳子可响应式显示
- [x] 前端 typecheck/build 通过
- [x] 后端 pytest 通过
- [x] Git 工作区变更明确

## 下一步（Phase 1 候选，尚未开始）

1. 根据产品文档细化首个业务切片。
2. 建立正式数据模型与 Alembic migration。
3. 优先跑通 Quick Capture → Inbox 的最小闭环。
4. 为业务 API 与前端交互补充测试。
