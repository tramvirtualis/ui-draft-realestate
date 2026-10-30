import { createPortal } from "react-dom";
import { Home } from "lucide-react";

type Props = {
  open: boolean;
  message?: string;
};

// Lớp phủ toàn màn hình kèm vòng loading khi đang gọi API (chặn thao tác trùng)
export default function LoadingOverlay({ open, message = "Đang xử lý" }: Props) {
  if (!open) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="animate-loading-fade fixed inset-0 z-[110] flex items-center justify-center bg-ink-900/55 px-4 backdrop-blur-[3px]"
    >
      <div className="flex flex-col items-center gap-5 rounded-3xl bg-white/95 px-10 py-8 shadow-2xl shadow-primary-700/30">
        <div className="relative h-20 w-20">
          {/* Quầng sáng nhịp thở phía sau */}
          <span className="animate-loading-pulse absolute inset-0 rounded-full bg-primary-300/60" />
          {/* Vòng gradient xoay */}
          <span className="loading-ring animate-loading-spin absolute inset-0 rounded-full" />
          {/* Vòng chấm xoay ngược */}
          <span className="animate-loading-spin-reverse absolute inset-2 rounded-full border-2 border-dashed border-primary-200" />
          {/* Ngôi nhà nảy nhẹ ở giữa */}
          <span className="absolute inset-4 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-600/40">
            <Home size={22} strokeWidth={2.4} className="animate-loading-bounce" />
          </span>
        </div>

        <p className="flex items-end gap-0.5 text-sm font-semibold text-heading">
          {message}
          <span className="loading-dot">.</span>
          <span className="loading-dot [animation-delay:0.2s]">.</span>
          <span className="loading-dot [animation-delay:0.4s]">.</span>
        </p>
      </div>
    </div>,
    document.body
  );
}
