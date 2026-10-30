import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link2 } from "lucide-react";
import useFocusTrap from "./useFocusTrap";

type Props = {
  initialUrl: string; // đang đặt trên một liên kết thì có sẵn địa chỉ cũ
  onApply: (url: string) => void;
  onRemove: () => void; // gỡ liên kết hiện có
  onClose: () => void;
};

// Thêm https:// nếu người dùng chỉ gõ "example.com"; giữ nguyên mailto:, tel:, đường dẫn nội bộ
const normalize = (raw: string) => {
  const url = raw.trim();
  return /^([a-z][a-z0-9+.-]*:|\/|#)/i.test(url) ? url : `https://${url}`;
};

// Hộp nhập liên kết cho trình soạn thảo (thay cho window.prompt)
export default function LinkDialog({ initialUrl, onApply, onRemove, onClose }: Props) {
  const root = useRef<HTMLFormElement>(null);
  const [url, setUrl] = useState(initialUrl);
  useFocusTrap(root, true, onClose);

  const editing = initialUrl !== "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hộp này nằm trong form của trang (qua portal) nên sự kiện submit sẽ nổi bọt lên form ngoài và lưu luôn cả trang
    e.stopPropagation();
    if (url.trim()) onApply(normalize(url));
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-footer/40 px-4 backdrop-blur-sm" onClick={onClose}>
      <form
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-labelledby="link-dialog-title"
        tabIndex={-1}
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="animate-page-in w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="p-6">
          <h2 id="link-dialog-title" className="flex items-center gap-2 text-xl font-bold text-footer">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Link2 size={18} />
            </span>
            {editing ? "Sửa liên kết" : "Chèn liên kết"}
          </h2>
          <label className="mt-4 block text-sm font-semibold text-footer">
            Đường dẫn
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              inputMode="url"
              className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-4 text-sm font-normal text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
            />
          </label>
          <p className="mt-2 text-xs text-muted">Chọn đoạn chữ trước để gắn liên kết vào chữ đó; không chọn thì chèn chính đường dẫn.</p>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
          {editing ? (
            <button type="button" onClick={onRemove} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/10">
              Gỡ liên kết
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50">
              Hủy
            </button>
            <button
              disabled={!url.trim()}
              className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-50"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </form>
    </div>,
    document.body,
  );
}
