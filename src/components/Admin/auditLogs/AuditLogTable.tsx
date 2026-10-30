import { Eye, RotateCcw, Shield, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { AuditLogItem } from "../../../types/admin/auditLog.types";
import {
  getMethodBadge,
  getModuleBadge,
  formatIp,
  formatUser,
  resolveBusinessInfo,
} from "./auditLogUtils";

interface AuditLogTableProps {
  items: AuditLogItem[];
  loading: boolean;
  currentUserEmail?: string;
  projectMap: Record<string, string>;
  onViewDetail: (item: AuditLogItem) => void;
}

const TH = "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted";

export default function AuditLogTable({
  items,
  loading,
  currentUserEmail,
  projectMap,
  onViewDetail,
}: AuditLogTableProps) {
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
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-line bg-slate-50/75">
              <th className={TH}>Thời gian</th>
              <th className={TH}>Người thực hiện</th>
              <th className={TH}>Phân hệ</th>
              <th className={TH}>Hoạt động & Đối tượng</th>
              <th className={TH}>Kết quả</th>
              <th className={TH}>Thời gian chạy</th>
              <th className={`${TH} text-center`}>Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted">
                  <div className="inline-flex items-center gap-2">
                    <RotateCcw size={16} className="animate-spin text-primary-500" />
                    <span>Đang tải nhật ký từ máy chủ...</span>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-muted">
                  <Shield size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-body">Không tìm thấy bản ghi nhật ký nào</p>
                  <p className="mt-1 text-xs text-muted">
                    Thử thay đổi bộ lọc thời gian hoặc từ khóa tìm kiếm
                  </p>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const info = resolveBusinessInfo(item, projectMap);
                return (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50/75">
                    {/* Thời gian */}
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] text-body">
                      {item.timestamp}
                    </td>

                    {/* Người thực hiện */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-medium text-heading">
                          {formatUser(item.userEmail, currentUserEmail)}
                        </span>
                        {item.clientIp && (
                          <span className="font-mono text-[10px] text-muted">
                            IP: {formatIp(item.clientIp)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Phân hệ */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getModuleBadge(
                          item.module
                        )}`}
                      >
                        {item.module || "SYSTEM"}
                      </span>
                    </td>

                    {/* Hoạt động & Đối tượng (Mức 2) */}
                    <td className="px-4 py-3.5">
                      <div className="flex max-w-[320px] flex-col gap-1 lg:max-w-[420px]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-block rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold ${getMethodBadge(
                              item.method
                            )}`}
                          >
                            {item.method || "ACTION"}
                          </span>
                          <span
                            className="truncate font-semibold text-heading"
                            title={info.actionTitle}
                          >
                            {info.actionTitle}
                          </span>
                          {info.targetName && (
                            <span
                              className="inline-block max-w-[180px] truncate rounded border border-primary-200 bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700"
                              title={info.targetName}
                            >
                              {info.targetName}
                            </span>
                          )}
                        </div>
                        <span
                          className="truncate font-mono text-[10px] text-muted"
                          title={item.uri}
                        >
                          {item.uri}
                        </span>
                      </div>
                    </td>

                    {/* Kết quả */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {item.success !== undefined && item.success !== null ? (
                        item.success ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            <CheckCircle2 size={12} /> Thành công
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                            <XCircle size={12} /> Thất bại ({item.status})
                          </span>
                        )
                      ) : (
                        renderStatusBadge(item.status)
                      )}
                    </td>

                    {/* Thời gian chạy */}
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-body">
                      {item.durationMs !== undefined && item.durationMs !== null ? (
                        <span
                          className={
                            item.durationMs >= 1000
                              ? "font-semibold text-amber-600"
                              : "text-body"
                          }
                        >
                          {item.durationMs} ms
                        </span>
                      ) : (
                        "---"
                      )}
                    </td>

                    {/* Chi tiết */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-center">
                      <button
                        onClick={() => onViewDetail(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-body shadow-sm hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
                        title="Xem chi tiết kỹ thuật & nghiệp vụ"
                      >
                        <Eye size={13} />
                        <span>Xem</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
