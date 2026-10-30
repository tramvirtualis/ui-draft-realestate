import { BadgeCheck, CalendarCheck, Copy, Eye, Send, type LucideIcon } from "lucide-react";
import { countByStatus, getUpcomingInterviews } from "./applicationHistoryUtils";
import type { Application } from "../../types/applicationHistory.types";

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: number;
  note: string;
  icon: LucideIcon;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs text-body">{label}</p>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconClass}`}>
          <Icon size={14} aria-hidden />
        </span>
      </div>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-heading">{value}</span>
        <span className="text-[11px] text-gray-400">{note}</span>
      </p>
    </div>
  );
}

/** 5 ô số liệu tổng quan, tính từ danh sách hồ sơ */
export default function ApplicationStats({ items }: { items: Application[] }) {
  const c = countByStatus(items);
  const upcoming = getUpcomingInterviews(items).length;
  const reviewedPercent = c.ALL ? Math.round(((c.ALL - c.PENDING - c.WITHDRAWN) / c.ALL) * 100) : 0;

  return (
    <section aria-label="Thống kê hồ sơ" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <StatCard label="Tổng hồ sơ" value={c.ALL} note="Tất cả thời gian" icon={Copy} iconClass="bg-primary-50 text-primary-600" />
      <StatCard label="Chờ duyệt" value={c.PENDING} note="Đang chờ phản hồi" icon={Send} iconClass="bg-blue-50 text-blue-600" />
      <StatCard label="Đang xem xét" value={c.REVIEWING} note={`${reviewedPercent}% đã được xem`} icon={Eye} iconClass="bg-primary-50 text-primary-600" />
      <StatCard label="Phỏng vấn" value={c.INTERVIEW_SCHEDULED + c.INTERVIEWED} note={`${upcoming} lịch sắp tới`} icon={CalendarCheck} iconClass="bg-green-50 text-green-600" />
      <StatCard label="Trúng tuyển" value={c.ACCEPTED} note={c.REJECTED ? `${c.REJECTED} không phù hợp` : "Chúc mừng bạn"} icon={BadgeCheck} iconClass="bg-emerald-50 text-emerald-600" />
    </section>
  );
}
