import { useCallback, useEffect, useRef, useState } from "react";
import { getHealth } from "../api/client";
import type { HealthResponse } from "../types/health";

type HealthState =
  | { phase: "loading" }
  | { phase: "online"; data: HealthResponse }
  | { phase: "offline"; message: string };

export function HealthStatus() {
  const [state, setState] = useState<HealthState>({ phase: "loading" });
  const activeRequest = useRef<AbortController | null>(null);

  const checkHealth = useCallback(async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setState({ phase: "loading" });

    try {
      const data = await getHealth(controller.signal);
      if (activeRequest.current === controller) {
        setState({ phase: "online", data });
      }
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      const message = error instanceof Error ? error.message : "后端服务暂时不可用。";
      if (activeRequest.current === controller) {
        setState({ phase: "offline", message });
      }
    }
  }, []);

  useEffect(() => {
    void checkHealth();
    return () => activeRequest.current?.abort();
  }, [checkHealth]);

  const label =
    state.phase === "loading" ? "API 检查中" : state.phase === "online" ? "API 在线" : "API 离线";
  const detail =
    state.phase === "online"
      ? `${state.data.service} · ${state.data.database}`
      : state.phase === "offline"
        ? state.message
        : "正在检查本地服务";

  return (
    <button
      aria-label={`${label}。${detail}。点击重新检查`}
      className={`api-status api-status--${state.phase}`}
      disabled={state.phase === "loading"}
      onClick={() => void checkHealth()}
      title={`${detail}；点击重新检查`}
      type="button"
    >
      <span className="status-dot" aria-hidden="true" />
      <span className="api-status-label">{label}</span>
    </button>
  );
}
