import { useEffect, useState, type FormEvent } from "react";
import { AppIcon } from "../components/AppIcon";
import { projectPriorityOptions, projectStatusOptions } from "../data/projects";
import type {
  CreateProjectInput,
  Project,
  ProjectPriority,
  ProjectStatus,
} from "../types/project";

interface ProjectFormModalProps {
  project?: Project;
  onClose: () => void;
  onSave: (input: CreateProjectInput) => Promise<void>;
}

interface FormErrors {
  name?: string;
  progress?: string;
}

export function ProjectFormModal({ project, onClose, onSave }: ProjectFormModalProps) {
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "PLANNING");
  const [priority, setPriority] = useState<ProjectPriority>(project?.priority ?? "NORMAL");
  const [progress, setProgress] = useState(String(project?.progress ?? 0));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors: FormErrors = {};
    const normalizedName = name.trim();
    const numericProgress = Number(progress);
    if (!normalizedName) nextErrors.name = "请输入项目名称。";
    if (!Number.isInteger(numericProgress) || numericProgress < 0 || numericProgress > 100) {
      nextErrors.progress = "进度必须是 0 到 100 的整数。";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await onSave({
        name: normalizedName,
        description: description.trim(),
        status,
        priority,
        progress: numericProgress,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "保存失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="project-modal-layer">
      <button
        aria-label="关闭项目表单"
        className="project-modal-backdrop"
        disabled={isSubmitting}
        onClick={onClose}
        type="button"
      />
      <section
        aria-label={project ? "编辑项目" : "新建项目"}
        aria-modal="true"
        className="project-modal"
        role="dialog"
      >
        <header className="project-modal-header">
          <div>
            <p className="section-label">{project ? "Edit Project" : "New Project"}</p>
            <h2>{project ? "编辑项目" : "新建项目"}</h2>
          </div>
          <button aria-label="关闭" className="icon-button" disabled={isSubmitting} onClick={onClose} type="button">
            <AppIcon name="x" size={18} />
          </button>
        </header>

        <form className="project-form" onSubmit={handleSubmit}>
          <label className="field-control">
            <span>项目名称 <em>*</em></span>
            <input
              autoFocus
              maxLength={160}
              onChange={(event) => {
                setName(event.target.value);
                setErrors((current) => ({ ...current, name: undefined }));
              }}
              placeholder="例如：天津现场定位优化"
              value={name}
            />
            {errors.name && <strong className="field-error">{errors.name}</strong>}
          </label>

          <label className="field-control">
            <span>项目描述</span>
            <textarea
              maxLength={5000}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="说明项目目标、范围和当前上下文…"
              rows={5}
              value={description}
            />
            <small>{description.length}/5000</small>
          </label>

          <div className="project-form-grid">
            <label className="field-control">
              <span>状态</span>
              <select onChange={(event) => setStatus(event.target.value as ProjectStatus)} value={status}>
                {projectStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="field-control">
              <span>优先级</span>
              <select onChange={(event) => setPriority(event.target.value as ProjectPriority)} value={priority}>
                {projectPriorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="field-control">
              <span>进度</span>
              <span className="progress-input-wrap">
                <input
                  max={100}
                  min={0}
                  onChange={(event) => {
                    setProgress(event.target.value);
                    setErrors((current) => ({ ...current, progress: undefined }));
                  }}
                  step={1}
                  type="number"
                  value={progress}
                />
                <b>%</b>
              </span>
              {errors.progress && <strong className="field-error">{errors.progress}</strong>}
            </label>
          </div>

          <p aria-live="polite" className={submitError ? "form-message form-message--error" : "form-message"}>
            {submitError || "项目保存后会立即同步到 Dashboard 和快速记录。"}
          </p>

          <footer className="project-form-actions">
            <button className="button button--secondary" disabled={isSubmitting} onClick={onClose} type="button">取消</button>
            <button className="button button--primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? "保存中…" : project ? "保存修改" : "创建项目"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
