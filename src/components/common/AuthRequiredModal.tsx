import { useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, ShieldCheck, Sparkles, X } from "lucide-react";
import useFocusTrap from "./useFocusTrap";

type Props = {
  title?: string;
  message?: string;
  /** Đường dẫn quay lại sau khi đăng nhập xong; mặc định là trang hiện tại */
  redirect?: string;
  /** Có truyền thì hiện nút đóng (X) và nút "Để sau" sẽ gọi hàm này thay vì lùi lịch sử */
  onClose?: () => void;
};

/**
 * Modal yêu cầu đăng nhập, dùng chung cho mọi nơi chặn người chưa đăng nhập
 * (ProtectedRoute, nút thích/lưu tin, đặt booking...).
 */
export default function AuthRequiredModal({
  title = "Bạn cần đăng nhập",
  message = "Nội dung này chỉ dành cho thành viên Đất Việt Group. Đăng nhập để tiếp tục xem và sử dụng đầy đủ tiện ích.",
  redirect,
  onClose,
}: Props) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  const dismiss = onClose ?? (() => navigate("/", { replace: true }));
  useFocusTrap(ref, true, dismiss);

  const loginTo = `/login?redirect=${encodeURIComponent(redirect ?? pathname + search)}`;

  // Portal thẳng ra document.body: tránh bị kẹt containing-block khi ancestor
  // (ví dụ div animate-page-in ở UserLayout) có transform, khiến "fixed" bị
  // định vị theo ancestor đó thay vì theo viewport.
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-footer/60 p-4 backdrop-blur-sm">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-required-title"
        tabIndex={-1}
        className="animate-page-in relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-primary-700/30 ring-1 ring-primary-100 outline-none"
      >
        {/* Dải gradient trang trí phía trên + icon ổ khóa */}
        <div className="relative h-32 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500">
          {/* overflow-hidden riêng cho phần trang trí, không cắt icon ổ khóa tràn xuống dưới */}
          <div className="absolute inset-0 overflow-hidden">
            <span className="animate-float-y absolute -left-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-xl" />
            <span className="animate-float-y absolute -bottom-12 right-4 h-28 w-28 rounded-full bg-primary-300/40 blur-xl" />
            <Sparkles
              size={18}
              className="absolute right-12 top-7 text-white/50"
              strokeWidth={2.5}
            />
            <Sparkles
              size={12}
              className="absolute left-14 bottom-8 text-white/40"
              strokeWidth={2.5}
            />
          </div>

          {onClose && (
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            >
              <X size={16} />
            </button>
          )}

          <span className="absolute -bottom-9 left-1/2 flex h-[72px] w-[72px] -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg shadow-primary-700/30">
            <Lock size={26} className="text-white" strokeWidth={2.2} />
          </span>
        </div>

        <div className="px-7 pb-7 pt-12 text-center">
          <h2
            id="auth-required-title"
            className="text-xl font-bold tracking-tight text-heading"
          >
            {title}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-body">
            {message}
          </p>

          <div className="mt-5 flex items-center justify-center gap-1.5 rounded-xl bg-primary-50 px-3 py-2 text-[11px] font-medium text-primary-700">
            <ShieldCheck size={14} />
            Thông tin của bạn được bảo mật tuyệt đối
          </div>

          <Link
            to={loginTo}
            className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition-all hover:opacity-95 hover:shadow-xl"
          >
            Đăng nhập ngay
            <ArrowRight
              size={17}
              strokeWidth={2.5}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>

          <button
            onClick={dismiss}
            className="mt-2.5 w-full rounded-full border border-line px-6 py-3 text-sm font-semibold text-heading transition-colors hover:bg-primary-50 hover:text-primary-700"
          >
            Để sau
          </button>

          <p className="mt-5 text-xs text-body">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
            >
              Đăng ký miễn phí
            </Link>
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
