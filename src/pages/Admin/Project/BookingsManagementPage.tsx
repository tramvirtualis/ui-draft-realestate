import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Ban, CalendarCheck, Check, CheckCheck, Search } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import HoldCountdown from "../../../components/Booking/HoldCountdown";
import BlockedCustomersPanel from "../../../components/Admin/project/bookings/BlockedCustomersPanel";
import Pagination from "../../../components/common/Pagination";
import useFocusTrap from "../../../components/common/useFocusTrap";
import { useToast } from "../../../components/common/toastContext";
import { getErrorMessage } from "../../../api";
import { adminBookingService, type BookingAction } from "../../../services/project/bookingService";
import { adminProjectService } from "../../../services/project/adminProjectService";
import { formatDate, formatTime } from "../../../utils/formatDate";
import { BOOKING_STATUS_META, BOOKING_STATUS_ORDER, type BookingDto, type BookingStats, type BookingStatus } from "../../../types/booking.types";
import type { AdminProject } from "../../../types/project/adminProject.types";
import type { PageResponse } from "../../../types/common.types";
import TableSkeleton from "../../../components/common/TableSkeleton";

const PAGE_SIZE = 10;
const COLUMNS = ["Căn", "Dự án", "Khách hàng", "Thời gian", "Trạng thái", "Thao tác"];
const STAT_KEY: Record<BookingStatus, keyof BookingStats> = {
  PENDING: "pending", CONFIRMED: "confirmed", COMPLETED: "completed", REJECTED: "rejected", EXPIRED: "expired", CANCELLED: "cancelled",
};

// Nội dung hộp thoại theo từng thao tác
const ACTIONS: Record<BookingAction, { title: string; button: string; tone: string; hint: string }> = {
  confirm: { title: "Xác nhận booking", button: "Xác nhận", tone: "bg-primary-600 hover:bg-primary-700", hint: "Căn tiếp tục được giữ cho khách đến khi hoàn tất hoặc hủy." },
  complete: { title: "Chốt đã bán", button: "Chốt đã bán", tone: "bg-success hover:brightness-95", hint: "Xác nhận giao dịch đã thành công: booking chuyển Hoàn tất và căn chuyển trạng thái Đã bán." },
};

type Load = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; page: PageResponse<BookingDto> };

