import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { getInboxItem, getInboxItems } from "../api/inbox";
import { AppIcon } from "../components/AppIcon";
import {
  inboxStatusLabels,
  inboxStatusOptions,
  inboxTypeLabels,
  inboxTypeOptions,
} from "../data/inbox";
import { InboxDetailDrawer } from "../inbox/InboxDetailDrawer";
import type { InboxItem, InboxItemListResponse, InboxItemStatus, InboxItemType } from "../types/inbox";

const PAGE_SIZE = 12;

function formatListTime(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return new Intl.DateTimeFormat("zh-CN", sameDay
    ? { hour: "2-digit", minute: "2-digit" }
    : { month: "2-digit", day: "2-digit" }
  ).format(date);
}

function buildSummary(content: string, title: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  return normalized === title ? "无补充内容" : normalized;
}

export function InboxPage() {
  const [searchDraft, setSearchDraft] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<InboxItemType | "">("");
  const [statusFilter, setStatusFilter] = useState<InboxItemStatus | "">("INBOX");
  const [page, setPage] = useState(1);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [result, setResult] = useState<InboxItemListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailVersion, setDetailVersion] = useState(0);

  const refreshList = useCallback(() => setRefreshVersion((current) => current + 1), []);
  const closeDrawer = useCallback(() => {
    setSelectedId(null);
    setSelectedItem(null);
    setDetailError("");
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setListError("");
    setResult(null);
    getInboxItems({
      page,
      pageSize: PAGE_SIZE,
      q: query || undefined,
      type: typeFilter || undefined,
      status: statusFilter || undefined,
    }, controller.signal)
      .then(setResult)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setListError(error instanceof Error ? error.message : "Inbox 加载失败，请稍后重试。");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [page, query, refreshVersion, statusFilter, typeFilter]);

  useEffect(() => {
    if (selectedId === null) return;
    const controller = new AbortController();
    setDetailLoading(true);
    setDetailError("");
    setSelectedItem(null);
    getInboxItem(selectedId, controller.signal)
      .then(setSelectedItem)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setDetailError(error instanceof Error ? error.message : "详情加载失败，请稍后重试。");
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailLoading(false);
      });
    return () => controller.abort();
  }, [detailVersion, selectedId]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setQuery(searchDraft.trim());
  };

  const clearFilters = () => {
    setSearchDraft("");
    setQuery("");
    setTypeFilter("");
    setStatusFilter("INBOX");
    setPage(1);
  };

  const hasFilters = Boolean(query || typeFilter || statusFilter !== "INBOX");

  return (
    <div className="page-content inbox-page">
      <section className="inbox-heading">
        <div>
          <p className="section-label">Capture Queue</p>
          <h2>Inbox</h2>
          <p>整理快速记录，确认类型与状态后进入后续工作流。</p>
        </div>
        <span className="inbox-total"><strong>{result?.total ?? "—"}</strong> 条记录</span>
      </section>

      <section className="panel inbox-panel">
        <form className="inbox-toolbar" onSubmit={handleSearch}>
          <label className="inbox-search">
            <span className="sr-only">搜索 Inbox</span>
            <AppIcon name="search" size={16} />
            <input
              maxLength={200}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="搜索标题或内容"
              value={searchDraft}
            />
          </label>
          <button className="button button--secondary inbox-search-button" type="submit">搜索</button>
          <label className="filter-control">
            <span>类型</span>
            <select
              onChange={(event) => {
                setPage(1);
                setTypeFilter(event.target.value as InboxItemType | "");
              }}
              value={typeFilter}
            >
              <option value="">全部类型</option>
              {inboxTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="filter-control">
            <span>状态</span>
            <select
              onChange={(event) => {
                setPage(1);
                setStatusFilter(event.target.value as InboxItemStatus | "");
              }}
              value={statusFilter}
            >
              <option value="">全部状态</option>
              {inboxStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </form>

        <div className="inbox-list-header" aria-hidden="true">
          <span>类型</span><span>记录</span><span>项目</span><span>状态</span><span>更新时间</span>
        </div>

        {isLoading && (
          <div aria-busy="true" aria-label="正在加载 Inbox" className="inbox-loading-list">
            {Array.from({ length: 5 }, (_, index) => (
              <span className="inbox-skeleton" key={index} />
            ))}
          </div>
        )}

        {!isLoading && listError && (
          <div className="inbox-state inbox-state--error">
            <AppIcon name="alert" size={24} />
            <h3>暂时无法读取 Inbox</h3>
            <p>{listError}</p>
            <button className="button button--secondary" onClick={refreshList} type="button">重新加载</button>
          </div>
        )}

        {!isLoading && !listError && result?.items.length === 0 && (
          <div className="inbox-state">
            <span className="inbox-state-icon"><AppIcon name="inbox" size={25} /></span>
            <h3>{hasFilters ? "没有匹配的记录" : "Inbox 已清空"}</h3>
            <p>{hasFilters ? "尝试调整关键词或筛选条件。" : "新的快速记录会出现在这里。"}</p>
            {hasFilters ? (
              <button className="button button--secondary" onClick={clearFilters} type="button">清除筛选</button>
            ) : (
              <Link className="button button--primary" to="/dashboard#quick-capture">快速记录</Link>
            )}
          </div>
        )}

        {!isLoading && !listError && result && result.items.length > 0 && (
          <div className="inbox-list">
            {result.items.map((item) => (
              <button
                className="inbox-row"
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                type="button"
              >
                <span className={`inbox-type inbox-type--${item.type.toLowerCase()}`}>{inboxTypeLabels[item.type]}</span>
                <span className="inbox-row-copy">
                  <strong>{item.title}</strong>
                  <small><em>{item.project?.name ?? "未归类"}</em> · {buildSummary(item.content, item.title)}</small>
                </span>
                <span className="inbox-project" title={item.project?.name ?? "未归类"}>{item.project?.name ?? "未归类"}</span>
                <span className={`inbox-status inbox-status--${item.status.toLowerCase()}`}>{inboxStatusLabels[item.status]}</span>
                <time>{formatListTime(item.updated_at)}</time>
              </button>
            ))}
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

      {selectedId !== null && (
        <InboxDetailDrawer
          error={detailError}
          item={selectedItem}
          loading={detailLoading}
          onClose={closeDrawer}
          onDeleted={() => {
            closeDrawer();
            refreshList();
          }}
          onMutation={(updatedItem, close) => {
            setSelectedItem(updatedItem);
            refreshList();
            if (close) closeDrawer();
          }}
          onRetry={() => setDetailVersion((current) => current + 1)}
        />
      )}
    </div>
  );
}
