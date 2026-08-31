import type { IconName } from "../types/icon";

export interface NavigationItem {
  path: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: IconName;
}

export const appNavigation: NavigationItem[] = [
  {
    path: "/dashboard",
    label: "工作台",
    shortLabel: "工作台",
    description: "查看今日焦点与项目进展",
    icon: "dashboard",
  },
  {
    path: "/inbox",
    label: "Inbox",
    shortLabel: "Inbox",
    description: "处理尚未归类的快速记录",
    icon: "inbox",
  },
  {
    path: "/projects",
    label: "项目",
    shortLabel: "项目",
    description: "聚合项目上下文和工作进度",
    icon: "projects",
  },
  {
    path: "/work-items",
    label: "工作项",
    shortLabel: "工作项",
    description: "管理待办、问题、Bug 与需求",
    icon: "work",
  },
  {
    path: "/memos",
    label: "Memo",
    shortLabel: "Memo",
    description: "记录命令、日志和工作备忘",
    icon: "memo",
  },
  {
    path: "/settings",
    label: "设置",
    shortLabel: "设置",
    description: "管理工作台偏好与本地配置",
    icon: "settings",
  },
];

export function getNavigationItem(pathname: string): NavigationItem {
  return appNavigation.find((item) => pathname.startsWith(item.path)) ?? appNavigation[0];
}
