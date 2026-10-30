import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Ban, ChevronRight, ImageOff, MapPin, X } from "lucide-react";
import HoldCountdown from "../../components/Booking/HoldCountdown";
import ConfirmDialog from "../../components/Admin/ConfirmDialog";
import ContactCards from "../../components/Project/Detail/unitDetail/ContactCards";
import Pagination from "../../components/common/Pagination";
import SafeImage from "../../components/common/SafeImage";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { bookingService } from "../../services/project/bookingService";
import { formatDate, formatTime } from "../../utils/formatDate";
import { projectPath } from "../../utils/slug";
import { BOOKING_STATUS_META, BOOKING_STATUS_ORDER, isActiveBooking, type BookingDto, type BookingRestriction, type BookingStatus } from "../../types/booking.types";
import type { PageResponse } from "../../types/common.types";

const PAGE_SIZE = 8;
type Load = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; page: PageResponse<BookingDto> };

const money = (n: number | null) => (n ? `${(n / 1e9).toFixed(2).replace(".", ",")} tỷ` : "Liên hệ");
const when = (iso: string) => `${formatTime(iso)} · ${formatDate(iso)}`;

// Booking giữ chỗ của khách: dữ liệu thật từ /api/bookings/me
export default function MyBookingsPage() {
  const toast = useToast();
  const [tab, setTab] = useState<BookingStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [cancelling, setCancelling] = useState<BookingDto | null>(null);
  const [restriction, setRestriction] = useState<BookingRestriction | null>(null);
  const refresh = useCallback(() => setReload((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    bookingService
      .mine({ status: tab === "ALL" ? undefined : tab, page, size: PAGE_SIZE })
      .then((p) => !cancelled && setLoad({ status: "ready", page: p }))
      .catch((e) => !cancelled && setLoad({ status: "error", message: getErrorMessage(e) }));
    return () => {
      cancelled = true;
    };
  }, [tab, page, reload]);

  useEffect(() => {
    let cancelled = false;
    bookingService
      .myRestriction()
      .then((r) => !cancelled && setRestriction(r))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const remainingCancels = restriction ? Math.max(0, restriction.limit - restriction.consecutiveCancels) : null;

  const confirmCancel = async () => {
    if (!cancelling) return;
    try {
      await bookingService.cancel(cancelling.id);
      toast.show(`Đã hủy giữ chỗ căn ${cancelling.propertyCode}`);
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
      refresh(); // trạng thái có thể đã đổi (hết hạn / admin xử lý)
    }
    setCancelling(null);
  };

  const rows = load.status === "ready" ? load.page.content : [];

  return (
    <div>
      <nav className="flex items-center gap-3 text-xs text-muted">
        <span>Tài khoản</span> <ChevronRight size={12} />
        <span className="font-semibold text-primary-600">Booking của tôi</span>
      </nav>
      <h1 className="mt-3 text-2xl font-bold text-heading">Booking giữ chỗ</h1>
      <p className="mt-1 text-sm text-body">Theo dõi các căn bạn đang giữ chỗ và kết quả xác nhận từ chuyên viên.</p>

      {restriction?.blocked ? (
        <div role="alert" className="mt-5 rounded-2xl border border-danger/30 bg-danger/5 p-5">
          <p className="flex items-center gap-2 font-semibold text-danger"><Ban size={17} aria-hidden /> Tài khoản đang bị khóa chức năng giữ chỗ</p>
          <p className="mt-1.5 text-sm text-body">
            Bạn đã hủy giữ chỗ {restriction.limit} lần liên tiếp. Vui lòng liên hệ người phụ trách dự án qua số điện thoại hoặc Zalo dưới đây để được mở khóa.
          </p>
          {/* Liên hệ người phụ trách dự án của booking gần nhất */}
          <div className="mt-4"><ContactCards projectId={rows[0]?.projectId ?? null} compact /></div>
        </div>
      ) : restriction && restriction.consecutiveCancels > 0 ? (
        <p className="mt-5 flex items-start gap-2 rounded-2xl bg-warning/10 px-4 py-3 text-sm text-warning">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
          Bạn đã hủy giữ chỗ {restriction.consecutiveCancels} lần liên tiếp. Hủy thêm {remainingCancels} lần nữa, chức năng giữ chỗ sẽ bị khóa.
        </p>
      ) : null}

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Lọc theo trạng thái">
        {(["ALL", ...BOOKING_STATUS_ORDER] as const).map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={tab === s}
            onClick={() => {
              setTab(s);
              setPage(0);
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === s ? "bg-primary-600 text-white" : "bg-primary-50 text-heading hover:bg-primary-100"}`}
          >
            {s === "ALL" ? "Tất cả" : BOOKING_STATUS_META[s].label}
          </button>
        ))}
      </div>

      {load.status === "loading" && (
        <div className="mt-5 space-y-3" aria-busy="true">
          {[0, 1, 2].map((n) => <div key={n} className="h-28 animate-pulse rounded-2xl bg-primary-50" />)}
        </div>
      )}
      {load.status === "error" && <p role="alert" className="mt-5 rounded-2xl bg-danger/5 px-5 py-4 text-sm text-danger">{load.message}</p>}
      {load.status === "ready" && rows.length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-primary-200 px-6 py-14 text-center">
          <p className="font-semibold text-heading">Chưa có booking nào</p>
          <p className="mt-1 text-sm text-body">Chọn căn ở mục Quỹ căn hoặc Mặt bằng của dự án để giữ chỗ.</p>
          <Link to="/projects" className="mt-4 inline-block rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Xem dự án</Link>
        </div>
      )}

      <ul className="mt-5 space-y-3">
        {rows.map((b) => {
          const meta = BOOKING_STATUS_META[b.status];
          const projectVisible = b.projectStatus === "PUBLISHED";
          return (
            <li key={b.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:flex-row">
              {b.image ? (
                <SafeImage src={b.image} alt={`Căn ${b.propertyCode}`} className="h-28 w-full shrink-0 rounded-xl object-cover sm:w-40" />
              ) : (
                <span className="flex h-28 w-full shrink-0 items-center justify-center rounded-xl bg-primary-50 text-muted sm:w-40"><ImageOff size={22} /></span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-bold text-heading">Căn {b.propertyCode}</p>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-body">
                  <MapPin size={13} className="shrink-0" />
                  {projectVisible ? (
                    <Link to={projectPath(b.projectId, b.projectName)} className="truncate hover:text-primary-600 hover:underline">{b.projectName}</Link>
                  ) : (
                    <span className="truncate">{b.projectName}</span>
                  )}
                  <span className="text-muted">· Phân khu {b.zoneName}</span>
                </p>
                <p className="mt-1 text-sm text-body">Giá niêm yết: <span className="font-semibold text-heading">{money(b.price)}</span></p>
                <p className="mt-1 text-xs text-muted">Gửi lúc {when(b.requestTime)}</p>
                {b.status === "PENDING" && b.holdExpiresAt && (
                  <p className="mt-1.5"><HoldCountdown until={b.holdExpiresAt} onElapsed={refresh} /></p>
                )}
                {b.adminNote && !isActiveBooking(b.status) && <p className="mt-1.5 text-xs text-body">Ghi chú: {b.adminNote}</p>}
                <p className="mt-1 text-xs text-muted">{meta.note}</p>
              </div>
              {isActiveBooking(b.status) && (
                <div className="flex items-start sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setCancelling(b)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 px-3.5 py-2 text-sm font-semibold text-danger transition hover:bg-danger/5"
                  >
                    <X size={14} /> Hủy giữ chỗ
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {load.status === "ready" && load.page.totalPages > 1 && (
        <div className="mt-5 flex justify-end">
          <Pagination page={page} totalPages={load.page.totalPages} onChange={setPage} />
        </div>
      )}

      {cancelling && (
        <ConfirmDialog
          title={`Hủy giữ chỗ căn ${cancelling.propertyCode}?`}
          message={
            remainingCancels !== null && remainingCancels <= 1
              ? "Đây là lần hủy cuối trước khi chức năng giữ chỗ của bạn bị khóa (chỉ mở lại khi liên hệ chuyên viên). Bạn có chắc muốn hủy?"
              : `Căn sẽ được mở lại cho khách hàng khác.${remainingCancels !== null ? ` Hủy liên tiếp thêm ${remainingCancels} lần, chức năng giữ chỗ sẽ bị khóa.` : ""} Bạn có chắc muốn hủy?`
          }
          confirmLabel="Hủy giữ chỗ"
          onConfirm={() => void confirmCancel()}
          onClose={() => setCancelling(null)}
        />
      )}
    </div>
  );
}
