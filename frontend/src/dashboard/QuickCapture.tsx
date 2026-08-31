import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AppIcon } from "../components/AppIcon";
import { captureProjects, captureTypes } from "../data/dashboard";
import type { CapturePayload } from "../types/dashboard";

interface QuickCaptureProps {
  onCapture: (payload: CapturePayload) => void;
}

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

export function QuickCapture({ onCapture }: QuickCaptureProps) {
  const [content, setContent] = useState("");
  const [type, setType] = useState(captureTypes[0].value);
  const [projectId, setProjectId] = useState(captureProjects[0].value);
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const invalidFile = files.find((file) => file.size === 0 || file.size > MAX_ATTACHMENT_SIZE);

    if (invalidFile) {
      setAttachmentError(
        invalidFile.size === 0
          ? `${invalidFile.name} 是空文件，未加入附件。`
          : `${invalidFile.name} 超过 10 MB，未加入附件。`,
      );
      event.target.value = "";
      return;
    }

    setAttachmentError("");
    setAttachmentNames(files.map((file) => file.name));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedContent = content.trim();
    if (!normalizedContent) {
      return;
    }

    onCapture({ content: normalizedContent, type, projectId, attachmentNames });
    setContent("");
    setAttachmentNames([]);
    setFeedback("已加入 Inbox（当前会话）");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
          }}
          placeholder="记录待办、问题、现场反馈，或粘贴一段日志…"
          rows={4}
          value={content}
        />

        <div className="capture-toolbar">
          <label className="select-control">
            <span>类型</span>
            <select onChange={(event) => setType(event.target.value)} value={type}>
              {captureTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="select-control select-control--project">
            <span>项目</span>
            <select onChange={(event) => setProjectId(event.target.value)} value={projectId}>
              {captureProjects.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="attachment-control">
            <AppIcon name="paperclip" size={16} />
            <span>{attachmentNames.length > 0 ? `${attachmentNames.length} 个附件` : "附件"}</span>
            <input
              aria-label="选择附件"
              multiple
              onChange={handleFiles}
              ref={fileInputRef}
              type="file"
            />
          </label>
        </div>

        {attachmentNames.length > 0 && (
          <div className="attachment-list" aria-label="已选择附件">
            {attachmentNames.map((name) => <span key={name} title={name}>{name}</span>)}
          </div>
        )}

        <div className="capture-submit-row">
          <p aria-live="polite" className={attachmentError ? "form-message form-message--error" : "form-message"}>
            {attachmentError || feedback || `${content.length}/2000`}
          </p>
          <button className="button button--primary" disabled={!content.trim()} type="submit">
            <AppIcon name="plus" size={16} />
            记录
          </button>
        </div>
      </form>
    </section>
  );
}
