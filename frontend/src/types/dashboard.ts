import type { IconName } from "./icon";

export type StatusTone = "neutral" | "accent" | "success" | "warning" | "danger";

export interface DashboardMetric {
  key: "today" | "issues" | "projects" | "inbox";
  label: string;
  value: number | string;
  helper: string;
  icon: IconName;
  tone: StatusTone;
  source: "mock" | "live";
}

export interface TodoItem {
  id: string;
  title: string;
  project: string;
  due: string;
  priority: "高" | "中" | "低";
  completed: boolean;
}

export interface RecentWorkItem {
  id: string;
  title: string;
  summary: string;
  type: string;
  status: string;
  updatedAt: string;
  tone: StatusTone;
}
