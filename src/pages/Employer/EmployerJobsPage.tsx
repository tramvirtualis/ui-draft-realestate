import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import Breadcrumb from "../../components/common/Breadcrumb";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/Admin/ConfirmDialog";
import AdminStatusTabs from "../../components/Admin/AdminStatusTabs";
import JobReviewBadge from "../../components/Job/JobReviewBadge";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { employerJobService } from "../../services/job/employerService";
import { formatSalary } from "../../utils/jobUtils";
import { formatDate } from "../../utils/formatDate";
import { useEmployerCompany } from "../../layouts/EmployerLayout";
import {
  JOB_REVIEW_META,
  JOB_STATUS_META,
  type AdminJob,
  type JobReviewStatus,
  type JobStatus,
} from "../../types/job/job.types";

const PAGE_SIZE = 10;
const STATUSES = Object.keys(JOB_STATUS_META) as JobStatus[];
const REVIEWS = Object.keys(JOB_REVIEW_META) as JobReviewStatus[];
const TABS = [
  { key: "" as const, label: "Tất cả tin" },
  ...REVIEWS.map((r) => ({
    key: r,
    label: JOB_REVIEW_META[r].label,
    dot: JOB_REVIEW_META[r].dot,
  })),
];
const TH =
  "px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted";
const btn =
  "flex h-8 w-8 items-center justify-center rounded-lg transition focus-visible:outline-2 focus-visible:outline-primary-600 active:scale-95";

type Load =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: AdminJob[]; total: number; pages: number };

