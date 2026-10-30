import { useState } from "react";
import { X } from "lucide-react";
import { useToast } from "../../common/toastContext";
import { getErrorMessage } from "../../../api";
import { adminNewsService, type AdminNewsCategory } from "../../../services/news/adminNewsService";

type Props = {
  categories: AdminNewsCategory[]; // tất cả chuyên mục đang có
  selectedIds: number[]; // chuyên mục của bài viết, phần tử đầu là chuyên mục chính
  disabled?: boolean;
  onCategoriesChange: (list: AdminNewsCategory[]) => void;
  onChange: (ids: number[]) => void;
};

const norm = (s: string) => s.trim().toLowerCase();

/**
 Chuyên mục của bài viết dạng thẻ, giống "Loại hình sản phẩm" của dự án:
 - Gõ tên rồi nhấn Enter để thêm; tên chưa có thì tạo chuyên mục mới.
 - Bấm × trên thẻ chỉ bỏ chuyên mục khỏi bài viết (không xóa chuyên mục).
 - Bấm vào chuyên mục có sẵn bên dưới để thêm nhanh.
 */
export default function CategoryChipInput({ categories, selectedIds, disabled, onCategoriesChange, onChange }: Props) {
  const toast = useToast();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const selected = selectedIds
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is AdminNewsCategory => !!c);
  const suggestions = categories.filter((c) => !selectedIds.includes(c.id));

  const add = (id: number) => {
    if (!selectedIds.includes(id)) onChange([...selectedIds, id]);
  };

  const addDraft = async () => {
    const name = draft.trim();
    if (!name || busy) return;
    const existing = categories.find((c) => norm(c.name) === norm(name));
    if (existing) {
      add(existing.id);
      setDraft("");
      return;
    }
    setBusy(true);
    try {
      const created = await adminNewsService.addCategory(name);
      onCategoriesChange([...categories, created]);
      onChange([...selectedIds, created.id]);
      setDraft("");
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {selected.map((c, i) => (
          <span key={c.id} className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700">
            {c.name}
            {i === 0 && selected.length > 1 && <span className="rounded bg-primary-100 px-1.5 text-[10px] font-semibold uppercase">Chính</span>}
            <button
              type="button"
              onClick={() => onChange(selectedIds.filter((id) => id !== c.id))}
              disabled={disabled}
              aria-label={`Bỏ chuyên mục ${c.name}`}
              className="text-primary-400 hover:text-danger"
            >
              <X size={13} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // không submit form khi nhấn Enter trong ô này
              void addDraft();
            }
          }}
          // rời ô nhập mà chưa nhấn Enter thì vẫn ghi nhận chuyên mục đang gõ
          onBlur={() => void addDraft()}
          disabled={disabled || busy}
          maxLength={500}
          placeholder="Nhập chuyên mục rồi nhấn Enter (ví dụ: Thị trường)"
          aria-label="Thêm chuyên mục"
          className="h-9 min-w-64 flex-1 rounded-full border border-line px-4 text-sm font-normal outline-none focus:border-primary-300"
        />
      </div>

      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-normal text-muted">Chuyên mục có sẵn:</span>
          {suggestions.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => add(c.id)}
              disabled={disabled}
              className="rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-heading transition hover:border-primary-300 hover:bg-primary-50"
            >
              + {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
