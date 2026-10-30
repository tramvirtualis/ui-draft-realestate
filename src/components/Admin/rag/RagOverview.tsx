import { AlertTriangle, Building2, FileText, Layers, RefreshCw } from "lucide-react";
import type { RagSourceKind, RagStatus } from "../../../types/rag/rag.types";
import { STATUS_LABEL } from "./ragLabels";

type Props = {
  status: RagStatus;
  canManage: boolean;
  busyKey: string | null;
  onReindex: (kind: RagSourceKind, id: number, title: string) => void;
  onViewChunks: (kind: RagSourceKind, id: number, title: string) => void;
};

const sum = (o: Partial<Record<string, number>>) => Object.values(o).reduce<number>((a, b) => a + (b ?? 0), 0);

function StatCard({ icon: Icon, title, rows, total }: {
  icon: typeof FileText;
  title: string;
  total: number;
  rows: { label: string; dot: string; value: number }[];
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><Icon size={20} /></span>
        <div>
          <p className="text-sm text-body">{title}</p>
          <p className="text-2xl font-bold text-heading">{total}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5 border-t border-line pt-3 text-sm">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-body"><span className={`h-2 w-2 rounded-full ${r.dot}`} />{r.label}</span>
            <span className="font-semibold text-heading">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Tab Tổng quan: AI đang biết bao nhiêu nguồn, nguồn nào đang lỗi cần xử lý
export default function RagOverview({ status, canManage, busyKey, onReindex, onViewChunks }: Props) {
  const d = status.documents;
  const p = status.projects;
  const row = (key: keyof typeof STATUS_LABEL, value?: number) => ({ label: STATUS_LABEL[key].label, dot: STATUS_LABEL[key].dot, value: value ?? 0 });
  const errors = [
    ...status.failedDocuments.map((x) => ({ kind: "documents" as const, id: x.id, title: x.title, error: null as string | null, failed: true })),
    ...status.projectErrors.map((x) => ({ kind: "projects" as const, id: x.project_id, title: x.name, error: x.error, failed: x.status === "FAILED" })),
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={FileText} title="Tài liệu" total={sum(d)} rows={[row("INDEXED", d.INDEXED), row("PENDING", d.PENDING), row("FAILED", d.FAILED), row("SKIPPED", d.SKIPPED)]} />
        <StatCard icon={Building2} title="Dự án" total={sum(p)} rows={[row("INDEXED", p.INDEXED), row("NOT_INDEXED", (p.NOT_INDEXED ?? 0) + (p.PENDING ?? 0)), row("FAILED", p.FAILED)]} />
        <StatCard
          icon={Layers}
          title="Đoạn text (chunk) AI đang dùng"
          total={sum(status.chunks)}
          rows={[
            { label: "Từ tài liệu", dot: "bg-accent", value: status.chunks.DOCUMENT ?? 0 },
            { label: "Từ dự án", dot: "bg-primary-400", value: status.chunks.PROJECT ?? 0 },
          ]}
        />
      </div>

      <section className="rounded-2xl border border-line bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <AlertTriangle size={18} className="text-warning" />
          <h2 className="font-semibold text-heading">Cần xử lý</h2>
          <span className="text-sm text-body">({errors.length})</span>
        </div>
        {errors.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-body">Không có nguồn nào bị lỗi.</p>
        ) : (
          <ul className="divide-y divide-line">
            {errors.map((e) => {
              const key = `${e.kind}-${e.id}`;
              return (
                <li key={key} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${e.failed ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                    {e.kind === "documents" ? "Tài liệu" : "Dự án"} · {e.failed ? "Lỗi" : "Cảnh báo"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-heading">{e.title}</p>
                    {e.error && <p className="line-clamp-2 text-xs text-body" title={e.error}>{e.error}</p>}
                  </div>
                  <button onClick={() => onViewChunks(e.kind, e.id, e.title)} className="rounded-lg px-3 py-1.5 text-sm text-body hover:bg-primary-50 hover:text-primary-700">
                    Xem nội dung
                  </button>
                  {canManage && (
                    <button
                      onClick={() => onReindex(e.kind, e.id, e.title)}
                      disabled={busyKey === key}
                      className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-heading hover:bg-primary-50 disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={busyKey === key ? "animate-spin" : ""} /> Index lại
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
