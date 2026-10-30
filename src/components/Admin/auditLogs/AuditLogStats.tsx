import { Activity, CheckCircle2, XCircle, Clock } from "lucide-react";

interface AuditLogStatsProps {
  total: number;
  success: number;
  error: number;
  slow: number;
}

export default function AuditLogStats({ total, success, error, slow }: AuditLogStatsProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted">Tổng thao tác</span>
          <Activity size={18} className="text-primary-500" />
        </div>
        <p className="mt-2 text-2xl font-bold text-footer">{total}</p>
      </div>

      <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted">Thành công</span>
          <CheckCircle2 size={18} className="text-emerald-500" />
        </div>
        <p className="mt-2 text-2xl font-bold text-emerald-600">{success}</p>
      </div>

      <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted">Lỗi (4xx/5xx)</span>
          <XCircle size={18} className="text-rose-500" />
        </div>
        <p className="mt-2 text-2xl font-bold text-rose-600">{error}</p>
      </div>

      <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted">Chạy chậm (≥1s)</span>
          <Clock size={18} className="text-amber-500" />
        </div>
        <p className="mt-2 text-2xl font-bold text-amber-600">{slow}</p>
      </div>
    </div>
  );
}
