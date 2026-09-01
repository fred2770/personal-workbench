# PROGRESS - 当前进度

## 当前阶段

Phase 3：Project 项目管理真实业务功能已完成（2026-09-01）。

## Phase 3 已完成

- 建立 `projects` SQLAlchemy 模型与 Alembic 迁移，字段覆盖名称、描述、状态、优先级、进度、创建/更新时间与归档时间。
- 项目状态支持 `PLANNING`、`ACTIVE`、`PAUSED`、`COMPLETED`、`ARCHIVED`；优先级支持 `HIGH`、`NORMAL`、`LOW`；进度由数据库与 API 双重约束在 0–100。
- 建立项目创建、分页列表、搜索、状态/优先级筛选、详情、修改、归档和永久删除 API。
- `/projects` 已成为正式项目列表页，包含创建表单、搜索筛选、项目卡片、分页，以及加载、空、错误和成功反馈状态。
- `/projects/:id` 已成为正式项目详情页，支持编辑、归档和带二次确认的永久删除，并预留项目工作区模块入口。
- `Project 1:N InboxItem` 真实关联已完成；Quick Capture 可选择未归档项目，Inbox 列表与详情展示关联项目，详情中可修改项目归属。
- 当前关联项目归档后，Inbox 详情仍会明确显示该项目及“已归档”状态；新记录不再提供已归档项目选项。
- 永久删除 Project 时保留 InboxItem，并将其 `project_id` 自动置为 `null`；SQLite 外键约束和服务层均落实该规则。
- Dashboard “进行中项目”统计与“我的项目”卡片已改为真实 Project API 数据，Phase 1 的 mock 项目数据已移除。
- 保留 Phase 1 App Shell、Phase 2 Quick Capture / Inbox、Ctrl+K / Ctrl+N、SQLite 基线和 health API。
- 后端测试继续使用独立临时 SQLite；新增迁移保留既有 Inbox 数据的验证。

## 当前仍为 mock / 未实现

- Dashboard 的今日待办、待处理问题、今日待办列表和最近工作仍来自 `frontend/src/data/dashboard.ts`，界面标为“示例”。
- Dashboard Inbox 数量、进行中项目数量、我的项目、Quick Capture 和 Inbox 页面均已使用真实 API 与 SQLite。
- 项目卡片与详情中的工作项数量当前为 `0`；工作项、问题、Bug、需求、现场反馈、Memo、附件和 Activity 仅预留入口，尚无真实聚合数据。
- 附件上传、图片粘贴、Inbox 转 WorkItem / Memo、Activity、标签、Checklist 尚未实现。
- 工作项、Memo、设置仍为统一 Placeholder。

## Phase 3 实际验证

- 后端 `pytest` 覆盖项目 CRUD、筛选、搜索、进度边界、非法枚举、归档、404、Inbox 关联、项目删除后 Inbox 保留，以及 Alembic 从 Phase 2 迁移时的数据保留。
- Alembic 已在本地 SQLite 执行 `upgrade head`，当前版本为 `20260901_0002 (head)`。
- 真实运行 API 已走通 Project `POST → GET list/detail → PATCH → archive → DELETE → 404`，并验证关联 Inbox 在项目删除后保留且项目字段置空。
- 浏览器已走通项目创建、表单校验、刷新持久化、详情、编辑、搜索、筛选、Dashboard 联动、Quick Capture 项目选择、Inbox 项目显示/修改、归档筛选和删除确认取消。
- 浏览器已检查 1920、1366、820 平板和 390 手机视口，以及手机新建表单与项目详情；未发现横向异常滚动、导航挤压、卡片溢出或按钮裁剪。
- 浏览器控制台未发现 error / warning。

## Phase 4 下一步

1. 建立统一 WorkItem 模型、迁移与 API，并支持 Inbox 转 TODO / ISSUE / BUG / REQUIREMENT 等工作项。
2. 将项目详情中的工作项、问题、Bug、需求和现场反馈切换为真实聚合数据。
3. 建立 Memo 转换与处理状态流转，记录 Activity。
4. 在业务模型稳定后补充前端自动化测试与跨页面端到端测试。

## Phase 0 / Phase 1 基线（保持）

- React + TypeScript + Vite 前端，默认端口 5173。
- FastAPI + SQLAlchemy 后端，默认端口 8800。
- 正式 App Shell、Dashboard、Sidebar、Topbar、响应式移动导航与路由基础。
- `GET /api/v1/health` 与 API 在线 / 离线状态。
