import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { createInboxItem, getInboxItems } from "../api/inbox";
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
import type { CreateInboxItemInput } from "../types/inbox";

const initialCompletedIds = new Set(
  dashboardTodos.filter((item) => item.completed).map((item) => item.id),
);

export function DashboardPage() {
  const location = useLocation();
  const [completedIds, setCompletedIds] = useState(initialCompletedIds);
  const [inboxCount, setInboxCount] = useState<number | null>(null);
  const [inboxCountError, setInboxCountError] = useState(false);

  const refreshInboxCount = async (signal?: AbortSignal) => {
    try {
      const result = await getInboxItems(
        { page: 1, pageSize: 1, status: "INBOX" },
        signal,
      );
      setInboxCount(result.total);
      setInboxCountError(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setInboxCountError(true);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void refreshInboxCount(controller.signal);
    return () => controller.abort();
  }, []);

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
    () => dashboardMetrics.map((metric) => {
      if (metric.key !== "inbox") return metric;
      return {
        ...metric,
        value: inboxCountError ? "!" : (inboxCount ?? "—"),
        helper: inboxCountError ? "读取失败，请检查 API" : "真实待处理记录",
      };
    }),
    [inboxCount, inboxCountError],
  );

  const handleCapture = async (payload: CreateInboxItemInput) => {
    await createInboxItem(payload);
    await refreshInboxCount();
  };

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
        <QuickCapture onCapture={handleCapture} />
        <TodoPanel completedIds={completedIds} items={dashboardTodos} onToggle={toggleTodo} />
        <RecentWorkPanel items={recentWorkItems} />
        <ProjectsPanel projects={dashboardProjects} />
      </div>
    </div>
  );
}
