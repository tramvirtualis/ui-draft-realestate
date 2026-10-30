import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

// Khung thông báo của một mục quản lý: mục đang được xây dựng, hoặc không áp dụng cho loại hình của dự án
export default function SectionNotice({ icon: Icon, title, desc }: Props) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm" aria-hidden>
        <Icon size={22} />
      </span>
      <p className="mt-4 font-semibold text-heading">{title}</p>
      <p className="mt-1 max-w-md text-sm text-body">{desc}</p>
    </div>
  );
}
