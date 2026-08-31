import { AppIcon } from "./components/AppIcon";
import { HealthStatus } from "./components/HealthStatus";

const primaryNavigation = [
  { label: "工作台", icon: "dashboard", active: true },
  { label: "收件箱", icon: "inbox", active: false },
  { label: "项目", icon: "projects", active: false },
  { label: "工作事项", icon: "work", active: false },
  { label: "备忘录", icon: "memo", active: false },
  { label: "搜索", icon: "search", active: false },
] as const;

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">P</span>
          <span className="brand-copy">
            <strong>Personal</strong>
            <small>Workbench</small>
          </span>
        </div>

        <nav className="sidebar-nav" aria-label="主导航">
          {primaryNavigation.map((item) => (
            <button
              aria-current={item.active ? "page" : undefined}
              className={`nav-item${item.active ? " nav-item--active" : ""}`}
              disabled={!item.active}
              key={item.label}
              title={!item.active ? `${item.label}将在后续阶段开放` : item.label}
              type="button"
            >
              <AppIcon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" disabled title="设置将在后续阶段开放" type="button">
            <AppIcon name="settings" />
            <span>设置</span>
          </button>
          <div className="profile-row">
            <span className="avatar" aria-hidden="true">PW</span>
            <span className="profile-copy">
              <strong>本地工作区</strong>
              <small>Phase 0</small>
            </span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Personal Workbench</span>
            <span aria-hidden="true">/</span>
            <strong>工作台</strong>
          </div>
          <button className="command-button" disabled title="全局搜索将在后续阶段开放" type="button">
            <AppIcon name="command" size={16} />
            <span>搜索或执行命令</span>
            <kbd>Ctrl K</kbd>
          </button>
        </header>

        <div className="page-content">
          <section className="page-intro">
            <div>
              <p className="eyebrow">PHASE 0 · 工程基线</p>
              <h1>工作台</h1>
              <p>统一承接记录、项目和工作事项。当前已完成可运行的产品壳子。</p>
            </div>
            <span className="baseline-badge">Baseline ready</span>
          </section>

          <div className="dashboard-grid">
            <section className="panel capture-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-label">快速记录</p>
                  <h2>先记下来，稍后整理</h2>
                </div>
                <span className="shortcut-hint">Ctrl N</span>
              </div>
              <label className="capture-field">
                <span className="sr-only">快速记录内容</span>
                <textarea
                  disabled
                  placeholder="输入想法、待办、问题，或粘贴一张截图…"
                  rows={3}
                />
              </label>
              <div className="capture-footer">
                <p>Quick Capture 将在 Phase 1 接入真实数据。</p>
                <button className="button button--primary" disabled type="button">
                  <AppIcon name="plus" size={16} />
                  新建记录
                </button>
              </div>
            </section>

            <HealthStatus />

            <section className="panel focus-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-label">今日焦点</p>
                  <h2>待处理事项</h2>
                </div>
                <span className="count-badge">0</span>
              </div>
              <div className="empty-state">
                <span className="empty-icon" aria-hidden="true"><AppIcon name="work" size={20} /></span>
                <div>
                  <strong>还没有工作事项</strong>
                  <p>业务数据将在下一阶段接入。</p>
                </div>
              </div>
            </section>

            <section className="panel projects-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-label">项目</p>
                  <h2>最近项目</h2>
                </div>
                <button aria-label="查看全部项目（暂不可用）" className="icon-button" disabled type="button">
                  <AppIcon name="arrow" size={17} />
                </button>
              </div>
              <div className="project-placeholder-list" aria-hidden="true">
                <div><span /><span /></div>
                <div><span /><span /></div>
                <div><span /><span /></div>
              </div>
              <p className="panel-note">项目列表将在 Phase 1 开放。</p>
            </section>

            <section className="panel foundation-panel">
              <div>
                <p className="section-label">工程状态</p>
                <h2>Phase 0 基线</h2>
              </div>
              <ul className="check-list">
                <li><span aria-hidden="true">✓</span> React + TypeScript + Vite</li>
                <li><span aria-hidden="true">✓</span> FastAPI + SQLite</li>
                <li><span aria-hidden="true">✓</span> 响应式 Dashboard 壳子</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
