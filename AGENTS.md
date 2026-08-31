# Personal Workbench - Codex 项目规则

## 1. 项目目标
本项目是个人工作台（Personal Workbench），用于统一管理快速记录、待办、问题、Bug、需求、项目、现场反馈、附件/日志、工作备忘和搜索。

核心闭环：Quick Capture → Inbox → Project → WorkItem → Attachment / Activity → 完成 / 验证 → 归档 / 搜索。

## 2. 已确定技术栈
- Frontend: React + TypeScript + Vite
- Backend: FastAPI
- Database: 首版 SQLite
- Database evolution: 后续通过 DATABASE_URL 切换 PostgreSQL
- Local frontend: http://127.0.0.1:5173
- Local backend: http://127.0.0.1:8800
- API docs: http://127.0.0.1:8800/docs

## 3. 目录约束
项目根目录至少保持：AGENTS.md、README.md、docs/、frontend/、backend/、tests/、scripts/。
未经明确理由，不随意改变整体目录结构。

## 4. UI 设计方向
- Linear / Vercel 专业感
- Bento Grid
- 轻量科技感
- 高信息密度但不拥挤
- 优先效率、易操作、清晰，再考虑装饰效果
- 桌面、平板、手机响应式
- 支持快速记录、图片粘贴、附件上传
- 避免过度毛玻璃、渐变和发光

## 5. 核心业务模型
Project、WorkItem、Memo、InboxItem、Attachment、Activity、Tag、Checklist。

WorkItem 类型至少支持：TODO、ISSUE、BUG、REQUIREMENT、FOLLOW_UP、SITE_FEEDBACK。

## 6. 首版核心范围
1. Dashboard
2. Quick Capture
3. Inbox
4. 项目管理
5. 统一 WorkItem
6. Memo
7. 附件与图片
8. Activity
9. 标签
10. Ctrl+K 全局搜索
11. 响应式移动端

首版不要提前加入：多租户、复杂 RBAC、微服务、消息队列、Kubernetes、复杂审批流。

## 7. Codex 固定工作方式
每次任务严格执行：
1. 阅读 AGENTS.md 与相关 docs。
2. 检查 git status、现有代码和项目事实。
3. 中型以上任务先给简短实施计划。
4. 优先复用现有代码，不无理由换框架或大范围重构。
5. 完成后实际执行适用的 typecheck、build、pytest、API/启动检查和 git diff。
6. 不得仅凭代码阅读宣称验证通过。
7. 最终汇报：完成内容、关键文件、验证命令与结果、遗留项、建议 commit message。

## 8. Git 规则
- 修改前先执行 git status。
- 不覆盖尚未提交的用户修改。
- 中大型功能建议 feature 分支。
- 每个可独立验收功能形成稳定提交点。
- 禁止擅自执行 git reset --hard 或强制覆盖 Git 历史。

提交消息建议：feat / fix / refactor / test / docs / chore。

## 9. Skills
优先读取：
- E:\AI-Skills\personal-workbench-ui\SKILL.md
- E:\AI-Skills\frontend-quality-guard\SKILL.md

Skill 与项目事实冲突时，以本项目 AGENTS.md 和 docs 为准。

## 10. 文档维护
- 架构变化 → docs/ARCHITECTURE.md
- 产品范围变化 → docs/PRODUCT.md
- UI 标准变化 → docs/UI-SPEC.md
- 完成功能/进度 → docs/PROGRESS.md
- 关键取舍 → docs/DECISIONS.md

文档必须反映实际代码状态，不写虚假完成状态。
