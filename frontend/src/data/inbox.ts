import type { InboxItemStatus, InboxItemType } from "../types/inbox";

export interface InboxOption<T extends string> {
  value: T;
  label: string;
}

export const inboxTypeOptions: InboxOption<InboxItemType>[] = [
  { value: "TODO", label: "待办" },
  { value: "ISSUE", label: "问题" },
  { value: "BUG", label: "Bug" },
  { value: "REQUIREMENT", label: "需求" },
  { value: "FOLLOW_UP", label: "跟进" },
  { value: "SITE_FEEDBACK", label: "现场反馈" },
  { value: "MEMO", label: "备忘" },
];

export const inboxStatusOptions: InboxOption<InboxItemStatus>[] = [
  { value: "INBOX", label: "待处理" },
  { value: "PROCESSED", label: "已处理" },
  { value: "ARCHIVED", label: "已归档" },
];

export const inboxTypeLabels = Object.fromEntries(
  inboxTypeOptions.map((option) => [option.value, option.label]),
) as Record<InboxItemType, string>;

export const inboxStatusLabels = Object.fromEntries(
  inboxStatusOptions.map((option) => [option.value, option.label]),
) as Record<InboxItemStatus, string>;
