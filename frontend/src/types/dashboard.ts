import type { IconName } from "./icon";

export type StatusTone = "neutral" | "accent" | "success" | "warning" | "danger";

export interface DashboardMetric {
  key: "today" | "issues" | "projects" | "inbox";
  label: string;
  value: number;
  helper: string;
  icon: IconName;
  tone: StatusTone;
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

export interface ProjectSummary {
  id: string;
  name: string;
  status: string;
  progress: number;
  todoCount: number;
  updatedAt: string;
  tone: StatusTone;
}

export interface CaptureOption {
  value: string;
  label: string;
}

export interface CapturePayload {
  content: string;
  type: string;
  projectId: string;
  attachmentNames: string[];
}
