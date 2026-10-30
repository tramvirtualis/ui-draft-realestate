import { useRef } from "react";
import { createPortal } from "react-dom";
import useFocusTrap from "../common/useFocusTrap";

type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

// Hộp thoại xác nhận hành động nguy hiểm (xóa)
export default function ConfirmDialog({ title, message, confirmLabel = "Xóa", busy = false, onConfirm, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null);
  useFocusTrap(root, true, onClose);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/50 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={root}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="animate-page-in w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="p-6">
          <h2 id="confirm-title" className="heading-display text-lg text-heading">{title}</h2>
          <p id="confirm-desc" className="mt-3 text-sm leading-relaxed text-body">{message}</p>
        </div>
        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button onClick={onClose} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-heading transition hover:bg-primary-50">Hủy</button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="rounded-full bg-danger px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-60"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
