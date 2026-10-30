import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { AlertCircle, Ban, CircleCheck, Loader2, Lock, Phone, ShieldCheck, Timer, X } from "lucide-react";
import useFocusTrap from "../../common/useFocusTrap";
import AuthRequiredModal from "../../common/AuthRequiredModal";
import { getErrorMessage } from "../../../api";
import { getErrorStatus } from "../../../api/errors";
import { bookingService } from "../../../services/project/bookingService";
import profileService from "../../../services/user/profileService";
import { selectAuthStatus, selectCurrentUser, useAppSelector } from "../../../store";
import { PHONE_RULE } from "../../../types/admin/adminUser.types";
import { PROJECT_UNAVAILABLE } from "../../../utils/projectError";
import type { BookingDto, BookingRestriction } from "../../../types/booking.types";
import ContactCards from "./unitDetail/ContactCards";

export type BookingUnit = {
  code: string;
  image: string;
  statusLabel: string;
  location: string; // Phân khu A · Tầng 12
  spec: string; // Biệt thự · 270 m²
  direction: string;
  price: string;
};

type Props = {
  projectId: number | null; // dự án của căn: hiện liên hệ giám đốc / admin dự án
  propertyId: number;
  unit: BookingUnit;
  onClose: () => void;
  /** Giữ chỗ thành công: trang cha tải lại quỹ căn để căn chuyển "Đang giữ chỗ" */
  onBooked?: (booking: BookingDto) => void;
  /** Căn vừa bị người khác giữ / đang được giữ (409): trang cha tải lại quỹ căn để cập nhật trạng thái */
  onConflict?: () => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

// Thời gian còn lại (giây) tính theo hạn giữ chỗ do backend trả về
function useRemaining(until: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [until]);
  return until ? Math.max(0, Math.floor((new Date(until).getTime() - now) / 1000)) : 0;
}

// Thông điệp cho khách theo từng lỗi; lỗi nghiệp vụ (409) dùng câu tiếng Việt từ backend
function bookingError(err: unknown): string {
  const status = getErrorStatus(err);
  if (status === 404) return PROJECT_UNAVAILABLE;
  if (status === 0) return "Kết nối đang gián đoạn, quý khách vui lòng thử lại sau ít phút.";
  if (status >= 500) return "Hệ thống đang bận, quý khách vui lòng thử lại sau ít phút.";
  return getErrorMessage(err);
}

/**
 Giữ chỗ tạm một căn: khách xác nhận → backend khóa căn (Đang giữ chỗ) trong thời hạn,
 chuyên viên liên hệ xác nhận. Mọi kiểm tra (đăng nhập, dự án ẩn/ngừng nhận booking, căn đã giữ/đã bán,
 hai khách đặt cùng lúc) đều do backend quyết định; giao diện chỉ hiển thị kết quả.
 */
