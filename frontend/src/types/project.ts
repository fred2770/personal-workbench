export type ProjectStatus = "PLANNING" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
export type ProjectPriority = "HIGH" | "NORMAL" | "LOW";

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface ProjectListResponse {
  items: Project[];
  page: number;
  page_size: number;
  total: number;
  pages: number;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface ProjectListFilters {
  page: number;
  pageSize: number;
  q?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
}
