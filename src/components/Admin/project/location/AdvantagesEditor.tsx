import { useRef } from "react";
import { Plus, X } from "lucide-react";

export const MAX_ADVANTAGES = 50; // khớp ProjectLocationRequest.advantages của BE

type Props = {
  value: string[];
  onChange: (rows: string[]) => void;
};

// Điểm thuận lợi: mỗi dòng một câu; Enter ở dòng cuối để thêm điểm mới
export default function AdvantagesEditor({ value, onChange }: Props) {
  const list = useRef<HTMLOListElement>(null);

  const add = () => {
    if (value.length >= MAX_ADVANTAGES) return;
    onChange([...value, ""]);
    // Đưa con trỏ vào dòng mới
    requestAnimationFrame(() => list.current?.querySelector<HTMLInputElement>("li:last-child input")?.focus());
  };

  return (
    <div>
      {value.length > 0 && (
        <ol ref={list} className="space-y-2">
          {value.map((text, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xs font-bold text-primary-700">
                {String(i + 1).padStart(2, "0")}
              </span>
              <input
                value={text}
                maxLength={500}
                onChange={(e) => onChange(value.map((row, k) => (k === i ? e.target.value : row)))}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault(); // không gửi form
                  if (i === value.length - 1) add();
                }}
                placeholder="Ví dụ: Liền kề trung tâm hành chính, 5 phút tới Quận 1"
                aria-label={`Điểm thuận lợi ${i + 1}`}
                className="h-10 min-w-0 flex-1 rounded-xl border border-line px-3 text-sm outline-none focus:border-primary-600"
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, k) => k !== i))}
                aria-label={`Xóa điểm thuận lợi ${i + 1}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line text-body transition hover:border-danger/30 hover:bg-danger/5 hover:text-danger"
              >
                <X size={15} />
              </button>
            </li>
          ))}
        </ol>
      )}
      {value.length < MAX_ADVANTAGES && (
        <button
          type="button"
          onClick={add}
          className={`${value.length > 0 ? "mt-2" : ""} inline-flex items-center gap-1.5 rounded-xl border border-dashed border-primary-300 bg-primary-50/40 px-4 py-2 text-xs font-semibold text-primary-700 transition hover:bg-primary-50`}
        >
          <Plus size={14} /> Thêm điểm thuận lợi
        </button>
      )}
    </div>
  );
}
