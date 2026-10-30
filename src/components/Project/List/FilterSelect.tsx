import { useId } from "react";
import { ChevronDown } from "lucide-react";

type FilterSelectProps = {
  label: string;
  value: string;
  /** Nhãn của lựa chọn rỗng (không lọc), ví dụ "Tất cả chủ đầu tư" */
  placeholder: string;
  options: readonly string[];
  onChange: (value: string) => void;
};

// Ô chọn bộ lọc: nhãn nhỏ viết hoa phía trên, select gốc của trình duyệt bọc trong viên kính; đang lọc thì viền tím đậm
export default function FilterSelect({ label, value, placeholder, options, onChange }: FilterSelectProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-12 w-full appearance-none truncate rounded-2xl border bg-white/70 pl-4 pr-10 text-sm backdrop-blur transition focus:outline-none focus:ring-4 focus:ring-primary-100 ${
            value ? "border-primary-400 font-semibold text-heading" : "border-white/80 text-body hover:border-primary-200"
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary-500" />
      </div>
    </div>
  );
}
