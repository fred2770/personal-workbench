import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppIcon } from "../components/AppIcon";
import { CommandPalette } from "../components/CommandPalette";
import { HealthStatus } from "../components/HealthStatus";
import { appNavigation, getNavigationItem } from "../config/navigation";

export function AppShell() {
  const [commandOpen, setCommandOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = getNavigationItem(location.pathname);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((current) => !current);
      }
      if (modifier && event.key.toLocaleLowerCase() === "n") {
        event.preventDefault();
        setCommandOpen(false);
        void navigate("/dashboard#quick-capture");
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [navigate]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link aria-label="返回工作台" className="brand" to="/dashboard">
          <span className="brand-mark" aria-hidden="true">P</span>
          <span className="brand-copy">
            <strong>Personal</strong>
            <small>Workbench</small>
          </span>
        </Link>

        <nav aria-label="主导航" className="sidebar-nav">
          {appNavigation.map((item) => (
            <NavLink
              aria-label={item.label}
              className={({ isActive }) =>
                `nav-item${isActive ? " nav-item--active" : ""}${item.path === "/settings" ? " nav-item--settings" : ""}`
              }
              key={item.path}
              title={item.label}
              to={item.path}
            >
              <AppIcon name={item.icon} />
              <span className="nav-label">{item.label}</span>
              <span className="nav-short-label">{item.shortLabel}</span>
            </NavLink>
          ))}
        </nav>

        <div className="profile-row">
          <span className="avatar" aria-hidden="true">PW</span>
          <span className="profile-copy">
            <strong>本地工作区</strong>
            <small>Personal workspace</small>
          </span>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="page-title-wrap">
            <span className="page-context">Personal Workbench</span>
            <h1>{currentPage.label}</h1>
          </div>
          <div className="topbar-actions">
            <button
              aria-label="搜索或执行命令，快捷键 Ctrl+K"
              className="search-trigger"
              onClick={() => setCommandOpen(true)}
              type="button"
            >
              <AppIcon name="search" size={16} />
              <span>搜索或跳转</span>
              <kbd>Ctrl K</kbd>
            </button>
            <Link
              aria-label="快速记录，快捷键 Ctrl+N"
              className="button button--primary quick-record-button"
              to="/dashboard#quick-capture"
            >
              <AppIcon name="plus" size={16} />
              <span>快速记录</span>
            </Link>
            <HealthStatus />
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <CommandPalette onClose={() => setCommandOpen(false)} open={commandOpen} />
    </div>
  );
}
