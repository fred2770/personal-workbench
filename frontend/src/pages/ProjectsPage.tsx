import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { createProject, getProjects } from "../api/projects";
import { AppIcon } from "../components/AppIcon";
import {
  projectPriorityLabels,
  projectPriorityOptions,
  projectStatusLabels,
  projectStatusOptions,
  projectStatusTones,
} from "../data/projects";
import { ProjectFormModal } from "../projects/ProjectFormModal";
import type {
  CreateProjectInput,
  Project,
  ProjectListResponse,
  ProjectPriority,
  ProjectStatus,
} from "../types/project";

const PAGE_SIZE = 12;

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function ProjectCard({ project }: { project: Project }) {
  const tone = projectStatusTones[project.status];
  return (
    <Link className="project-list-card" to={`/projects/${project.id}`}>
      <header>
        <span className={`project-symbol tone-${tone}`}><AppIcon name="folder" size={17} /></span>
        <span className={`status-badge tone-${tone}`}>{projectStatusLabels[project.status]}</span>
      </header>
      <div className="project-list-copy">
        <h3 title={project.name}>{project.name}</h3>
        <p>{project.description || "暂无项目描述"}</p>
      </div>
      <div className="project-list-meta">
        <span className={`project-priority project-priority--${project.priority.toLowerCase()}`}>
          {projectPriorityLabels[project.priority]}优先级
        </span>
        <span>0 工作项</span>
      </div>
      <div className="progress-meta"><span>项目进度</span><strong>{project.progress}%</strong></div>
      <div className="progress-track" aria-label={`${project.name}进度 ${project.progress}%`}>
        <span className={`tone-${tone}`} style={{ width: `${project.progress}%` }} />
      </div>
      <footer>
        <time><AppIcon name="clock" size={13} />更新于 {formatUpdatedAt(project.updated_at)}</time>
        <span>查看详情 <AppIcon name="arrow" size={13} /></span>
      </footer>
    </Link>
  );
}

export function ProjectsPage() {
  const [searchDraft, setSearchDraft] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | "">("");
  const [page, setPage] = useState(1);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [result, setResult] = useState<ProjectListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const refreshList = useCallback(() => setRefreshVersion((current) => current + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setListError("");
    setResult(null);
    getProjects({
      page,
      pageSize: PAGE_SIZE,
      q: query || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
    }, controller.signal)
      .then(setResult)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setListError(error instanceof Error ? error.message : "项目加载失败，请稍后重试。");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [page, priorityFilter, query, refreshVersion, statusFilter]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setQuery(searchDraft.trim());
  };

  const clearFilters = () => {
    setSearchDraft("");
    setQuery("");
    setStatusFilter("");
    setPriorityFilter("");
    setPage(1);
  };

  const hasFilters = Boolean(query || statusFilter || priorityFilter);

  const handleCreate = async (input: CreateProjectInput) => {
    const created = await createProject(input);
    setCreateOpen(false);
    setFeedback(`项目“${created.name}”已创建`);
    if (page !== 1) setPage(1);
    else refreshList();
  };

  return (
    <div className="page-content projects-page">
      <section className="projects-heading">
        <div>
          <p className="section-label">Project Hub</p>
          <h2>项目</h2>
          <p>以项目聚合上下文、快速记录和后续工作事项。</p>
        </div>
        <div className="projects-heading-actions">
          <span className="inbox-total"><strong>{result?.total ?? "—"}</strong> 个项目</span>
          <button className="button button--primary" onClick={() => setCreateOpen(true)} type="button">
            <AppIcon name="plus" size={16} />新建项目
          </button>
        </div>
      </section>

      {feedback && <p aria-live="polite" className="page-feedback">{feedback}</p>}

      <section className="panel projects-list-panel">
        <form className="projects-toolbar" onSubmit={handleSearch}>
          <label className="inbox-search">
            <span className="sr-only">搜索项目</span>
            <AppIcon name="search" size={16} />
            <input
              maxLength={200}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="搜索项目名称或描述"
              value={searchDraft}
            />
          </label>
          <button className="button button--secondary inbox-search-button" type="submit">搜索</button>
          <label className="filter-control">
            <span>状态</span>
            <select
              onChange={(event) => {
                setPage(1);
                setStatusFilter(event.target.value as ProjectStatus | "");
              }}
              value={statusFilter}
            >
              <option value="">未归档项目</option>
              {projectStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="filter-control">
            <span>优先级</span>
            <select
              onChange={(event) => {
                setPage(1);
                setPriorityFilter(event.target.value as ProjectPriority | "");
              }}
              value={priorityFilter}
            >
              <option value="">全部优先级</option>
              {projectPriorityOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </form>

        {isLoading && (
          <div aria-busy="true" aria-label="正在加载项目" className="projects-card-grid">
            {Array.from({ length: 6 }, (_, index) => <span className="project-card-skeleton" key={index} />)}
          </div>
        )}

        {!isLoading && listError && (
          <div className="inbox-state inbox-state--error">
            <AppIcon name="alert" size={24} />
            <h3>暂时无法读取项目</h3>
            <p>{listError}</p>
            <button className="button button--secondary" onClick={refreshList} type="button">重新加载</button>
          </div>
        )}

        {!isLoading && !listError && result?.items.length === 0 && (
          <div className="inbox-state">
            <span className="inbox-state-icon"><AppIcon name="projects" size={25} /></span>
            <h3>{hasFilters ? "没有匹配的项目" : "还没有项目"}</h3>
            <p>{hasFilters ? "尝试调整搜索或筛选条件。" : "创建第一个项目，开始聚合工作上下文。"}</p>
            {hasFilters ? (
              <button className="button button--secondary" onClick={clearFilters} type="button">清除筛选</button>
            ) : (
              <button className="button button--primary" onClick={() => setCreateOpen(true)} type="button">新建项目</button>
            )}
          </div>
        )}

        {!isLoading && !listError && result && result.items.length > 0 && (
          <div className="projects-card-grid">
            {result.items.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
        )}

        {!isLoading && !listError && result && result.pages > 1 && (
          <footer className="inbox-pagination">
            <span>第 {result.page} / {result.pages} 页</span>
            <div>
              <button className="button button--secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} type="button">上一页</button>
              <button className="button button--secondary" disabled={page >= result.pages} onClick={() => setPage((current) => current + 1)} type="button">下一页</button>
            </div>
          </footer>
        )}
      </section>

      {createOpen && (
        <ProjectFormModal
          onClose={() => setCreateOpen(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}
