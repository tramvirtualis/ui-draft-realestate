import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, FileText, Search } from "lucide-react";
import Breadcrumb from "../../components/common/Breadcrumb";
import Pagination from "../../components/common/Pagination";
import AdminStatusTabs from "../../components/Admin/AdminStatusTabs";
import ApplicationDetailModal, {
  StatusBadge,
} from "../../components/Admin/applications/ApplicationDetailModal";
import {
  employerApplicationService,
  employerJobService,
} from "../../services/job/employerService";
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
const TH =
  "px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted";

type Load =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: Application[]; total: number; pages: number };

// Ứng viên nộp vào tin của công ty: GET /api/employer/applications (?jobId=&status=&keyword=)
export default function EmployerApplicationsPage() {
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

  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(input);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [input]);

  // Tin của công ty cho ô lọc "Vị trí"
  useEffect(() => {
    employerJobService
      .search({ keyword: "", status: "", reviewStatus: "", page: 0, size: 200 })
      .then((p) => setJobs(p.content))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const keys = ["", ...APPLICATION_STATUS_ORDER] as (
      | ApplicationStatus
      | ""
    )[];
    Promise.all(keys.map((s) => employerApplicationService.count(s, jobId)))
      .then((n) => setCounts(Object.fromEntries(keys.map((k, i) => [k, n[i]]))))
      .catch(() => undefined);
  }, [jobId, reload]);

  useEffect(() => {
    let cancelled = false;
    employerApplicationService
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
  const pages = load.status === "ready" ? load.pages : 1;

  return (
    <>
      <title>Ứng viên | Nhà tuyển dụng</title>
      <meta name="robots" content="noindex" />

      <Breadcrumb
        items={[
          { label: "Nhà tuyển dụng", to: "/employer/jobs" },
          { label: "Ứng viên" },
        ]}
      />
      <h1 className="mt-4 text-3xl font-semibold text-heading md:text-4xl">
        Ứng viên
      </h1>
      <p className="mt-2 text-sm text-body">
        Xem hồ sơ, hẹn phỏng vấn và báo kết quả. Ứng viên nhận thông báo và
        email ở mỗi bước.
      </p>

      <div className="mt-6 space-y-5">
        <AdminStatusTabs
          tabs={TABS}
          value={status}
          counts={counts}
          onChange={(v) => {
            setLoad({ status: "loading" });
            setStatus(v);
            setPage(0);
          }}
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
                onChange={(e) => {
                  setLoad({ status: "loading" });
                  setPage(0);
                  setParams(e.target.value ? { jobId: e.target.value } : {}, {
                    replace: true,
                  });
                }}
                aria-label="Vị trí ứng tuyển"
                className="h-11 max-w-72 appearance-none truncate rounded-xl border border-line bg-white pl-4 pr-10 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
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
          </div>

          <div className="border-t border-line">
            {load.status === "loading" ? (
              <div
                className="animate-pulse space-y-3 p-4"
                aria-busy="true"
                aria-label="Đang tải đơn ứng tuyển"
              >
                {[0, 1, 2].map((n) => (
                  <div key={n} className="h-14 rounded-xl bg-primary-50" />
                ))}
              </div>
            ) : load.status === "error" ? (
              <div role="alert" className="px-6 py-14 text-center">
                <p className="font-semibold text-heading">
                  Không tải được danh sách ứng viên
                </p>
                <button
                  onClick={() => {
                    setLoad({ status: "loading" });
                    refresh();
                  }}
                  className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
                >
                  Thử lại
                </button>
              </div>
            ) : items.length === 0 ? (
              <p className="px-6 py-14 text-center text-sm text-body">
                {input.trim() || status || jobId !== null
                  ? "Không có đơn phù hợp với bộ lọc."
                  : "Chưa có ứng viên nào nộp đơn."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
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
                          className="max-w-[240px] truncate px-4 py-3 text-heading"
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

          {load.status === "ready" && pages > 1 && (
            <div className="flex justify-end border-t border-line px-5 py-4">
              <Pagination
                page={page}
                totalPages={pages}
                onChange={(p) => {
                  setLoad({ status: "loading" });
                  setPage(p);
                }}
              />
            </div>
          )}
        </section>
      </div>

      {openId !== null && (
        <ApplicationDetailModal
          id={openId}
          service={employerApplicationService}
          onClose={() => setOpenId(null)}
          onChanged={refresh}
        />
      )}
    </>
  );
}
