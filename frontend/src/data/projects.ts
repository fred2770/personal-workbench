import type { StatusTone } from "../types/dashboard";
import type { ProjectPriority, ProjectStatus } from "../types/project";

export const projectStatusOptions: Array<{ value: ProjectStatus; label: string }> = [
  { value: "PLANNING", label: "规划中" },
  { value: "ACTIVE", label: "进行中" },
  { value: "PAUSED", label: "已暂停" },
  { value: "COMPLETED", label: "已完成" },
  { value: "ARCHIVED", label: "已归档" },
];

export const projectPriorityOptions: Array<{ value: ProjectPriority; label: string }> = [
  { value: "HIGH", label: "高" },
  { value: "NORMAL", label: "普通" },
  { value: "LOW", label: "低" },
];

export const projectStatusLabels = Object.fromEntries(
  projectStatusOptions.map((option) => [option.value, option.label]),
) as Record<ProjectStatus, string>;

export const projectPriorityLabels = Object.fromEntries(
  projectPriorityOptions.map((option) => [option.value, option.label]),
) as Record<ProjectPriority, string>;

export const projectStatusTones: Record<ProjectStatus, StatusTone> = {
  PLANNING: "neutral",
  ACTIVE: "success",
  PAUSED: "warning",
  COMPLETED: "accent",
  ARCHIVED: "neutral",
};

export const projectSections = [
  "概览",
  "工作项",
  "问题",
  "Bug",
  "需求",
  "现场反馈",
  "Memo",
  "附件",
  "Activity",
] as const;
