import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  dashboardMetrics,
  dashboardProjects,
  dashboardTodos,
  recentWorkItems,
} from "../data/dashboard";
import {
  OverviewCards,
  ProjectsPanel,
  RecentWorkPanel,
  TodoPanel,
} from "../dashboard/DashboardPanels";
import { QuickCapture } from "../dashboard/QuickCapture";

const initialCompletedIds = new Set(
  dashboardTodos.filter((item) => item.completed).map((item) => item.id),
);

export function DashboardPage() {
  const location = useLocation();
  const [completedIds, setCompletedIds] = useState(initialCompletedIds);
  const initialInboxCount = dashboardMetrics.find((metric) => metric.key === "inbox")?.value ?? 0;
  const [inboxCount, setInboxCount] = useState(initialInboxCount);

  useEffect(() => {
    if (location.hash !== "#quick-capture") {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      document.getElementById("quick-capture")?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("quick-capture-input")?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.key]);

  const metrics = useMemo(
    () => dashboardMetrics.map((metric) =>
      metric.key === "inbox" ? { ...metric, value: inboxCount } : metric,
    ),
    [inboxCount],
  );

  const todayLabel = useMemo(
    () => new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date()),
    [],
  );

  const toggleTodo = (id: string) => {
    setCompletedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="page-content dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <p className="section-label">TODAY · {todayLabel}</p>
          <h2>今日工作区</h2>
          <p>聚焦现场问题、压测结论和正在推进的产品工作。</p>
        </div>
        <span className="workspace-badge"><span aria-hidden="true" /> 本地工作区</span>
      </section>

      <OverviewCards metrics={metrics} />

      <div className="dashboard-grid">
        <QuickCapture onCapture={() => setInboxCount((current) => current + 1)} />
        <TodoPanel completedIds={completedIds} items={dashboardTodos} onToggle={toggleTodo} />
        <RecentWorkPanel items={recentWorkItems} />
        <ProjectsPanel projects={dashboardProjects} />
      </div>
    </div>
  );
}
