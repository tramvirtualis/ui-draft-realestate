import { ArrowRight, Check } from "lucide-react";
import { BUILDING_TYPE_OPTIONS } from "./buildingType";

type Props = {
  onPick: (buildingType: string) => void;
  onCancel: () => void;
};

// Bước 1 khi tạo dự án: chọn loại hình xây dựng (không đổi được sau khi tạo), rồi mới sang form thông tin
export default function BuildingTypePicker({ onPick, onCancel }: Props) {
  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <div className="border-b border-line p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Bước 1 / 2</p>
        <h2 className="mt-1 text-xl font-bold text-footer">Chọn loại hình xây dựng</h2>
        <p className="mt-1 text-sm text-body">Loại hình quyết định các mục quản lý của dự án và không thể đổi sau khi tạo.</p>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-2">
        {BUILDING_TYPE_OPTIONS.map(({ value, icon: Icon, desc, features }) => (
          <button
            key={value}
            type="button"
            onClick={() => onPick(value)}
            className="group flex flex-col rounded-2xl border-2 border-line p-6 text-left transition hover:border-primary-500 hover:bg-primary-50/40 hover:shadow-lg hover:shadow-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white" aria-hidden>
              <Icon size={24} />
            </span>
            <span className="mt-4 text-lg font-bold text-footer">{value}</span>
            <span className="mt-0.5 text-sm text-body">{desc}</span>
            <ul className="mt-4 space-y-2">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-heading">
                  <Check size={15} className="shrink-0 text-success" aria-hidden /> {f}
                </li>
              ))}
            </ul>
            <span className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-primary-600">
              Chọn {value.toLowerCase()} <ArrowRight size={15} className="transition group-hover:translate-x-1" aria-hidden />
            </span>
          </button>
        ))}
      </div>

      <div className="flex justify-end border-t border-line px-6 py-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50">Hủy</button>
      </div>
    </section>
  );
}
