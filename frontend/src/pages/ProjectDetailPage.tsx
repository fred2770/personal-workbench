import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { archiveProject, deleteProject, getProject, updateProject } from "../api/projects";
import { AppIcon } from "../components/AppIcon";
import {
  projectPriorityLabels,
  projectSections,
  projectStatusLabels,
  projectStatusTones,
} from "../data/projects";
import { ProjectFormModal } from "../projects/ProjectFormModal";
import type { CreateProjectInput, Project } from "../types/project";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ProjectDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const projectId = Number(params.projectId);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);

  const loadProject = useCallback((signal?: AbortSignal) => {
    if (!Number.isInteger(projectId) || projectId < 1) {
      setLoadError("项目地址无效。");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError("");
    getProject(projectId, signal)
      .then(setProject)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadError(error instanceof Error ? error.message : "项目详情加载失败。");
      })
      .finally(() => {
        if (!signal?.aborted) setIsLoading(false);
      });
  }, [projectId]);

  useEffect(() => {
    const controller = new AbortController();
    loadProject(controller.signal);
    return () => controller.abort();
  }, [loadProject, refreshVersion]);

  const handleUpdate = async (input: CreateProjectInput) => {
    if (!project) return;
    const updated = await updateProject(project.id, input);
    setProject(updated);
    setEditOpen(false);
    setFeedback("项目修改已保存");
    setActionError("");
  };

  const handleArchive = async () => {
    if (!project || isArchiving) return;
    setIsArchiving(true);
    setActionError("");
    try {
      const archived = await archiveProject(project.id);
      setProject(archived);
      setFeedback("项目已归档，可在项目列表的“已归档”筛选中查看。");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "归档失败，请稍后重试。");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (!project || isDeleting) return;
    setIsDeleting(true);
    setActionError("");
    try {
      await deleteProject(project.id);
      void navigate("/projects", { replace: true });
    } catch (error) {
      setConfirmDelete(false);
      setActionError(error instanceof Error ? error.message : "删除失败，请稍后重试。");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-content project-detail-page">
        <div aria-busy="true" className="project-detail-loading">
          <span className="loading-spinner" /><p>正在加载项目详情…</p>
        </div>
      </div>
    );
  }

  if (loadError || !project) {
    return (
      <div className="page-content project-detail-page">
        <div className="panel inbox-state inbox-state--error">
          <AppIcon name="alert" size={24} />
          <h3>无法打开项目</h3>
          <p>{loadError || "Project not found"}</p>
          <div className="project-error-actions">
            <Link className="button button--secondary" to="/projects">返回项目列表</Link>
            <button className="button button--primary" onClick={() => setRefreshVersion((current) => current + 1)} type="button">重试</button>
          </div>
        </div>
      </div>
    );
  }

  const tone = projectStatusTones[project.status];

  return (
    <div className="page-content project-detail-page">
      <Link className="project-back-link" to="/projects">← 返回项目列表</Link>

      <section className="project-detail-hero">
        <div className="project-detail-title">
          <span className={`project-symbol tone-${tone}`}><AppIcon name="folder" size={19} /></span>
          <div>
            <div className="project-detail-badges">
              <span className={`status-badge tone-${tone}`}>{projectStatusLabels[project.status]}</span>
              <span className={`project-priority project-priority--${project.priority.toLowerCase()}`}>
                {projectPriorityLabels[project.priority]}优先级
              </span>
            </div>
            <h2>{project.name}</h2>
          </div>
        </div>
        <div className="project-detail-actions">
          <button className="button button--secondary" onClick={() => setEditOpen(true)} type="button">编辑项目</button>
          {project.status !== "ARCHIVED" && (
            <button className="button button--secondary" disabled={isArchiving} onClick={handleArchive} type="button">
              <AppIcon name="archive" size={15} />{isArchiving ? "归档中…" : "归档"}
            </button>
          )}
          <button className="button button--danger-ghost" onClick={() => setConfirmDelete(true)} type="button">
            <AppIcon name="trash" size={15} />删除
          </button>
        </div>
      </section>

      {(feedback || actionError) && (
        <p aria-live="polite" className={actionError ? "page-feedback page-feedback--error" : "page-feedback"}>
          {actionError || feedback}
        </p>
      )}

      <section className="project-detail-grid">
        <article className="panel project-overview-card">
          <header className="panel-heading">
            <div><p className="section-label">Overview</p><h2>项目概览</h2></div>
            <span>0 工作项</span>
          </header>
          <p className="project-description">{project.description || "暂无项目描述。"}</p>
          <div className="project-progress-large">
            <div><span>当前进度</span><strong>{project.progress}%</strong></div>
            <div className="progress-track" aria-label={`${project.name}进度 ${project.progress}%`}>
              <span className={`tone-${tone}`} style={{ width: `${project.progress}%` }} />
            </div>
          </div>
          <dl className="project-facts">
            <div><dt>状态</dt><dd>{projectStatusLabels[project.status]}</dd></div>
            <div><dt>优先级</dt><dd>{projectPriorityLabels[project.priority]}</dd></div>
            <div><dt>创建时间</dt><dd>{formatDateTime(project.created_at)}</dd></div>
            <div><dt>更新时间</dt><dd>{formatDateTime(project.updated_at)}</dd></div>
          </dl>
        </article>

        <aside className="panel project-sections-card">
          <header className="panel-heading">
            <div><p className="section-label">Workspace</p><h2>项目工作区</h2></div>
          </header>
          <div className="project-section-list">
            {projectSections.map((section, index) => (
              <div className={index === 0 ? "project-section-row project-section-row--active" : "project-section-row"} key={section}>
                <span>{section}</span>
                <small>{index === 0 ? "当前" : "下一阶段"}</small>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {editOpen && (
        <ProjectFormModal project={project} onClose={() => setEditOpen(false)} onSave={handleUpdate} />
      )}

      {confirmDelete && (
        <div aria-label="确认删除项目" aria-modal="true" className="confirm-layer" role="dialog">
          <section className="confirm-dialog">
            <div className="confirm-icon"><AppIcon name="trash" size={20} /></div>
            <h3>永久删除这个项目？</h3>
            <p>“{project.name}”将被删除；关联 Inbox 记录会保留并自动变为“未归类”。此操作无法撤销。</p>
            <div>
              <button className="button button--secondary" disabled={isDeleting} onClick={() => setConfirmDelete(false)} type="button">取消</button>
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
