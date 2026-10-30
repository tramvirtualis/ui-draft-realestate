import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertCircle, Bell, CheckCircle2, X } from "lucide-react";
import { ToastContext, type ToastKind } from "./toastContext";

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
  duration: number;
  leaving: boolean;
}

const KIND_STYLE: Record<ToastKind, { title: string; icon: typeof Bell; iconClass: string; ring: string }> = {
  success: { title: "Thành công", icon: CheckCircle2, iconClass: "bg-success/10 text-success", ring: "var(--color-success)" },
  error: { title: "Có lỗi xảy ra", icon: AlertCircle, iconClass: "bg-danger/10 text-danger", ring: "var(--color-danger)" },
  notification: { title: "Thông báo mới", icon: Bell, iconClass: "bg-primary-100 text-primary-600", ring: "var(--color-primary-500)" },
};

/** Bọc quanh phần trang cần thông báo; dùng `useToast().show(...)` ở component con */
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  // Bật hiệu ứng trượt ra; xoá hẳn khi hiệu ứng chạy xong (onAnimationEnd của thẻ)
  const dismiss = useCallback(
    (id: number) => setItems((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))),
    [],
  );
  const remove = useCallback((id: number) => setItems((prev) => prev.filter((t) => t.id !== id)), []);

  const show = useCallback((message: string, kind: ToastKind = "success", duration?: number) => {
    const id = nextId.current++;
    // Thông báo realtime hiện lâu hơn (8s) để người dùng kịp đọc
    const ms = duration ?? (kind === "notification" ? 8000 : 3000);
    setItems((prev) => [...prev, { id, message, kind, duration: ms, leaving: false }]);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* z-[130]: nằm trên modal (z-100) và lớp loading (z-110) */}
      <div
        className="pointer-events-none fixed inset-x-4 top-4 z-[130] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-5 sm:top-5"
        role="status"
        aria-live="polite"
      >
        {items.map((t) => {
          const style = KIND_STYLE[t.kind];
          const Icon = style.icon;
          return (
            <div
              key={t.id}
              onAnimationEnd={(e) => {
                if (e.target === e.currentTarget && t.leaving) remove(t.id);
              }}
              className={`group pointer-events-auto relative flex w-full items-start gap-3 rounded-2xl bg-white p-4 pr-11 shadow-xl shadow-heading/15 sm:w-[380px] ${
                t.leaving ? "animate-toast-out" : "animate-toast-in"
              }`}
            >
              {/* Viền đếm ngược: chạy hết vòng thì tự đóng; rê chuột vào để tạm dừng */}
              <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
                <rect width="100%" height="100%" rx="16" fill="none" stroke={style.ring} strokeOpacity="0.15" strokeWidth="2.5" />
                <rect
                  width="100%"
                  height="100%"
                  rx="16"
                  fill="none"
                  stroke={style.ring}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray="100"
                  className="toast-countdown group-hover:[animation-play-state:paused]"
                  style={{ animationDuration: `${t.duration}ms` }}
                  onAnimationEnd={(e) => {
                    e.stopPropagation();
                    dismiss(t.id);
                  }}
                />
              </svg>

              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.iconClass}`}>
                <Icon size={18} aria-hidden />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-heading">{style.title}</p>
                <p className="mt-0.5 break-words text-sm text-body">{t.message}</p>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Đóng thông báo"
                className="absolute right-3 top-3 rounded-full p-1.5 text-muted transition hover:bg-page hover:text-heading"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
