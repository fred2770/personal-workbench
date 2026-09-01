import { useEffect, useState, type FormEvent } from "react";
import { getProjects } from "../api/projects";
import { AppIcon } from "../components/AppIcon";
import { inboxTypeOptions } from "../data/inbox";
import type { CreateInboxItemInput, InboxItemType } from "../types/inbox";
import type { Project } from "../types/project";

interface QuickCaptureProps {
  onCapture: (payload: CreateInboxItemInput) => Promise<void>;
}

export function QuickCapture({ onCapture }: QuickCaptureProps) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<InboxItemType>("TODO");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getProjects({ page: 1, pageSize: 100 }, controller.signal)
      .then((result) => {
        setProjects(result.items);
        setProjectsError(false);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setProjectsError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setProjectsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedContent = content.trim();
    if (!normalizedContent || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");
    try {
      await onCapture({
        content: normalizedContent,
        type,
        project_id: projectId ? Number(projectId) : null,
      });
      setContent("");
      setFeedback("已保存到 Inbox");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "记录失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel quick-capture" id="quick-capture">
      <header className="panel-heading">
        <div>
          <p className="section-label">Quick Capture</p>
          <h2>快速记录</h2>
        </div>
        <kbd>Ctrl N</kbd>
      </header>

      <form onSubmit={handleSubmit}>
        <label className="capture-label" htmlFor="quick-capture-input">记录内容</label>
        <textarea
          autoComplete="off"
          id="quick-capture-input"
          maxLength={2000}
          onChange={(event) => {
            setContent(event.target.value);
            setFeedback("");
            setErrorMessage("");
          }}
          placeholder="记录待办、问题、现场反馈，或粘贴一段日志…"
          rows={4}
          value={content}
        />

        <div className="capture-toolbar">
          <label className="select-control">
            <span>类型</span>
            <select
              onChange={(event) => setType(event.target.value as InboxItemType)}
              value={type}
            >
              {inboxTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="select-control select-control--project">
            <span>项目</span>
            <select onChange={(event) => setProjectId(event.target.value)} value={projectId}>
              <option value="">不关联项目</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </label>
          <button
            className="attachment-control attachment-control--disabled"
            disabled
            title="附件上传暂未开放"
            type="button"
          >
            <AppIcon name="paperclip" size={16} />
            <span>附件（暂未开放）</span>
          </button>
        </div>

        <div className="capture-submit-row">
          <p
            aria-live="polite"
            className={errorMessage ? "form-message form-message--error" : "form-message"}
          >
            {errorMessage || feedback || (projectsError
              ? "项目加载失败，仍可保存为未归类"
              : projectsLoading ? "正在加载项目…" : `${content.length}/2000`)}
          </p>
          <button
            className="button button--primary"
            disabled={!content.trim() || isSubmitting}
            type="submit"
          >
            <AppIcon name="plus" size={16} />
            {isSubmitting ? "记录中…" : "记录"}
          </button>
        </div>
      </form>
    </section>
  );
}
