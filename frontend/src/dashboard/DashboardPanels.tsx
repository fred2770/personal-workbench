import { Link } from "react-router-dom";
import { AppIcon } from "../components/AppIcon";
import { projectStatusLabels, projectStatusTones } from "../data/projects";
import type {
  DashboardMetric,
  RecentWorkItem,
  TodoItem,
} from "../types/dashboard";
import type { Project } from "../types/project";

interface OverviewCardsProps {
  metrics: DashboardMetric[];
}

export function OverviewCards({ metrics }: OverviewCardsProps) {
  return (
    <section aria-label="工作概览" className="overview-grid">
      {metrics.map((metric) => (
        <article className={`overview-card tone-${metric.tone}`} key={metric.key}>
          <div className="overview-icon"><AppIcon name={metric.icon} size={17} /></div>
          <div className="overview-copy">
            <span>
              {metric.label}
              <em className={`metric-source metric-source--${metric.source}`}>
                {metric.source === "live" ? "实时" : "示例"}
              </em>
            </span>
            <strong>{metric.value}</strong>
            <small>{metric.helper}</small>
          </div>
        </article>
      ))}
    </section>
  );
}

interface TodoPanelProps {
  items: TodoItem[];
  completedIds: Set<string>;
  onToggle: (id: string) => void;
}

export function TodoPanel({ items, completedIds, onToggle }: TodoPanelProps) {
  return (
    <section className="panel todo-panel">
      <header className="panel-heading">
        <div><p className="section-label">Focus</p><h2>今日待办</h2></div>
        <Link className="panel-link" to="/work-items">查看全部 <AppIcon name="arrow" size={14} /></Link>
      </header>
      <div className="todo-list">
        {items.map((item) => {
          const completed = completedIds.has(item.id);
          return (
            <article className={`todo-row${completed ? " todo-row--completed" : ""}`} key={item.id}>
              <button
                aria-checked={completed}
                aria-label={`${completed ? "恢复" : "完成"}：${item.title}`}
                className="todo-checkbox"
                onClick={() => onToggle(item.id)}
                role="checkbox"
                type="button"
              >
                {completed && <AppIcon name="check" size={13} />}
              </button>
              <div className="todo-copy">
                <strong title={item.title}>{item.title}</strong>
                <span>{item.project}</span>
              </div>
              <span className={`priority priority--${item.priority}`}>{item.priority}</span>
              <time>{item.due}</time>
            </article>
          );
        })}
      </div>
    </section>
  );
}

interface RecentWorkPanelProps {
  items: RecentWorkItem[];
}

export function RecentWorkPanel({ items }: RecentWorkPanelProps) {
  return (
    <section className="panel recent-work-panel">
      <header className="panel-heading">
        <div><p className="section-label">Activity</p><h2>最近工作</h2></div>
        <span className="panel-meta">最近 24 小时</span>
      </header>
      <div className="recent-work-list">
        {items.map((item) => (
          <article className="recent-work-row" key={item.id}>
            <span className={`activity-marker tone-${item.tone}`} aria-hidden="true" />
            <div className="recent-work-copy">
              <div><strong>{item.title}</strong><span className={`status-badge tone-${item.tone}`}>{item.status}</span></div>
              <p>{item.summary}</p>
              <small>{item.type} · {item.updatedAt}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

interface ProjectsPanelProps {
  projects: Project[];
  loading: boolean;
  error: boolean;
}

function formatProjectTime(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ProjectsPanel({ projects, loading, error }: ProjectsPanelProps) {
  return (
    <section className="panel projects-panel">
      <header className="panel-heading">
        <div><p className="section-label">Projects</p><h2>我的项目</h2></div>
        <Link className="panel-link" to="/projects">全部项目 <AppIcon name="arrow" size={14} /></Link>
      </header>
      {loading && (
        <div aria-busy="true" className="project-grid">
          {Array.from({ length: 4 }, (_, index) => <span className="dashboard-project-skeleton" key={index} />)}
        </div>
      )}
      {!loading && error && (
        <div className="dashboard-project-state">
          <span>项目数据加载失败</span><Link to="/projects">前往项目页</Link>
        </div>
      )}
      {!loading && !error && projects.length === 0 && (
        <div className="dashboard-project-state">
          <span>还没有项目</span><Link to="/projects">创建项目</Link>
        </div>
      )}
      {!loading && !error && projects.length > 0 && (
        <div className="project-grid">
        {projects.map((project) => {
          const tone = projectStatusTones[project.status];
          return (
          <Link className="project-card" key={project.id} to={`/projects/${project.id}`}>
            <div className="project-card-top">
              <div className={`project-symbol tone-${tone}`}><AppIcon name="folder" size={17} /></div>
              <span className={`status-badge tone-${tone}`}>{projectStatusLabels[project.status]}</span>
            </div>
            <h3 title={project.name}>{project.name}</h3>
            <div className="progress-meta"><span>当前进度</span><strong>{project.progress}%</strong></div>
            <div className="progress-track" aria-label={`${project.name}进度 ${project.progress}%`}>
              <span className={`tone-${tone}`} style={{ width: `${project.progress}%` }} />
            </div>
            <footer>
              <span>0 工作项</span>
              <time><AppIcon name="clock" size={13} />{formatProjectTime(project.updated_at)}</time>
            </footer>
          </Link>
          );
        })}
        </div>
      )}
    </section>
  );
}
