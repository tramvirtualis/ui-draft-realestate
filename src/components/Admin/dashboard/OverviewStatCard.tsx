import { Link } from "react-router-dom";
import { ArrowRight, type LucideIcon } from "lucide-react";

const nf = new Intl.NumberFormat("vi-VN");

type Props = {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClass: string; // màu nền + màu biểu tượng, vd "bg-primary-100 text-primary-600"
  // Dòng phụ dưới số lớn, vd "12 đang hoạt động"
  detail: string;
  // Số tạo mới trong 30 ngày; không truyền thì ẩn
  recent?: number;
  to: string;
};

// Thẻ số liệu lớn trên trang Tổng quan: tên, số tổng, dòng phụ, số mới 30 ngày, link sang trang quản lý
export default function OverviewStatCard({ label, value, icon: Icon, iconClass, detail, recent, to }: Props) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary-600"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-body">{label}</p>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-4xl font-bold tabular-nums text-footer">{nf.format(value)}</p>
      <p className="mt-1 text-sm text-heading">{detail}</p>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3 text-xs">
        {recent !== undefined ? (
          <span className={recent > 0 ? "font-semibold text-success" : "text-muted"}>
            {recent > 0 ? `+${nf.format(recent)}` : "Không có"} mới trong 30 ngày
          </span>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-1 font-semibold text-primary-600">
          Quản lý <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
