import { useEffect, useState, type FormEvent } from "react";
import { archiveInboxItem, deleteInboxItem, updateInboxItem } from "../api/inbox";
import { getProjects } from "../api/projects";
import { AppIcon } from "../components/AppIcon";
import {
  inboxStatusLabels,
  inboxStatusOptions,
  inboxTypeLabels,
  inboxTypeOptions,
} from "../data/inbox";
import type { InboxItem, InboxItemStatus, InboxItemType } from "../types/inbox";
import type { Project } from "../types/project";

interface InboxDetailDrawerProps {
  item: InboxItem | null;
  loading: boolean;
  error: string;
  onClose: () => void;
  onDeleted: () => void;
  onMutation: (item: InboxItem, close: boolean) => void;
  onRetry: () => void;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function InboxDetailDrawer({
  item,
  loading,
  error,
  onClose,
  onDeleted,
  onMutation,
  onRetry,
}: InboxDetailDrawerProps) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<InboxItemType>("TODO");
  const [status, setStatus] = useState<InboxItemStatus>("INBOX");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!item) return;
    setContent(item.content);
    setType(item.type);
    setStatus(item.status);
    setProjectId(item.project_id ? String(item.project_id) : "");
    setActionError("");
    setFeedback("");
  }, [item?.id]);

  useEffect(() => {
    const controller = new AbortController();
    getProjects({ page: 1, pageSize: 100 }, controller.signal)
      .then((result) => {
        setProjects(result.items);
        setProjectsError(false);
      })
      .catch((projectError: unknown) => {
        if (projectError instanceof DOMException && projectError.name === "AbortError") return;
        setProjectsError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setProjectsLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (confirmDelete) {
        setConfirmDelete(false);
      } else {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmDelete, onClose]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item || !content.trim() || isSaving) return;
    setIsSaving(true);
    setActionError("");
    setFeedback("");
    try {
      const updated = await updateInboxItem(item.id, {
        content: content.trim(),
        type,
        status,
        project_id: projectId ? Number(projectId) : null,
      });
      setFeedback("修改已保存");
      onMutation(updated, false);
    } catch (saveError) {
      setActionError(saveError instanceof Error ? saveError.message : "保存失败，请稍后重试。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!item || isArchiving) return;
    setIsArchiving(true);
    setActionError("");
    try {
      const archived = await archiveInboxItem(item.id);
      onMutation(archived, true);
    } catch (archiveError) {
      setActionError(archiveError instanceof Error ? archiveError.message : "归档失败，请稍后重试。");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (!item || isDeleting) return;
    setIsDeleting(true);
    setActionError("");
    try {
      await deleteInboxItem(item.id);
      setConfirmDelete(false);
      onDeleted();
    } catch (deleteError) {
      setConfirmDelete(false);
      setActionError(deleteError instanceof Error ? deleteError.message : "删除失败，请稍后重试。");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="drawer-layer" role="presentation">
      <button aria-label="关闭详情" className="drawer-backdrop" onClick={onClose} type="button" />
      <aside aria-label="Inbox 记录详情" aria-modal="true" className="detail-drawer" role="dialog">
        <header className="drawer-header">
          <div>
            <p className="section-label">Inbox Detail</p>
            <h2>{item?.title ?? "记录详情"}</h2>
          </div>
          <button aria-label="关闭" className="icon-button" onClick={onClose} type="button">
            <AppIcon name="x" size={18} />
          </button>
        </header>

        {loading && (
          <div aria-busy="true" className="drawer-state">
            <span className="loading-spinner" />
            <p>正在读取详情…</p>
          </div>
        )}

        {!loading && error && (
          <div className="drawer-state drawer-state--error">
            <AppIcon name="alert" size={22} />
            <p>{error}</p>
            <button className="button button--secondary" onClick={onRetry} type="button">重试</button>
          </div>
        )}

        {!loading && !error && item && (
          <form className="drawer-form" onSubmit={handleSave}>
            <div className="drawer-meta">
              <span className={`inbox-type inbox-type--${item.type.toLowerCase()}`}>
                {inboxTypeLabels[item.type]}
              </span>
              <span className={`inbox-status inbox-status--${item.status.toLowerCase()}`}>
                {inboxStatusLabels[item.status]}
              </span>
              <time>创建于 {formatDateTime(item.created_at)}</time>
            </div>

            <label className="field-control">
              <span>内容</span>
              <textarea
                maxLength={20000}
                onChange={(event) => {
                  setContent(event.target.value);
                  setFeedback("");
                }}
                rows={10}
                value={content}
              />
              <small>{content.length}/20000</small>
            </label>

            <div className="drawer-field-grid">
              <label className="field-control">
                <span>类型</span>
                <select onChange={(event) => setType(event.target.value as InboxItemType)} value={type}>
                  {inboxTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="field-control">
                <span>状态</span>
                <select onChange={(event) => setStatus(event.target.value as InboxItemStatus)} value={status}>
                  {inboxStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="field-control">
              <span>项目</span>
              <select
                disabled={projectsLoading}
                onChange={(event) => setProjectId(event.target.value)}
                value={projectId}
              >
                <option value="">未归类</option>
                {item.project && !projects.some((project) => project.id === item.project?.id) && (
                  <option value={item.project.id}>{item.project.name}（已归档）</option>
                )}
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              {projectsError && <span className="field-hint field-hint--error">项目列表加载失败，当前关联保持不变。</span>}
            </label>

            <p aria-live="polite" className={actionError ? "form-message form-message--error" : "form-message"}>
              {actionError || feedback || `最后更新 ${formatDateTime(item.updated_at)}`}
            </p>

            <footer className="drawer-actions">
              <button
                className="button button--danger-ghost"
                onClick={() => setConfirmDelete(true)}
                type="button"
              >
                <AppIcon name="trash" size={15} />删除
              </button>
              <span className="drawer-actions-spacer" />
              {item.status !== "ARCHIVED" && (
                <button
                  className="button button--secondary"
                  disabled={isArchiving}
                  onClick={handleArchive}
                  type="button"
                >
                  <AppIcon name="archive" size={15} />
                  {isArchiving ? "归档中…" : "归档"}
                </button>
              )}
              <button className="button button--primary" disabled={!content.trim() || isSaving} type="submit">
                {isSaving ? "保存中…" : "保存修改"}
              </button>
            </footer>
          </form>
        )}
      </aside>

      {confirmDelete && item && (
        <div aria-modal="true" className="confirm-layer" role="dialog">
          <section className="confirm-dialog">
            <div className="confirm-icon"><AppIcon name="trash" size={20} /></div>
            <h3>删除这条记录？</h3>
            <p>“{item.title}”将被永久删除，此操作无法撤销。</p>
            <div>
              <button className="button button--secondary" onClick={() => setConfirmDelete(false)} type="button">取消</button>
              <button className="button button--danger" disabled={isDeleting} onClick={handleDelete} type="button">
                {isDeleting ? "删除中…" : "确认删除"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
