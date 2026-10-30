import { useEffect, useState } from "react";
import { ChevronDown, Eye, Loader2, RefreshCw, Search } from "lucide-react";
import Pagination from "../../common/Pagination";
import useDelayedLoad from "../../common/useDelayedLoad";
import { adminRagService } from "../../../services/rag/adminRagService";
import type { RagDocumentRow, RagProjectRow, RagSourceKind } from "../../../types/rag/rag.types";
import { formatDate, formatTime } from "../../../utils/formatDate";
import { StatusBadge } from "./ragLabels";

const PAGE_SIZE = 10;

type Props = {
  canManage: boolean;
  busyKey: string | null;
  // Tăng lên sau mỗi lần index lại để bảng tải lại
  reloadToken: number;
  onReindex: (kind: RagSourceKind, id: number, title: string) => void;
  onViewChunks: (kind: RagSourceKind, id: number, title: string) => void;
};

// Mỗi loại nguồn có bộ trạng thái lọc riêng
const STATUS_OPTIONS: Record<RagSourceKind, { value: string; label: string }[]> = {
  documents: [
    { value: "INDEXED", label: "Đã index" },
    { value: "PENDING", label: "Chờ index" },
    { value: "FAILED", label: "Lỗi" },
    { value: "SKIPPED", label: "Bỏ qua" },
  ],
  projects: [
    { value: "INDEXED", label: "Đã index" },
    { value: "NOT_INDEXED", label: "Chưa index" },
    { value: "FAILED", label: "Lỗi" },
  ],
};

type Row = { id: number; title: string; sub: string; published: boolean; row: RagDocumentRow | RagProjectRow };

const select =
  "h-11 appearance-none rounded-xl border border-line bg-white pl-4 pr-10 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

const formatDateTime = (iso: string | null) => (iso ? `${formatTime(iso)} ${formatDate(iso)}` : "—");

// Tab Nguồn dữ liệu: mọi tài liệu / dự án kèm trạng thái index, số đoạn AI đọc được
export default function RagSourcesPanel({ canManage, busyKey, reloadToken, onReindex, onViewChunks }: Props) {
  const [kind, setKind] = useState<RagSourceKind>("documents");
  const [status, setStatus] = useState("");
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);

  // Chờ người dùng ngừng gõ rồi mới tìm
  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(input.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [input]);

  const list = useDelayedLoad(JSON.stringify([kind, status, keyword, page, reloadToken]), async () => {
    const params = { status, keyword, page, size: PAGE_SIZE };
    if (kind === "documents") {
      const p = await adminRagService.documents(params);
      return {
        totalPages: p.totalPages,
        total: p.totalElements,
        rows: p.content.map((d): Row => ({
          id: d.id,
          title: d.title,
          sub: [d.type === "FILE" ? "File" : "Bài viết", d.category].filter(Boolean).join(" · "),
          published: d.published,
          row: d,
        })),
      };
    }
    const p = await adminRagService.projects(params);
    return {
      totalPages: p.totalPages,
      total: p.totalElements,
      rows: p.content.map((x): Row => ({ id: x.id, title: x.name, sub: x.error ?? "", published: x.published, row: x })),
    };
  });

  const changeKind = (k: RagSourceKind) => {
    setKind(k);
    setStatus("");
    setPage(0);
  };

  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="flex rounded-xl bg-primary-50 p-1" role="tablist" aria-label="Loại nguồn">
          {(["documents", "projects"] as const).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={kind === k}
              onClick={() => changeKind(k)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${kind === k ? "bg-white text-primary-700 shadow-sm" : "text-body hover:text-primary-700"}`}
            >
              {k === "documents" ? "Tài liệu" : "Dự án"}
            </button>
          ))}
        </div>
        <div className="relative min-w-60 flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={kind === "documents" ? "Tìm theo tên tài liệu..." : "Tìm theo tên dự án..."}
            aria-label="Tìm nguồn"
            className="h-11 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-sm outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
          />
        </div>
        <label className="relative block">
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} aria-label="Trạng thái index" className={select}>
            <option value="">Trạng thái: Tất cả</option>
            {STATUS_OPTIONS[kind].map((o) => <option key={o.value} value={o.value}>Trạng thái: {o.label}</option>)}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
        </label>
      </div>

      <div className="border-t border-line">
        {list.waiting ? (
          <div className="animate-pulse space-y-3 p-4" aria-busy="true" aria-label="Đang tải nguồn">
            {[0, 1, 2, 3].map((n) => <div key={n} className="h-14 rounded-xl bg-primary-50" />)}
          </div>
        ) : list.status === "error" || !list.data ? (
          <div role="alert" className="px-6 py-14 text-center">
            <p className="font-semibold text-heading">Không tải được danh sách</p>
            <button onClick={list.retry} className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">Thử lại</button>
          </div>
        ) : list.data.rows.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-body">Không có nguồn nào phù hợp.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-body">
                <tr>
                  <th className="px-5 py-3 font-semibold">{kind === "documents" ? "Tài liệu" : "Dự án"}</th>
                  <th className="px-3 py-3 font-semibold">Trạng thái</th>
                  <th className="px-3 py-3 text-right font-semibold">Số đoạn</th>
                  <th className="px-3 py-3 font-semibold">Index lúc</th>
                  <th className="px-5 py-3 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.data.rows.map((r) => {
                  const key = `${kind}-${r.id}`;
                  const busy = busyKey === key;
                  return (
                    <tr key={key} className="hover:bg-primary-50/40">
                      <td className="max-w-md px-5 py-3">
                        <p className="flex items-center gap-2 font-medium text-heading">
                          <span className="truncate">{r.title}</span>
                          {!r.published && <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-body">Đang ẩn</span>}
                        </p>
                        {r.sub && <p className="line-clamp-1 text-xs text-body" title={r.sub}>{r.sub}</p>}
                      </td>
                      <td className="px-3 py-3"><StatusBadge status={r.row.status} /></td>
                      <td className="px-3 py-3 text-right font-semibold text-heading">{r.row.chunks}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-body">{formatDateTime(r.row.indexedAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => onViewChunks(kind, r.id, r.title)}
                            title="Xem nội dung AI đã đọc"
                            aria-label={`Xem nội dung AI đã đọc của ${r.title}`}
                            className="rounded-lg p-2 text-body transition hover:bg-primary-50 hover:text-primary-700"
                          >
                            <Eye size={18} />
                          </button>
                          {canManage && (
                            <button
                              onClick={() => onReindex(kind, r.id, r.title)}
                              disabled={busy}
                              title="Index lại"
                              aria-label={`Index lại ${r.title}`}
                              className="rounded-lg p-2 text-body transition hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50"
                            >
                              {busy ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {list.data && !list.waiting && list.data.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
          <p className="text-xs text-body">{list.data.total} {kind === "documents" ? "tài liệu" : "dự án"}</p>
          <Pagination page={page} totalPages={list.data.totalPages} onChange={setPage} />
        </div>
      )}
    </section>
  );
}
