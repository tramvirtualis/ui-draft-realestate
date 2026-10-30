import { useCallback, useEffect, useState } from "react";
import { LockOpen, ShieldCheck } from "lucide-react";
import ConfirmDialog from "../../ConfirmDialog";
import Pagination from "../../../common/Pagination";
import { useToast } from "../../../common/toastContext";
import { getErrorMessage } from "../../../../api";
import { adminBookingService } from "../../../../services/project/bookingService";
import { formatDate, formatTime } from "../../../../utils/formatDate";
import type { BookingRestriction } from "../../../../types/booking.types";
import type { PageResponse } from "../../../../types/common.types";
import TableSkeleton from "../../../common/TableSkeleton";

type Load = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; page: PageResponse<BookingRestriction> };

// Khách bị khóa giữ chỗ vì tự hủy liên tiếp nhiều lần; admin gỡ khóa sau khi khách liên hệ
export default function BlockedCustomersPanel({ onChanged }: { onChanged?: () => void }) {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [unblocking, setUnblocking] = useState<BookingRestriction | null>(null);
  const refresh = useCallback(() => setReload((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    adminBookingService
      .blockedCustomers(page)
      .then((p) => !cancelled && setLoad({ status: "ready", page: p }))
      .catch((e) => !cancelled && setLoad({ status: "error", message: getErrorMessage(e) }));
    return () => {
      cancelled = true;
    };
  }, [page, reload]);

  const confirmUnblock = async () => {
    if (!unblocking?.userId) return;
    try {
      await adminBookingService.unblock(unblocking.userId);
      toast.show(`Đã gỡ khóa giữ chỗ cho ${unblocking.customerName ?? "khách"}`);
      refresh();
      onChanged?.();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    }
    setUnblocking(null);
  };

  const rows = load.status === "ready" ? load.page.content : [];

  return (
    <div className="mt-4">
      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-primary-50/70 text-xs text-body">
            <tr>
              {["Khách hàng", "Liên hệ", "Số lần hủy liên tiếp", "Bị khóa lúc", "Thao tác"].map((c) => (
                <th key={c} className="px-4 py-3 font-semibold first:pl-6">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {load.status === "loading" && <tr><td colSpan={5} className="p-0"><TableSkeleton rows={5} label="Đang tải khách bị khóa" /></td></tr>}
            {load.status === "error" && <tr><td colSpan={5} className="px-6 py-10 text-center text-danger">{load.message}</td></tr>}
            {load.status === "ready" && rows.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-body"><ShieldCheck size={22} className="mx-auto mb-2 text-success" />Không có khách nào bị khóa giữ chỗ.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.userId ?? 0} className="border-t border-line">
                <td className="px-4 py-3 font-semibold text-footer first:pl-6">{r.customerName ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-body">
                  <p>{r.customerPhone ?? "—"}</p>
                  <p>{r.customerEmail ?? ""}</p>
                </td>
                <td className="px-4 py-3 text-body">{r.consecutiveCancels} / {r.limit}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-body">{r.blockedAt ? `${formatTime(r.blockedAt)} · ${formatDate(r.blockedAt)}` : "—"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setUnblocking(r)}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
                  >
                    <LockOpen size={13} /> Gỡ khóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {load.status === "ready" && load.page.totalPages > 1 && (
        <div className="mt-4 flex justify-end"><Pagination page={page} totalPages={load.page.totalPages} onChange={setPage} /></div>
      )}

      {unblocking && (
        <ConfirmDialog
          title={`Gỡ khóa giữ chỗ cho ${unblocking.customerName ?? "khách"}?`}
          message="Khách sẽ giữ chỗ lại được bình thường và bộ đếm số lần hủy được đặt lại về 0."
          confirmLabel="Gỡ khóa"
          onConfirm={() => void confirmUnblock()}
          onClose={() => setUnblocking(null)}
        />
      )}
    </div>
  );
}
