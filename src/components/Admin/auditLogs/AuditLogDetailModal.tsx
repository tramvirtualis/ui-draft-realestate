import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Copy, Check } from "lucide-react";
import AdminModal from "../AdminModal";
import type { AuditLogItem } from "../../../types/admin/auditLog.types";
import {
  getMethodBadge,
  getModuleBadge,
  formatIp,
  formatUser,
  resolveBusinessInfo,
} from "./auditLogUtils";

interface AuditLogDetailModalProps {
  item: AuditLogItem | null;
  currentUserEmail?: string;
  projectMap: Record<string, string>;
  onClose: () => void;
}

export default function AuditLogDetailModal({
  item,
  currentUserEmail,
  projectMap,
  onClose,
}: AuditLogDetailModalProps) {
  const [copiedTraceId, setCopiedTraceId] = useState(false);

  if (!item) return null;

  const handleCopyTraceId = (traceId: string) => {
    navigator.clipboard.writeText(traceId);
    setCopiedTraceId(true);
    setTimeout(() => setCopiedTraceId(false), 2000);
  };

  const info = resolveBusinessInfo(item, projectMap);

  const renderStatusBadge = (status?: number) => {
    if (!status) return <span className="text-gray-400">---</span>;
    if (status >= 200 && status < 300) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 size={12} />
          {status} OK
        </span>
      );
    }
    if (status >= 400 && status < 500) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          <AlertTriangle size={12} />
          {status} Client Error
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
        <XCircle size={12} />
        {status} Server Error
      </span>
    );
  };

  return (
    <AdminModal title="Chi tiết nhật ký hoạt động" onClose={onClose}>
      <div className="space-y-5 px-6 py-5 text-xs text-body">
        {/* 1. KHU VỰC THÔNG TIN NGHIỆP VỤ (MỨC 2 - SẾP XEM) */}
        <div className="rounded-xl border border-line bg-slate-50/60 p-4">
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <div className="flex items-center gap-2">
              <span
                className={`rounded border px-2 py-0.5 font-mono font-bold ${getMethodBadge(
                  item.method
                )}`}
              >
                {item.method}
              </span>
              <span className="text-sm font-bold text-heading">{info.actionTitle}</span>
            </div>
            <div>
              {item.success !== undefined && item.success !== null ? (
                item.success ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/70 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 size={12} /> Thành công
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100/70 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                    <XCircle size={12} /> Thất bại ({item.status})
                  </span>
                )
              ) : (
                renderStatusBadge(item.status)
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[11px] text-muted">Tên đối tượng:</p>
              <p className="font-semibold text-heading">{info.targetName || "---"}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">Mã ID đối tượng:</p>
              <p className="font-mono font-semibold text-primary-600">{info.targetId || "---"}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">Hành vi nghiệp vụ:</p>
              <p className="font-medium text-heading">{info.actionTitle}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">Phân hệ:</p>
              <span
                className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getModuleBadge(
                  item.module
                )}`}
              >
                {item.module || "SYSTEM"}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] text-muted">Diễn giải hoạt động:</p>
              <p className="font-medium text-footer">{info.description || "---"}</p>
            </div>
          </div>
        </div>

        {/* 2. KHU VỰC THÔNG SỐ KỸ THUẬT (MỨC 1 - DEV XEM) */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Thông số kỹ thuật & Vết hệ thống (Dev / IT)
          </p>
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-line bg-white p-4">
            <div>
              <p className="text-[11px] text-muted">Thời gian thực hiện:</p>
              <p className="font-mono font-medium text-heading">{item.timestamp}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">Thời gian phản hồi:</p>
              <p className="font-mono font-medium text-heading">
                {item.durationMs !== undefined && item.durationMs !== null ? (
                  <span className={item.durationMs >= 1000 ? "font-bold text-amber-600" : "text-heading"}>
                    {item.durationMs} ms {item.durationMs >= 1000 ? "(Chạy chậm ≥1s)" : ""}
                  </span>
                ) : (
                  "---"
                )}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted">Người thực hiện (Email):</p>
              <p className="font-medium text-heading">{formatUser(item.userEmail, currentUserEmail)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">Địa chỉ IP:</p>
              <p className="font-mono font-medium text-heading">{formatIp(item.clientIp) || "---"}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">HTTP Status Code:</p>
              <div className="mt-0.5">{renderStatusBadge(item.status)}</div>
            </div>
            <div>
              <p className="text-[11px] text-muted">Tag hệ thống:</p>
              <p className="font-mono text-xs font-semibold text-footer">{item.tag || "ADMIN AUDIT"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] text-muted">Đường dẫn API (URI):</p>
              <p className="break-all font-mono text-xs font-medium text-footer">{item.uri || "---"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] text-muted">Trace ID:</p>
              <div className="mt-1 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 ring-1 ring-line">
                <span className="font-mono text-xs text-footer">{item.traceId || "---"}</span>
                {item.traceId && (
                  <button
                    onClick={() => handleCopyTraceId(item.traceId)}
                    className="ml-2 text-muted hover:text-footer"
                    title="Sao chép Trace ID"
                  >
                    {copiedTraceId ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Thông điệp thô (Raw log) */}
        <div className="pt-1">
          <p className="mb-1 text-[11px] font-semibold text-muted">Nội dung thô từ Loki:</p>
          <pre className="max-h-40 overflow-x-auto whitespace-pre-wrap rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-emerald-400">
            {item.rawMessage}
          </pre>
        </div>
      </div>
    </AdminModal>
  );
}
