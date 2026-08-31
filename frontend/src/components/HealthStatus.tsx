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
    state.phase === "loading" ? "正在检查" : state.phase === "online" ? "API 在线" : "API 离线";

  return (
    <section className="panel health-panel" aria-live="polite">
      <div className="panel-heading">
        <div>
          <p className="section-label">系统状态</p>
          <h2>本地服务</h2>
        </div>
        <span className={`status-chip status-chip--${state.phase}`}>
          <span className="status-dot" aria-hidden="true" />
          {label}
        </span>
      </div>

      {state.phase === "online" ? (
        <div className="health-body">
          <p className="health-summary">前后端连接正常，可以继续开发业务模块。</p>
          <dl className="health-details">
            <div>
              <dt>服务</dt>
              <dd>{state.data.service}</dd>
            </div>
            <div>
              <dt>数据库</dt>
              <dd>{state.data.database}</dd>
            </div>
            <div>
              <dt>版本</dt>
              <dd>v{state.data.version}</dd>
            </div>
          </dl>
        </div>
      ) : state.phase === "offline" ? (
        <div className="health-body health-body--error">
          <p className="health-summary">{state.message}</p>
          <p className="health-hint">启动 FastAPI 后重试，本页不会把旧状态冒充为在线。</p>
        </div>
      ) : (
        <div className="health-body">
          <p className="health-summary">正在读取 /api/v1/health…</p>
          <div className="skeleton-line" aria-hidden="true" />
        </div>
      )}

      <button
        className="button button--secondary"
        disabled={state.phase === "loading"}
        onClick={() => void checkHealth()}
        type="button"
      >
        {state.phase === "loading" ? "检查中…" : "重新检查"}
      </button>
    </section>
  );
}
