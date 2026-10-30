import { Building2, Tag, Clock, CircleCheck } from "lucide-react";
import type { Property } from "../../../../types/project/property.types";

const CARDS = [
  { key: "total", label: "Tổng số căn", icon: Building2, tone: "bg-accent/10 text-accent" },
  { key: "available", label: "Đang mở bán", icon: Tag, tone: "bg-success/10 text-success" },
  { key: "holding", label: "Đã giữ chỗ", icon: Clock, tone: "bg-warning/10 text-warning" },
  { key: "sold", label: "Đã bán", icon: CircleCheck, tone: "bg-primary-100 text-primary-700" },
] as const;

// Số liệu tính trực tiếp từ danh sách căn đang xem (theo dự án/phân khu đã chọn)
export default function PropertyStats({ items }: { items: Property[] }) {
  const value = (key: (typeof CARDS)[number]["key"]) => (key === "total" ? items.length : items.filter((p) => p.status === key).length);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, tone }) => (
        <div key={key} className="flex items-center gap-4 rounded-xl border border-line bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
            <Icon size={22} />
          </span>
          <div>
            <p className="text-2xl font-bold leading-none text-footer">{value(key).toLocaleString("vi-VN")}</p>
            <p className="mt-1.5 text-sm text-body">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
