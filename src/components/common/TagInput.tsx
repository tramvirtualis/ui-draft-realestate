import { useState } from "react";
import { X } from "lucide-react";

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxLength?: number;
  label: string; // đọc cho trình đọc màn hình, vd "ngân hàng"
};

const norm = (s: string) => s.trim().toLowerCase();

/**
 Ô nhập dạng thẻ: gõ rồi nhấn Enter (hoặc dấu phẩy) để thêm, trùng tên thì bỏ qua (không phân biệt hoa thường);
 bấm × để bỏ thẻ, Backspace khi ô trống thì bỏ thẻ cuối.
 */
export default function TagInput({ value, onChange, placeholder, maxTags = 30, maxLength = 100, label }: Props) {
  const [draft, setDraft] = useState("");
  const full = value.length >= maxTags;

  const add = () => {
    const tag = draft.trim();
    if (!tag || full) return;
    if (!value.some((t) => norm(t) === norm(tag))) onChange([...value, tag]);
    setDraft("");
  };

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 transition focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-100">
      {value.map((tag) => (
        <span key={tag} className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            aria-label={`Bỏ ${label} ${tag}`}
            className="text-primary-400 transition hover:text-danger"
          >
            <X size={13} />
          </button>
        </span>
      ))}
      {!full && (
        <input
          value={draft}
          maxLength={maxLength}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault(); // không gửi form
              add();
            } else if (e.key === "Backspace" && !draft && value.length > 0) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={add}
          placeholder={value.length === 0 ? placeholder : `Thêm ${label}...`}
          aria-label={`Thêm ${label}`}
          className="h-7 min-w-40 flex-1 bg-transparent text-sm text-heading outline-none"
        />
      )}
    </div>
  );
}
