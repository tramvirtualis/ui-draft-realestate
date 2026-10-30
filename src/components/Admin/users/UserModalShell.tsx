import { useRef, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, type LucideIcon } from "lucide-react";
import useFocusTrap from "../../common/useFocusTrap";

type Props = {
  title: string;
  desc: string;
  icon: LucideIcon;
  tone?: "primary" | "danger";
  maxWidth?: string;
  onClose: () => void;
  onSubmit: () => void;
  footer: ReactNode;
  children: ReactNode;
};

// Khung dùng chung cho các hộp thoại người dùng: tiêu đề kèm biểu tượng, nội dung, chân nút hành động
export default function UserModalShell({ title, desc, icon: Icon, tone = "primary", maxWidth = "max-w-xl", onClose, onSubmit, footer, children }: Props) {
  const root = useRef<HTMLFormElement>(null);
  useFocusTrap(root, true, onClose);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-footer/40 px-4 backdrop-blur-sm" onClick={onClose}>
      <form
        ref={root}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className={`animate-page-in flex max-h-[92vh] w-full ${maxWidth} flex-col rounded-2xl bg-white shadow-2xl`}
      >
        <div className="flex items-start gap-4 border-b border-line px-6 py-5">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone === "danger" ? "bg-danger/10 text-danger" : "bg-primary-100 text-primary-600"}`}>
            <Icon size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-footer">{title}</h2>
            <p className="mt-1 text-sm text-body">{desc}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-full p-2 text-body transition hover:bg-primary-50">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">{footer}</div>
      </form>
    </div>,
    document.body,
  );
}
