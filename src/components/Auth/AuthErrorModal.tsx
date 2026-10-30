import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

type Props = {
  open: boolean;
  message: string;
  title?: string;
  onClose: () => void;
};

// Modal báo lỗi đăng nhập (vd: đăng nhập Google thất bại)
export default function AuthErrorModal({
  open,
  message,
  title = "Đăng nhập không thành công",
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/70 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="auth-error-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[400px] rounded-2xl bg-white p-6 text-center shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-4 top-4 rounded-full p-1 text-body transition hover:bg-primary-50 hover:text-heading"
        >
          <X size={18} />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-danger/15 text-danger">
            <AlertTriangle size={24} />
          </span>
        </div>

        <h2
          id="auth-error-title"
          className="mt-5 text-xl font-bold tracking-tight text-navy"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-body">{message}</p>

        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="mt-6 h-11 w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-sm font-bold text-white transition hover:opacity-90"
        >
          Đã hiểu
        </button>
      </div>
    </div>,
    document.body
  );
}