function ActionDialog({ booking, action, onDone, onClose }: { booking: BookingDto; action: BookingAction; onDone: () => void; onClose: () => void }) {
  const toast = useToast();
  const root = useRef<HTMLDivElement>(null);
  useFocusTrap(root, true, onClose);
  const meta = ACTIONS[action];
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await adminBookingService.act(booking.id, action);
      toast.show(`${meta.title}: căn ${booking.propertyCode}`);
      onDone();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
      onDone(); // tải lại vì trạng thái có thể đã đổi (hết hạn, khách vừa hủy)
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-footer/40 px-4 backdrop-blur-sm" onClick={onClose}>
      <div ref={root} role="dialog" aria-modal="true" aria-labelledby="booking-action-title" tabIndex={-1} onClick={(e) => e.stopPropagation()} className="animate-page-in w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="booking-action-title" className="text-lg font-bold text-footer">{meta.title} · căn {booking.propertyCode}</h2>
        <p className="mt-1 text-sm text-body">{meta.hint}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer hover:bg-primary-50">Đóng</button>
          <button type="button" onClick={() => void submit()} disabled={busy} className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 ${meta.tone}`}>
            {busy ? "Đang xử lý..." : meta.button}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// Quản lý booking giữ chỗ của mọi dự án (kể cả dự án đang ẩn)
export default function BookingsManagementPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [projectId, setProjectId] = useState<number | "">("");
  const [tab, setTab] = useState<BookingStatus | "ALL" | "BLOCKED">("PENDING");
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [acting, setActing] = useState<{ booking: BookingDto; action: BookingAction } | null>(null);
  const [reload, setReload] = useState(0);
  const refresh = useCallback(() => setReload((n) => n + 1), []);

  useEffect(() => {
    adminProjectService.list().then(setProjects).catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const pid = projectId === "" ? undefined : projectId;
    Promise.all([
      adminBookingService.search({ status: tab === "ALL" || tab === "BLOCKED" ? undefined : tab, projectId: pid, keyword: query, page, size: PAGE_SIZE }),
      adminBookingService.stats(pid),
    ])
      .then(([p, s]) => {
        if (cancelled) return;
        setLoad({ status: "ready", page: p });
        setStats(s);
      })
      .catch((e) => !cancelled && setLoad({ status: "error", message: getErrorMessage(e) }));
    return () => {
      cancelled = true;
    };
  }, [tab, projectId, query, page, reload]);

  const rows = load.status === "ready" ? load.page.content : [];
  const total = stats ? Object.values(stats).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="animate-page-in">
      <AdminPageHeader
        soft
        breadcrumb={[{ label: "Dự án", to: "/admin/projects" }, { label: "Quản lý booking" }]}
        title="Booking giữ chỗ"
        desc="Xác nhận yêu cầu giữ chỗ, sau đó chốt đã bán khi giao dịch thành công. Booking đang chờ quá thời hạn sẽ tự hết hạn và mở lại căn."
      />

      <div className="px-4 pb-12 md:px-8">
        <div className="flex flex-wrap gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm">
          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value ? Number(e.target.value) : "");
              setPage(0);
            }}
            aria-label="Lọc theo dự án"
            className="h-11 min-w-56 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-primary-300"
          >
            <option value="">Tất cả dự án</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}{p.status !== "PUBLISHED" ? ` (${p.status === "HIDDEN" ? "đang ẩn" : "lưu trữ"})` : ""}</option>
            ))}
          </select>
          <form
            className="relative min-w-64 flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(keyword);
              setPage(0);
            }}
          >
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Mã căn, tên, email hoặc SĐT khách — Enter để tìm" aria-label="Tìm booking" className="h-11 w-full rounded-xl border border-line pl-9 pr-3 text-sm outline-none focus:border-primary-300 focus:ring-4 focus:ring-primary-100" />
          </form>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Lọc theo trạng thái">
          {(["ALL", ...BOOKING_STATUS_ORDER] as const).map((s) => {
            const count = stats ? (s === "ALL" ? total : stats[STAT_KEY[s]]) : null;
            return (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={tab === s}
                onClick={() => {
                  setTab(s);
                  setPage(0);
                }}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === s ? "bg-primary-600 text-white" : "bg-white text-heading ring-1 ring-line hover:bg-primary-50"}`}
              >
                {s === "ALL" ? "Tất cả" : BOOKING_STATUS_META[s].label}
                {count !== null && <span className={`rounded-full px-2 py-0.5 text-[11px] ${tab === s ? "bg-white/20" : "bg-primary-50 text-primary-700"}`}>{count}</span>}
              </button>
            );
          })}
          <button
            type="button"
            role="tab"
            aria-selected={tab === "BLOCKED"}
            onClick={() => setTab("BLOCKED")}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === "BLOCKED" ? "bg-danger text-white" : "bg-white text-danger ring-1 ring-danger/30 hover:bg-danger/5"}`}
          >
            <Ban size={14} /> Khách bị khóa
          </button>
        </div>

        {tab === "BLOCKED" ? (
          <BlockedCustomersPanel />
        ) : (
        <>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-primary-50/70 text-xs text-body">
              <tr>{COLUMNS.map((c) => <th key={c} className="px-4 py-3 font-semibold first:pl-6">{c}</th>)}</tr>
            </thead>
            <tbody>
              {load.status === "loading" && (
                <tr><td colSpan={COLUMNS.length} className="p-0"><TableSkeleton rows={PAGE_SIZE} label="Đang tải booking" /></td></tr>
              )}
              {load.status === "error" && <tr><td colSpan={COLUMNS.length} className="px-6 py-10 text-center text-danger">{load.message}</td></tr>}
              {load.status === "ready" && rows.length === 0 && (
                <tr><td colSpan={COLUMNS.length} className="px-6 py-12 text-center text-body"><CalendarCheck size={22} className="mx-auto mb-2 text-primary-300" />Không có booking nào.</td></tr>
              )}
              {rows.map((b) => {
                const meta = BOOKING_STATUS_META[b.status];
                return (
                  <tr key={b.id} className="border-t border-line align-top">
                    <td className="px-4 py-3 first:pl-6">
                      <p className="font-bold text-primary-600">{b.propertyCode}</p>
                      <p className="text-xs text-body">Phân khu {b.zoneName}</p>
                    </td>
                    <td className="max-w-[200px] px-4 py-3">
                      <p className="truncate font-semibold text-footer" title={b.projectName}>{b.projectName}</p>
                      {b.projectStatus !== "PUBLISHED" && <span className="mt-0.5 inline-block rounded-full bg-muted/20 px-2 py-0.5 text-[10px] font-semibold text-body">{b.projectStatus === "HIDDEN" ? "Dự án đang ẩn" : "Dự án lưu trữ"}</span>}
                    </td>
                    <td className="max-w-[220px] px-4 py-3">
                      <p className="truncate font-semibold text-footer">{b.customerName ?? "—"}</p>
                      <p className="truncate text-xs text-body">{[b.customerPhone, b.customerEmail].filter(Boolean).join(" · ")}</p>
                      {b.note && <p className="mt-1 line-clamp-2 text-xs italic text-body" title={b.note}>“{b.note}”</p>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-body">
                      <p>{formatTime(b.requestTime)} · {formatDate(b.requestTime)}</p>
                      {b.status === "PENDING" && b.holdExpiresAt && <p className="mt-1"><HoldCountdown until={b.holdExpiresAt} onElapsed={refresh} /></p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
                      </span>
                      {b.adminNote && <p className="mt-1 max-w-[180px] text-xs text-body" title={b.adminNote}>{b.adminNote}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {b.status === "PENDING" && (
                          <>
                            <button type="button" onClick={() => setActing({ booking: b, action: "confirm" })} className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"><Check size={13} /> Xác nhận</button>
                          </>
                        )}
                        {b.status === "CONFIRMED" && (
                          <>
                            <button type="button" onClick={() => setActing({ booking: b, action: "complete" })} title="Bấm khi giao dịch đã thành công" className="inline-flex items-center gap-1 rounded-lg border border-success/40 bg-white px-3 py-1.5 text-xs font-semibold text-success transition hover:bg-success/5"><CheckCheck size={13} /> Chốt đã bán</button>
                          </>
                        )}
                        {b.status !== "PENDING" && b.status !== "CONFIRMED" && <span className="text-xs text-muted">—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {load.status === "ready" && load.page.totalPages > 1 && (
          <div className="mt-4 flex justify-end"><Pagination page={page} totalPages={load.page.totalPages} onChange={setPage} /></div>
        )}
        </>
        )}
      </div>

      {acting && (
        <ActionDialog
          booking={acting.booking}
          action={acting.action}
          onClose={() => setActing(null)}
          onDone={() => {
            setActing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
