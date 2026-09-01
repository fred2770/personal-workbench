# PROGRESS - 当前进度

## 当前阶段

Phase 2：Quick Capture + Inbox 真实业务闭环已完成（2026-09-01）。

## Phase 2 已完成

- 建立 `inbox_items` SQLAlchemy 模型与 Alembic 首个正式迁移，默认写入 SQLite，并继续通过 `DATABASE_URL` 兼容 PostgreSQL。
- InboxItem 已包含 `id`、`title`、`content`、`type`、`project_id`、`status`、`created_at`、`updated_at`、`archived_at`。
- 类型支持 `TODO`、`ISSUE`、`BUG`、`REQUIREMENT`、`FOLLOW_UP`、`SITE_FEEDBACK`、`MEMO`；状态支持 `INBOX`、`PROCESSED`、`ARCHIVED`。
- 建立 Quick Capture → FastAPI → SQLite → Inbox 闭环；正文首行自动生成限长标题，正文完整保留。
- Quick Capture 成功后清空内容、显示成功反馈并刷新 Dashboard 真实 Inbox 待处理数量；失败保留输入并显示错误；提交中禁止重复提交。
- 项目字段明确保持未归类并写入 `null`，未写入 Phase 1 的 mock 项目 ID；附件入口明确标记“暂未开放”。
- `/inbox` 已成为正式页面，支持搜索、类型/状态筛选、分页、加载、空、错误状态，以及详情抽屉。
- 详情抽屉支持编辑正文、类型、状态，保存修改、归档和带二次确认的永久删除。
- 建立创建、分页列表、详情、修改、归档、删除 API，并覆盖空内容、非法枚举、非法分页与不存在记录等异常。
- 后端 pytest 使用独立临时 SQLite，不污染正式 `backend/data/personal_workbench.db`。
- 保留 Phase 1 App Shell、Dashboard、响应式导航、Ctrl+K / Ctrl+N 与 health API。

## 当前仍为 mock / 未实现

- Dashboard 的今日待办、待处理问题、进行中项目、今日待办列表、最近工作和项目卡片仍来自 `frontend/src/data/dashboard.ts`，界面标为“示例”。
- Dashboard Inbox 数量、Quick Capture 和 Inbox 页面已使用真实 API 与 SQLite，不再是 mock 或会话态。
- Project 实体与项目选择尚未实现，`project_id` 当前固定为 `null`。
- 附件上传、图片粘贴、Inbox 转 WorkItem / Memo、Activity、标签、Checklist 尚未实现。
- 项目、工作项、Memo、设置仍为统一 Placeholder。

## Phase 2 实际验证

- 后端 `pytest` 覆盖健康检查及 Inbox 创建、标题生成、持久化、分页、搜索、筛选、详情、修改、归档、删除和异常输入。
- Alembic 已在本地 SQLite 执行 `upgrade head`，当前版本为 `20260901_0001 (head)`。
- 真实运行 API 已走通 `POST → GET list/detail → PATCH → archive → DELETE → 404`。
- 浏览器已走通 Quick Capture 创建、Dashboard 数量更新、Inbox 列表、刷新持久化、编辑后刷新、归档、归档筛选、删除确认取消及最终空状态。
- 浏览器已检查 1920、1366、820 平板和 390 手机视口；桌面 Sidebar、平板图标栏和手机底部导航均按断点生效，无横向异常滚动或控件裁剪。
- 浏览器控制台未发现 error / warning。

## Phase 3 下一步

1. 建立 Project 实体、迁移、API 和项目选择，把 Inbox 记录归类到真实项目。
2. 建立统一 WorkItem，并支持 Inbox 转 TODO / ISSUE / BUG / REQUIREMENT 等工作项。
3. 建立 Memo 转换与处理状态流转，记录 Activity。
4. 在业务模型稳定后补充前端自动化测试与跨页面端到端测试。

## Phase 0 / Phase 1 基线（保持）

- React + TypeScript + Vite 前端，默认端口 5173。
- FastAPI + SQLAlchemy 后端，默认端口 8800。
- 正式 App Shell、Dashboard、Sidebar、Topbar、响应式移动导航与路由基础。
- `GET /api/v1/health` 与 API 在线 / 离线状态。
