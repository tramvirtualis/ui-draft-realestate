import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, FileText, RotateCcw, Search } from "lucide-react";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import AdminStatusTabs from "../../components/Admin/AdminStatusTabs";
import ConfirmDialog from "../../components/Admin/ConfirmDialog";
import ApplicationDetailModal, {
  StatusBadge,
} from "../../components/Admin/applications/ApplicationDetailModal";
import Pagination from "../../components/common/Pagination";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminApplicationService } from "../../services/job/adminApplicationService";
import { adminJobService } from "../../services/job/adminJobService";
import { formatDate, formatTime } from "../../utils/formatDate";
import {
  APPLICATION_STATUS_META,
  APPLICATION_STATUS_ORDER,
  type Application,
  type ApplicationStatus,
} from "../../types/applicationHistory.types";
import type { AdminJob } from "../../types/job/job.types";

const PAGE_SIZE = 10;
const TABS = [
  { key: "" as const, label: "Tất cả đơn" },
  ...APPLICATION_STATUS_ORDER.map((s) => ({
    key: s,
    label: APPLICATION_STATUS_META[s].label,
  })),
];
const select =
  "h-11 max-w-72 appearance-none truncate rounded-xl border border-line bg-white pl-4 pr-10 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";
const TH =
  "px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted";

type Load =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: Application[]; total: number; pages: number };

