import { apiRequest } from "./client";
import type {
  CreateInboxItemInput,
  InboxItem,
  InboxItemListResponse,
  InboxListFilters,
  UpdateInboxItemInput,
} from "../types/inbox";

export function createInboxItem(input: CreateInboxItemInput): Promise<InboxItem> {
  return apiRequest<InboxItem>("/api/v1/inbox", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getInboxItems(
  filters: InboxListFilters,
  signal?: AbortSignal,
): Promise<InboxItemListResponse> {
  const params = new URLSearchParams({
    page: String(filters.page),
    page_size: String(filters.pageSize),
  });
  if (filters.q) params.set("q", filters.q);
  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);

  return apiRequest<InboxItemListResponse>(`/api/v1/inbox?${params}`, { signal });
}

export function getInboxItem(itemId: number, signal?: AbortSignal): Promise<InboxItem> {
  return apiRequest<InboxItem>(`/api/v1/inbox/${itemId}`, { signal });
}

export function updateInboxItem(
  itemId: number,
  input: UpdateInboxItemInput,
): Promise<InboxItem> {
  return apiRequest<InboxItem>(`/api/v1/inbox/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function archiveInboxItem(itemId: number): Promise<InboxItem> {
  return apiRequest<InboxItem>(`/api/v1/inbox/${itemId}/archive`, { method: "POST" });
}

export function deleteInboxItem(itemId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/inbox/${itemId}`, { method: "DELETE" });
}
