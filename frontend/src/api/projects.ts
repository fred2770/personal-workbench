import { apiRequest } from "./client";
import type {
  CreateProjectInput,
  Project,
  ProjectListFilters,
  ProjectListResponse,
  UpdateProjectInput,
} from "../types/project";

export function createProject(input: CreateProjectInput): Promise<Project> {
  return apiRequest<Project>("/api/v1/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getProjects(
  filters: ProjectListFilters,
  signal?: AbortSignal,
): Promise<ProjectListResponse> {
  const params = new URLSearchParams({
    page: String(filters.page),
    page_size: String(filters.pageSize),
  });
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  return apiRequest<ProjectListResponse>(`/api/v1/projects?${params}`, { signal });
}

export function getProject(projectId: number, signal?: AbortSignal): Promise<Project> {
  return apiRequest<Project>(`/api/v1/projects/${projectId}`, { signal });
}

export function updateProject(projectId: number, input: UpdateProjectInput): Promise<Project> {
  return apiRequest<Project>(`/api/v1/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function archiveProject(projectId: number): Promise<Project> {
  return apiRequest<Project>(`/api/v1/projects/${projectId}/archive`, { method: "POST" });
}

export function deleteProject(projectId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/projects/${projectId}`, { method: "DELETE" });
}