// Quản lý đơn ứng tuyển: GET /api/admin/applications (?jobId=&status=&keyword=)
export default function AdminApplicationsPage() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const jobId = params.get("jobId") ? Number(params.get("jobId")) : null;
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "">("");
  const [page, setPage] = useState(0);
  const [counts, setCounts] = useState<
    Partial<Record<ApplicationStatus | "", number>>
  >({});
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Application | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(input);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [input]);

  // Danh sách tin cho ô lọc "Vị trí"
  useEffect(() => {
    adminJobService
      .search({
        keyword: "",
        status: "",
        jobTypeId: null,
        employmentType: "",
        experienceLevel: "",
        page: 0,
        size: 200,
      })
      .then((p) => setJobs(p.content))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const keys = ["", ...APPLICATION_STATUS_ORDER] as (
      | ApplicationStatus
      | ""
    )[];
    Promise.all(keys.map((s) => adminApplicationService.count(s, jobId)))
      .then((n) => setCounts(Object.fromEntries(keys.map((k, i) => [k, n[i]]))))
      .catch(() => undefined);
  }, [jobId, reload]);

  useEffect(() => {
    let cancelled = false;
    adminApplicationService
      .search({ keyword, status, jobId, page, size: PAGE_SIZE })
      .then(
        (p) =>
          !cancelled &&
          setLoad({
            status: "ready",
            items: p.content,
            total: p.totalElements,
            pages: p.totalPages,
          })
      )
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [keyword, status, jobId, page, reload]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);
  const items = load.status === "ready" ? load.items : [];
  const total = load.status === "ready" ? load.total : 0;
  const pages = load.status === "ready" ? load.pages : 1;
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min(total, (page + 1) * PAGE_SIZE);
  const hasFilter = input.trim() !== "" || status !== "" || jobId !== null;

  const changeStatus = (v: ApplicationStatus | "") => {
    setLoad({ status: "loading" });
    setStatus(v);
    setPage(0);
  };
  const changeJob = (v: string) => {
    setLoad({ status: "loading" });
    setPage(0);
    setParams(v ? { jobId: v } : {}, { replace: true });
  };
  const resetFilters = () => {
    setLoad({ status: "loading" });
    setInput("");
    setKeyword("");
    setStatus("");
    setPage(0);
    setParams({}, { replace: true });
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await adminApplicationService.remove(deleting.id);
      toast.show(`Đã xóa đơn của ${deleting.fullName}`);
      setDeleting(null);
      setOpenId(null);
      if (items.length === 1 && page > 0) setPage(page - 1);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    }
  };

  return (
    <>
      <AdminPageHeader
        breadcrumb={[
          { label: "Tổng quan", to: "/admin/dashboard" },
          { label: "Quản lý ứng viên" },
        ]}
        title="Quản lý ứng viên"
        desc="Xem hồ sơ ứng tuyển, hẹn phỏng vấn và cập nhật kết quả cho ứng viên."
      />

      <div className="-mt-16 space-y-5 px-4 pb-10 md:px-8">
        <AdminStatusTabs
          tabs={TABS}
          value={status}
          counts={counts}
          onChange={changeStatus}
        />

        <section className="rounded-2xl border border-line bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-60 flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tìm theo tên, email, số điện thoại..."
                aria-label="Tìm ứng viên"
                className="h-11 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-sm outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
              />
            </div>
            <label className="relative block">
              <select
                value={jobId ?? ""}
                onChange={(e) => changeJob(e.target.value)}
                aria-label="Vị trí ứng tuyển"
                className={select}
              >
                <option value="">Vị trí: Tất cả</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
            </label>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasFilter}
              className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-heading transition hover:bg-primary-50 disabled:opacity-50"
            >
              <RotateCcw size={15} /> Đặt lại
            </button>
          </div>

          <div className="border-t border-line">
            {load.status === "loading" ? (
              <div
                className="animate-pulse space-y-3 p-4"
                aria-busy="true"
                aria-label="Đang tải đơn ứng tuyển"
              >
                {[0, 1, 2, 3].map((n) => (
                  <div key={n} className="h-14 rounded-xl bg-primary-50" />
                ))}
              </div>
            ) : load.status === "error" ? (
              <div role="alert" className="px-6 py-14 text-center">
                <p className="font-semibold text-heading">
                  Không tải được danh sách đơn ứng tuyển
                </p>
                <button
                  onClick={() => {
                    setLoad({ status: "loading" });
                    refresh();
                  }}
                  className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95"
                >
                  Thử lại
                </button>
              </div>
            ) : items.length === 0 ? (
              <p className="px-6 py-14 text-center text-sm text-body">
                {hasFilter
                  ? "Không có đơn phù hợp với bộ lọc."
                  : "Chưa có đơn ứng tuyển nào."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-primary-50/60">
                    <tr>
                      <th className={TH}>Ứng viên</th>
                      <th className={TH}>Vị trí</th>
                      <th className={TH}>Ngày nộp</th>
                      <th className={TH}>CV</th>
                      <th className={TH}>Trạng thái</th>
                      <th className={TH} />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((a) => (
                      <tr
                        key={a.id}
                        onClick={() => setOpenId(a.id)}
                        className="cursor-pointer border-t border-line transition hover:bg-primary-50/40"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-footer">
                            {a.fullName}
                          </p>
                          <p className="text-xs text-body">
                            {a.email} · {a.phone}
                          </p>
                        </td>
                        <td
                          className="max-w-[260px] truncate px-4 py-3 text-heading"
                          title={a.job?.title}
                        >
                          {a.job?.title ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-body">
                          {formatTime(a.createdAt)} · {formatDate(a.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {a.cvUrl ? (
                            <a
                              href={a.cvUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title={a.cvFileName ?? "Xem CV"}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:underline"
                            >
                              <FileText size={14} /> Xem CV
                            </a>
                          ) : (
                            <span className="text-xs text-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={a.status} />
                          {a.status === "INTERVIEW_SCHEDULED" &&
                            a.interviewAt && (
                              <p className="mt-1 text-[11px] text-body">
                                PV {formatTime(a.interviewAt)} ·{" "}
                                {formatDate(a.interviewAt)}
                              </p>
                            )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenId(a.id);
                            }}
                            className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-primary-50"
                          >
                            Xử lý
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {load.status === "ready" && total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs text-body">
              <p>
                Hiển thị {from}–{to} trong {total} đơn
              </p>
              {pages > 1 && (
                <Pagination
                  page={page}
                  totalPages={pages}
                  onChange={(p) => {
                    setLoad({ status: "loading" });
                    setPage(p);
                  }}
                />
              )}
            </div>
          )}
        </section>
      </div>

      {openId !== null && (
        <ApplicationDetailModal
          id={openId}
          onClose={() => setOpenId(null)}
          onChanged={refresh}
          onDelete={setDeleting}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Xóa đơn ứng tuyển?"
          message={`Xóa đơn của ${deleting.fullName}${
            deleting.job ? ` cho vị trí "${deleting.job.title}"` : ""
          }? Hành động này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
