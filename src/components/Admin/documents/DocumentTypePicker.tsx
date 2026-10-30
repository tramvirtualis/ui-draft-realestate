import { FileUp, PenLine, type LucideIcon } from "lucide-react";
import type { DocumentType } from "../../../types/document.types";

type Props = {
  value: DocumentType;
  onChange: (type: DocumentType) => void;
  disabled?: boolean;
};

const OPTIONS: { value: DocumentType; icon: LucideIcon; title: string; desc: string }[] = [
  { value: "FILE", icon: FileUp, title: "Tải lên file", desc: "PDF hoặc Word (.docx), người dùng xem trực tuyến hoặc tải về." },
  { value: "ARTICLE", icon: PenLine, title: "Soạn bài viết", desc: "Viết trực tiếp bằng trình soạn thảo, chèn ảnh và link (vd Google Drive)." },
];

// Chọn loại tài liệu: upload file hay soạn bài viết
export default function DocumentTypePicker({ value, onChange, disabled }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Loại tài liệu">
      {OPTIONS.map((o) => {
        const active = value === o.value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={`flex gap-3 rounded-2xl border p-4 text-left transition disabled:opacity-60 ${
              active ? "border-primary-400 bg-primary-50 ring-2 ring-primary-100" : "border-line bg-white hover:border-primary-200"
            }`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? "bg-primary-600 text-white" : "bg-primary-50 text-primary-600"}`}>
              <Icon size={18} />
            </span>
            <span>
              <span className={`block text-sm font-semibold ${active ? "text-primary-700" : "text-heading"}`}>{o.title}</span>
              <span className="mt-0.5 block text-xs text-body">{o.desc}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
