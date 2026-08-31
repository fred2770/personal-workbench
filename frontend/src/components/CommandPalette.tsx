import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { appNavigation } from "../config/navigation";
import { AppIcon } from "./AppIcon";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const results = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase();
    if (!keyword) {
      return appNavigation;
    }

    return appNavigation.filter((item) =>
      `${item.label} ${item.description}`.toLocaleLowerCase().includes(keyword),
    );
  }, [query]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="command-overlay"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
      role="presentation"
    >
      <section aria-label="搜索或跳转" aria-modal="true" className="command-dialog" role="dialog">
        <div className="command-search-row">
          <AppIcon name="search" size={18} />
          <label className="sr-only" htmlFor="command-search">搜索页面</label>
          <input
            id="command-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索页面或功能…"
            ref={inputRef}
            value={query}
          />
          <button aria-label="关闭搜索" className="icon-button" onClick={onClose} type="button">
            <AppIcon name="x" size={16} />
          </button>
        </div>
        <div className="command-results">
          <p className="command-group-label">快速跳转</p>
          {results.length > 0 ? (
            results.map((item) => (
              <Link className="command-result" key={item.path} onClick={onClose} to={item.path}>
                <span className="command-result-icon"><AppIcon name={item.icon} size={17} /></span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
                <AppIcon name="arrow" size={15} />
              </Link>
            ))
          ) : (
            <p className="command-empty">没有匹配的页面</p>
          )}
        </div>
        <footer className="command-footer"><kbd>Esc</kbd><span>关闭</span><kbd>Ctrl K</kbd><span>打开 / 关闭</span></footer>
      </section>
    </div>
  );
}
