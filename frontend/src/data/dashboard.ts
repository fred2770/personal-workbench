import type {
  DashboardMetric,
  ProjectSummary,
  RecentWorkItem,
  TodoItem,
} from "../types/dashboard";

export const dashboardMetrics: DashboardMetric[] = [
  { key: "today", label: "今日待办", value: 6, helper: "2 项临近截止", icon: "calendar", tone: "accent", source: "mock" },
  { key: "issues", label: "待处理问题", value: 4, helper: "1 项高优先级", icon: "alert", tone: "danger", source: "mock" },
  { key: "projects", label: "进行中项目", value: 4, helper: "2 个本周有更新", icon: "projects", tone: "success", source: "mock" },
  { key: "inbox", label: "Inbox", value: "—", helper: "读取真实待处理数据", icon: "inbox", tone: "warning", source: "live" },
];

export const dashboardTodos: TodoItem[] = [
  { id: "todo-tianjin-followup", title: "跟进天津现场 UWB 定位漂移", project: "天津现场问题", due: "10:30", priority: "高", completed: false },
  { id: "todo-uwb-report", title: "整理 UWB 压测数据与结论", project: "UWB 压测", due: "14:00", priority: "高", completed: false },
  { id: "todo-harmony-permission", title: "确认 P4 鸿蒙 App 权限流程", project: "P4 鸿蒙 App", due: "16:30", priority: "中", completed: false },
  { id: "todo-workbench-shell", title: "完成个人工作台 Dashboard Shell", project: "个人工作台开发", due: "今天", priority: "中", completed: false },
  { id: "todo-log-review", title: "复核现场日志异常时间点", project: "天津现场问题", due: "已完成", priority: "低", completed: true },
];

export const recentWorkItems: RecentWorkItem[] = [
  { id: "recent-tianjin", title: "天津现场问题", summary: "补充定位漂移复现条件，等待现场再次验证", type: "现场反馈", status: "待验证", updatedAt: "12 分钟前", tone: "danger" },
  { id: "recent-uwb", title: "UWB 压测", summary: "完成 500 并发样本采集，正在整理 P95 数据", type: "专项任务", status: "进行中", updatedAt: "38 分钟前", tone: "accent" },
  { id: "recent-p4", title: "P4 鸿蒙 App", summary: "权限申请流程已联调，剩余异常回退处理", type: "需求", status: "联调中", updatedAt: "昨天 18:20", tone: "warning" },
  { id: "recent-workbench", title: "个人工作台开发", summary: "推进正式 Dashboard Shell 与基础页面路由", type: "开发", status: "进行中", updatedAt: "刚刚", tone: "success" },
];

export const dashboardProjects: ProjectSummary[] = [
  { id: "project-tianjin", name: "天津现场问题", status: "风险跟进", progress: 68, todoCount: 5, updatedAt: "12 分钟前", tone: "danger" },
  { id: "project-uwb", name: "UWB 压测", status: "进行中", progress: 82, todoCount: 3, updatedAt: "38 分钟前", tone: "accent" },
  { id: "project-p4-harmony", name: "P4 鸿蒙 App", status: "联调中", progress: 54, todoCount: 7, updatedAt: "昨天", tone: "warning" },
  { id: "project-workbench", name: "个人工作台开发", status: "开发中", progress: 36, todoCount: 9, updatedAt: "刚刚", tone: "success" },
];
