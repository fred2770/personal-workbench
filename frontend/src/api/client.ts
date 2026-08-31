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
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/health`, {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError("无法连接后端服务，请确认 API 已在 8800 端口启动。");
  }

  if (!response.ok) {
    throw new ApiError(`API 返回异常状态（HTTP ${response.status}）。`, response.status);
  }

  const data: unknown = await response.json();
  if (!isHealthResponse(data)) {
    throw new ApiError("API 返回了无法识别的健康状态数据。", response.status);
  }

  return data;
}