export default function BookingLockModal({ projectId, propertyId, unit, onClose, onBooked, onConflict }: Props) {
  const authStatus = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectCurrentUser);
  const root = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [needLogin, setNeedLogin] = useState(false);
  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [restriction, setRestriction] = useState<BookingRestriction | null>(null);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  // Backend báo thiếu số (428) dù store chưa biết, vd thông tin user chưa tải xong
  const [phoneRequired, setPhoneRequired] = useState(false);
  const remaining = useRemaining(booking?.holdExpiresAt ?? null);
  const blocked = restriction?.blocked ?? false;
  // Tài khoản chưa có số điện thoại: phải nhập số trước khi giữ chỗ để chuyên viên liên hệ
  const needPhone = !booking && (phoneRequired || (user !== null && !user.phone?.trim()));

  // Biết trước khách có đang bị khóa giữ chỗ không (backend vẫn chặn khi tạo booking)
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;
    bookingService
      .myRestriction()
      .then((r) => !cancelled && setRestriction(r))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  useFocusTrap(root, !needLogin && authStatus === "authenticated", onClose);

  if (authStatus !== "authenticated" || needLogin) {
    return (
      <AuthRequiredModal
        title="Đăng nhập để giữ chỗ"
        message="Vui lòng đăng nhập tài khoản Đất Việt Group để giữ chỗ căn này. Chuyên viên sẽ liên hệ xác nhận trong thời hạn giữ chỗ."
        onClose={onClose}
      />
    );
  }

  // Lưu số điện thoại vào hồ sơ (dùng API sửa hồ sơ sẵn có: kiểm tra định dạng + trùng số); trả false nếu lỗi
  const savePhone = async (): Promise<boolean> => {
    const value = phone.trim();
    if (!value) {
      setPhoneError("Vui lòng nhập số điện thoại");
      return false;
    }
    if (!PHONE_RULE.test(value)) {
      setPhoneError("Số điện thoại không hợp lệ");
      return false;
    }
    if (!user) {
      setPhoneError("Chưa tải được thông tin tài khoản, quý khách vui lòng tải lại trang");
      return false;
    }
    try {
      await profileService.updateProfile({ fullName: user.fullName, phone: value });
      setPhoneRequired(false);
      return true;
    } catch (e) {
      setPhoneError(getErrorMessage(e));
      return false;
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    setPhoneError("");
    try {
      if (needPhone && !(await savePhone())) return;
      const created = await bookingService.create(propertyId);
      setBooking(created);
      onBooked?.(created);
    } catch (e) {
      const status = getErrorStatus(e);
      if (status === 401) setNeedLogin(true);
      else if (status === 428) setPhoneRequired(true);
      else if (status === 403) setRestriction((r) => ({ ...(r ?? { consecutiveCancels: 0, limit: 5, blockedAt: null }), blocked: true }));
      else {
        setError(bookingError(e));
        if (status === 409) onConflict?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const holdUntil = booking?.holdExpiresAt ? new Date(booking.holdExpiresAt) : null;
  const totalSeconds = booking?.holdExpiresAt ? Math.max(1, (new Date(booking.holdExpiresAt).getTime() - new Date(booking.requestTime).getTime()) / 1000) : 1;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-ink-950/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose} role="presentation">
      <div
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="animate-page-in max-h-[94svh] w-full max-w-[680px] overflow-y-auto overscroll-contain rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-navy/10 px-6 py-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-success">
              <ShieldCheck size={12} aria-hidden /> Giữ chỗ an toàn
            </span>
            <h2 id="booking-title" className="mt-2 font-heading text-2xl font-semibold text-navy">
              {booking ? `Đã giữ chỗ căn ${unit.code}` : `Giữ chỗ căn ${unit.code}`}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-navy/10 text-navy transition hover:bg-primary-50">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-[240px_1fr]">
          <div>
            <img src={unit.image} alt={unit.code} className="h-40 w-full object-cover" />
            <div className="mt-3 rounded-2xl bg-primary-600 p-4 text-white">
              {booking ? (
                <>
                  <p className="flex items-center justify-between text-[11px] text-white/75">
                    {booking.status === "PENDING" ? "Thời gian giữ chỗ còn lại" : "Trạng thái"} <Timer size={14} aria-hidden />
                  </p>
                  <p className="mt-1 font-heading text-4xl tabular-nums">
                    {pad(Math.floor(remaining / 60))}:{pad(remaining % 60)}
                  </p>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/20">
                    <div className={`h-full rounded-full transition-all ${remaining <= 120 ? "bg-pop-500" : "bg-gold-300"}`} style={{ width: `${(remaining / totalSeconds) * 100}%` }} />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-gold-300">Giá niêm yết</p>
                  <p className="mt-1 font-heading text-3xl tabular-nums">{unit.price}</p>
                </>
              )}
            </div>

            {/* Thiếu số điện thoại: ô nhập gọn ở cột trái (chỗ trống dưới giá) để không đẩy dài cột phải */}
            {needPhone && !blocked && (
              <div className="mt-3 rounded-2xl border border-navy/10 bg-primary-50/30 p-3.5 text-sm">
                <label htmlFor="booking-phone" className="flex items-center gap-2 font-semibold text-navy">
                  <Phone size={15} aria-hidden /> Số điện thoại liên hệ
                </label>
                <p className="mt-1 text-xs leading-relaxed text-body">Để chuyên viên gọi xác nhận, số sẽ lưu vào hồ sơ.</p>
                <input
                  id="booking-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneError("");
                  }}
                  placeholder="0901234567"
                  aria-invalid={phoneError ? true : undefined}
                  aria-describedby={phoneError ? "booking-phone-error" : undefined}
                  className={`mt-2.5 w-full rounded-xl border bg-white px-3 py-2 text-sm text-heading outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 ${phoneError ? "border-danger" : "border-navy/15"}`}
                />
                {phoneError && (
                  <p id="booking-phone-error" role="alert" className="mt-1.5 text-xs text-danger">{phoneError}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="rounded-2xl border border-navy/10 bg-primary-50/30 p-4 text-sm">
              <p className="font-semibold text-navy">{unit.code}</p>
              <p className="mt-1 text-body">{unit.location}</p>
              <p className="text-body">{unit.spec}{unit.direction && unit.direction !== "—" ? ` · Hướng ${unit.direction}` : ""}</p>
            </div>

            {blocked && !booking ? (
              <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm" role="alert">
                <p className="flex items-center gap-2 font-semibold text-danger"><Ban size={16} aria-hidden /> Tạm khóa chức năng giữ chỗ</p>
                <p className="mt-1.5 text-body">
                  Tài khoản của quý khách đã hủy giữ chỗ {restriction?.limit ?? 5} lần liên tiếp nên tạm thời không thể giữ chỗ.
                  Vui lòng liên hệ chuyên viên qua số điện thoại, Zalo hoặc email bên dưới để được hỗ trợ mở khóa.
                </p>
              </div>
            ) : booking ? (
              <div className="mt-4 rounded-2xl border border-success/30 bg-success/5 p-4 text-sm text-heading" role="status">
                <p className="flex items-center gap-2 font-semibold text-success"><CircleCheck size={16} aria-hidden /> Giữ chỗ thành công</p>
                <p className="mt-1.5 text-body">
                  Căn được giữ cho quý khách{holdUntil ? ` đến ${pad(holdUntil.getHours())}:${pad(holdUntil.getMinutes())}` : ""}. Chuyên viên Đất Việt Group sẽ liên hệ xác nhận trong thời gian này.
                </p>
              </div>
            ) : null}

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-body">{blocked && !booking ? "Liên hệ để mở khóa" : booking ? "Chuyên viên sẽ liên hệ quý khách" : "Cần tư vấn thêm?"}</p>
              <ContactCards projectId={projectId} compact />
            </div>

            {error && (
              <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl bg-danger/5 px-3.5 py-2.5 text-sm text-danger">
                <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden /> {error}
              </p>
            )}

            <div className="mt-auto flex gap-3 pt-5">
              {booking ? (
                <>
                  <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-navy/15 py-3 text-sm font-semibold text-navy transition hover:bg-primary-50">Đóng</button>
                  <Link to="/account/bookings" className="flex flex-[1.4] items-center justify-center rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
                    Xem booking của tôi
                  </Link>
                </>
              ) : (
                <>
                  <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-navy/15 py-3 text-sm font-semibold text-navy transition hover:bg-primary-50">Hủy</button>
                  <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={submitting || blocked}
                    className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 py-3 text-sm font-semibold text-gold-950 shadow-lg shadow-gold-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Lock size={16} aria-hidden />}
                    {blocked ? "Đang bị khóa giữ chỗ" : submitting ? "Đang giữ chỗ..." : "Xác nhận giữ chỗ"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
