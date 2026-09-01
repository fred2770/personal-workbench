import type { HealthResponse } from "../types/health";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8800";
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }
  return typeof value.detail === "string" ? value.detail : null;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError("无法连接后端服务，请确认 API 已在 8800 端口启动。");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    if (response.ok) {
      throw new ApiError("API 返回了无法识别的数据。", response.status);
    }
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(data) ?? `API 返回异常状态（HTTP ${response.status}）。`,
      response.status,
    );
  }

  return data as T;
}

function isHealthResponse(value: unknown): value is HealthResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    candidate.status === "ok" &&
    typeof candidate.service === "string" &&
    typeof candidate.version === "string" &&
    typeof candidate.database === "string"
  );
}

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const data: unknown = await apiRequest<unknown>("/api/v1/health", { signal });
  if (!isHealthResponse(data)) {
    throw new ApiError("API 返回了无法识别的健康状态数据。");
  }

  return data;
}
