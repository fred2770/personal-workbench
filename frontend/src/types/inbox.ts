export type InboxItemType =
  | "TODO"
  | "ISSUE"
  | "BUG"
  | "REQUIREMENT"
  | "FOLLOW_UP"
  | "SITE_FEEDBACK"
  | "MEMO";

export type InboxItemStatus = "INBOX" | "PROCESSED" | "ARCHIVED";

export interface InboxItem {
  id: number;
  title: string;
  content: string;
  type: InboxItemType;
  project_id: number | null;
  status: InboxItemStatus;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface InboxItemListResponse {
  items: InboxItem[];
  page: number;
  page_size: number;
  total: number;
  pages: number;
}

export interface CreateInboxItemInput {
  content: string;
  type: InboxItemType;
  project_id: null;
}

export interface UpdateInboxItemInput {
  content?: string;
  type?: InboxItemType;
  project_id?: number | null;
  status?: InboxItemStatus;
}

export interface InboxListFilters {
  page: number;
  pageSize: number;
  q?: string;
  type?: InboxItemType;
  status?: InboxItemStatus;
}