// Tin tuyển dụng của công ty: GET /api/employer/jobs
export default function EmployerJobsPage() {
  const company = useEmployerCompany();
  const toast = useToast();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [review, setReview] = useState<JobReviewStatus | "">("");
  const [page, setPage] = useState(0);
  const [counts, setCounts] = useState<
    Partial<Record<JobReviewStatus | "", number>>
  >({});
  const [deleting, setDeleting] = useState<AdminJob | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(input);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    const keys = ["", ...REVIEWS] as (JobReviewStatus | "")[];
    Promise.all(keys.map((r) => employerJobService.count(r)))
      .then((n) => setCounts(Object.fromEntries(keys.map((k, i) => [k, n[i]]))))
      .catch(() => undefined);
  }, [reload]);

  useEffect(() => {
    let cancelled = false;
    employerJobService
      .search({
        keyword,
        status: "",
        reviewStatus: review,
        page,
        size: PAGE_SIZE,
      })
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
  }, [keyword, review, page, reload]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);
  const items = load.status === "ready" ? load.items : [];
  const total = load.status === "ready" ? load.total : 0;
  const pages = load.status === "ready" ? load.pages : 1;

  const changeStatus = async (job: AdminJob, next: JobStatus) => {
    if (next === job.status) return;
    setBusyId(job.id);
    try {
      await employerJobService.setStatus(job.id, next);
      toast.show(
        `Đã chuyển "${job.title}" sang ${JOB_STATUS_META[
          next
        ].label.toLowerCase()}`
      );
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await employerJobService.remove(deleting.id);
      toast.show(`Đã xóa tin "${deleting.title}"`);
      setDeleting(null);
      if (items.length === 1 && page > 0) setPage(page - 1);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    }
  };

  return (
    <>
      <title>Tin tuyển dụng | Nhà tuyển dụng</title>
      <meta name="robots" content="noindex" />

      <Breadcrumb
        items={[
          { label: "Nhà tuyển dụng", to: "/employer/jobs" },
          { label: "Tin tuyển dụng" },
        ]}
      />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-heading md:text-4xl">
            Tin tuyển dụng
          </h1>
          <p className="mt-2 text-sm text-body">
            Tin của {company.name}. Tin mới hoặc vừa sửa cần quản trị viên duyệt
            trước khi hiện trên trang tuyển dụng.
          </p>
        </div>
        <Link
          to="/employer/jobs/new"
          className="flex h-11 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
        >
          <Plus size={16} /> Đăng tin mới
        </Link>
      </div>

      <div className="mt-6 space-y-5">
        <AdminStatusTabs
          tabs={TABS}
          value={review}
          counts={counts}
          onChange={(v) => {
            setLoad({ status: "loading" });
            setReview(v);
            setPage(0);
          }}
        />

        <section className="rounded-2xl border border-line bg-white shadow-sm">
          <div className="p-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tìm theo tiêu đề, phòng ban..."
                aria-label="Tìm tin tuyển dụng"
                className="h-11 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-sm outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
              />
            </div>
          </div>

          <div className="border-t border-line">
            {load.status === "loading" ? (
              <div
                className="animate-pulse space-y-3 p-4"
                aria-busy="true"
                aria-label="Đang tải tin tuyển dụng"
              >
                {[0, 1, 2].map((n) => (
                  <div key={n} className="h-14 rounded-xl bg-primary-50" />
                ))}
              </div>
            ) : load.status === "error" ? (
              <div role="alert" className="px-6 py-14 text-center">
                <p className="font-semibold text-heading">
                  Không tải được danh sách tin
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
              <div className="px-6 py-14 text-center text-sm text-body">
                {input.trim() || review ? (
                  "Không có tin phù hợp."
                ) : (
                  <>
                    Bạn chưa đăng tin nào.{" "}
                    <Link
                      to="/employer/jobs/new"
                      className="font-semibold text-primary-700 hover:underline"
                    >
                      Đăng tin đầu tiên
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-primary-50/60">
                    <tr>
                      <th className={TH}>Vị trí</th>
                      <th className={TH}>Mức lương</th>
                      <th className={TH}>Hạn nộp</th>
                      <th className={TH}>Duyệt</th>
                      <th className={TH}>Trạng thái</th>
                      <th className={TH}>Ứng viên</th>
                      <th className={TH} />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((j) => {
                      const meta = JOB_STATUS_META[j.status];
                      const live =
                        j.status === "OPEN" && j.reviewStatus === "APPROVED";
                      return (
                        <tr
                          key={j.id}
                          className="border-t border-line align-top transition hover:bg-primary-50/40"
                        >
                          <td className="max-w-[280px] px-4 py-3">
                            <p
                              className="truncate font-semibold text-footer"
                              title={j.title}
                            >
                              {j.title}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-body">
                              {[j.jobType?.name, j.location]
                                .filter(Boolean)
                                .join(" · ") || "—"}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-heading">
                            {formatSalary(
                              j.salaryMin,
                              j.salaryMax,
                              j.currency,
                              j.salaryNegotiable
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-heading">
                            {j.deadline ? formatDate(j.deadline) : "Không hạn"}
                          </td>
                          <td className="max-w-[220px] px-4 py-3">
                            <JobReviewBadge status={j.reviewStatus} />
                            {j.reviewStatus === "REJECTED" &&
                              j.reviewReason && (
                                <p
                                  className="mt-1 line-clamp-2 text-[11px] text-red-600"
                                  title={j.reviewReason}
                                >
                                  {j.reviewReason}
                                </p>
                              )}
                          </td>
                          <td className="px-4 py-3">
                            <label className="relative inline-flex items-center">
                              <span
                                className={`pointer-events-none absolute left-3 h-1.5 w-1.5 rounded-full ${meta.dot}`}
                              />
                              <select
                                value={j.status}
                                disabled={busyId === j.id}
                                onChange={(e) =>
                                  changeStatus(j, e.target.value as JobStatus)
                                }
                                aria-label={`Trạng thái của ${j.title}`}
                                className={`appearance-none rounded-full border border-line bg-white py-1 pl-6 pr-7 text-xs font-semibold outline-none transition hover:border-primary-300 disabled:opacity-50 ${meta.text}`}
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {JOB_STATUS_META[s].label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown
                                size={13}
                                className="pointer-events-none absolute right-2 text-muted"
                              />
                            </label>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              to={`/employer/applications?jobId=${j.id}`}
                              title="Xem ứng viên của tin này"
                              className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 transition hover:bg-primary-100"
                            >
                              <Users size={13} /> {j.applicationCount ?? 0}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              {live && (
                                <Link
                                  to={`/jobs/${j.id}`}
                                  target="_blank"
                                  aria-label={`Xem ${j.title}`}
                                  title="Xem trên trang tuyển dụng"
                                  className={`${btn} text-body hover:bg-primary-50`}
                                >
                                  <Eye size={16} />
                                </Link>
                              )}
                              <Link
                                to={`/employer/jobs/${j.id}/edit`}
                                aria-label={`Sửa ${j.title}`}
                                title="Sửa"
                                className={`${btn} text-body hover:bg-primary-50`}
                              >
                                <Pencil size={16} />
                              </Link>
                              <button
                                type="button"
                                onClick={() => setDeleting(j)}
                                aria-label={`Xóa ${j.title}`}
                                title="Xóa"
                                className={`${btn} bg-danger/10 text-danger hover:bg-danger/20`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
          {load.status === "ready" && total > 0 && pages <= 1 && (
            <p className="border-t border-line px-5 py-4 text-xs text-body">
              {total} tin
            </p>
          )}
        </section>
      </div>

      {deleting && (
        <ConfirmDialog
          title="Xóa tin tuyển dụng?"
          message={`Xóa "${deleting.title}"?${
            deleting.applicationCount
              ? ` Tin đang có ${deleting.applicationCount} đơn ứng tuyển.`
              : ""
          } Nếu chỉ muốn ngừng nhận hồ sơ, hãy chuyển sang "Tạm dừng" hoặc "Đã đóng".`}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
