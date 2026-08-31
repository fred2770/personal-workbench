# PROGRESS - 当前进度

## 当前阶段

Phase 1：整体工作台 UI Shell + Dashboard 已完成（2026-09-01）。

## Phase 1 已完成

- 建立正式 App Shell：桌面 Sidebar、Topbar、Main Content 与响应式布局。
- Sidebar 提供工作台、Inbox、项目、工作项、Memo、设置入口，支持真实路由切换和激活状态。
- 手机端使用固定底部导航，不压缩桌面 Sidebar。
- Topbar 展示当前页面标题、Ctrl+K 搜索入口、快速记录按钮和真实 API 在线/离线状态。
- 建立 React Router 路由：`/`、`/dashboard`、`/inbox`、`/projects`、`/work-items`、`/memos`、`/settings`。
- Dashboard 完成今日工作区、四项数据概览、Quick Capture、今日待办、最近工作与我的项目。
- Quick Capture 支持内容、类型、项目、附件选择与当前会话提交，并可更新 Dashboard Inbox 数量。
- Ctrl+K 可打开统一导航搜索；Ctrl+N 可定位并聚焦 Quick Capture。
- 其他业务页面使用统一 Placeholder：“该模块将在下一阶段开发”。
- 保留统一 API client 与 health 请求状态处理，未改动 FastAPI / health 基线。

## 当前仍为 mock / 会话态

- 今日待办、待处理问题、进行中项目、Inbox 数量为集中管理的 mock 数据。
- 今日待办列表、最近工作和项目卡片均来自 `frontend/src/data/dashboard.ts`。
- Quick Capture 只在当前浏览器会话更新 UI，不写入 SQLite，也不会在刷新后保留。
- 附件仅完成选择、文件名展示、空文件和 10 MB 大小校验，尚未上传。
- Inbox、项目、工作项、Memo、设置页面尚未接入业务数据。

## Phase 1 实际验证

- `npm run typecheck`：通过。
- `npm run build`：通过。
- 浏览器 1920、1366、820 平板、390 手机视口检查：无横向溢出，Topbar 未裁剪。
- 桌面 Sidebar、平板折叠图标栏、手机底部导航均按断点生效。
- `/` 重定向以及 `/dashboard`、`/inbox`、`/projects`、`/work-items`、`/memos`、`/settings` 的 Sidebar 导航、页面标题和 Placeholder 已逐页验证。
- Ctrl+K 导航搜索已验证，共展示 6 个路由入口。
- Quick Capture 类型、项目选择和提交已验证；Inbox 数量可从 12 更新到 13。
- 浏览器控制台未发现 error/warning。

## Phase 0 基线（保持）

- React + TypeScript + Vite 前端，默认端口 5173。
- FastAPI + SQLAlchemy 后端，默认端口 8800。
- 默认 SQLite，并通过 `DATABASE_URL` 保留 PostgreSQL 兼容。
- `GET /api/v1/health`、pytest、环境示例和开发启动文档。

## Phase 2 下一步

1. 建立正式业务模型与 Alembic migration。
2. 优先实现 Quick Capture → Inbox 的数据持久化闭环。
3. 实现 Inbox 归类、转 WorkItem / Memo 与归档操作。
4. 补充业务 API、前端请求状态与端到端测试。
