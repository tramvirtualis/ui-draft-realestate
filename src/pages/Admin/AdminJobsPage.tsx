import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import AdminStatusTabs from "../../components/Admin/AdminStatusTabs";
import ConfirmDialog from "../../components/Admin/ConfirmDialog";
import Pagination from "../../components/common/Pagination";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminJobService } from "../../services/job/adminJobService";
import { adminJobTypeService } from "../../services/job/adminJobTypeService";
import { formatSalary } from "../../utils/jobUtils";
import { formatDate } from "../../utils/formatDate";
import JobReviewBadge from "../../components/Job/JobReviewBadge";
import {
  EMPLOYMENT_TYPE_LABEL,
  JOB_REVIEW_META,
  JOB_STATUS_META,
  type AdminJob,
  type EmploymentType,
  type JobReviewStatus,
  type JobStatus,
  type JobType,
} from "../../types/job/job.types";

const PAGE_SIZE = 10;
const STATUSES = Object.keys(JOB_STATUS_META) as JobStatus[];
const TABS = [
  { key: "" as const, label: "Tất cả tin" },
  ...STATUSES.map((s) => ({
    key: s,
    label: JOB_STATUS_META[s].label,
    dot: JOB_STATUS_META[s].dot,
  })),
];

type Load =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: AdminJob[]; total: number; pages: number };

const select =
  "h-11 appearance-none rounded-xl border border-line bg-white pl-4 pr-10 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";
const btn =
  "flex h-8 w-8 items-center justify-center rounded-lg transition focus-visible:outline-2 focus-visible:outline-primary-600 active:scale-95";
const TH =
  "px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted";

function Select({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="relative block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={select}
      >
        {children}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
      />
    </label>
  );
}

// Quản lý tin tuyển dụng: lọc, tìm kiếm và phân trang ở server theo GET /api/admin/jobs
export default function AdminJobsPage() {
  const toast = useToast();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<JobStatus | "">("");
  const [reviewStatus, setReviewStatus] = useState<JobReviewStatus | "">("");
  const [source, setSource] = useState<"" | "employer" | "internal">("");
  const [pendingReview, setPendingReview] = useState(0);
  const [jobTypeId, setJobTypeId] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType | "">("");
  const [page, setPage] = useState(0);
  const [counts, setCounts] = useState<Partial<Record<JobStatus | "", number>>>(
    {}
  );
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [deleting, setDeleting] = useState<AdminJob | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Chờ người dùng ngừng gõ rồi mới gọi API tìm kiếm
  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(input);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    adminJobTypeService
      .all()
      .then(setJobTypes)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const keys = ["", ...STATUSES] as (JobStatus | "")[];
    Promise.all(keys.map((s) => adminJobService.count(s)))
      .then((n) => setCounts(Object.fromEntries(keys.map((k, i) => [k, n[i]]))))
      .catch(() => undefined);
    adminJobService
      .countPendingReview()
      .then(setPendingReview)
      .catch(() => undefined);
  }, [reload]);

  useEffect(() => {
    let cancelled = false;
    adminJobService
      .search({
        keyword,
        status,
        jobTypeId: jobTypeId ? Number(jobTypeId) : null,
        employmentType,
        experienceLevel: "",
        reviewStatus,
        source,
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
  }, [
    keyword,
    status,
    reviewStatus,
    source,
    jobTypeId,
    employmentType,
    page,
    reload,
  ]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);
  const filter =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setLoad({ status: "loading" });
      setter(v);
      setPage(0);
    };

  const items = load.status === "ready" ? load.items : [];
  const total = load.status === "ready" ? load.total : 0;
  const pages = load.status === "ready" ? load.pages : 1;
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min(total, (page + 1) * PAGE_SIZE);
  const hasFilter =
    input.trim() !== "" ||
    status !== "" ||
    reviewStatus !== "" ||
    source !== "" ||
    jobTypeId !== "" ||
    employmentType !== "";

  const resetFilters = () => {
    setLoad({ status: "loading" });
    setInput("");
    setKeyword("");
    setStatus("");
    setReviewStatus("");
    setSource("");
    setJobTypeId("");
    setEmploymentType("");
    setPage(0);
  };

  const changeStatus = async (job: AdminJob, next: JobStatus) => {
    if (next === job.status) return;
    setBusyId(job.id);
    try {
      await adminJobService.setStatus(job.id, next);
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
      await adminJobService.remove(deleting.id);
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
      <AdminPageHeader
        breadcrumb={[
          { label: "Tổng quan", to: "/admin/dashboard" },
          { label: "Tin tuyển dụng" },
        ]}
        title="Tin tuyển dụng"
        desc="Đăng, chỉnh sửa và đóng / mở các vị trí tuyển dụng."
        action={
          <Link
            to="/admin/jobs/new"
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
          >
            <Plus size={16} /> Đăng tin mới
          </Link>
        }
      />

      <div className="-mt-16 space-y-5 px-4 pb-10 md:px-8">
        {pendingReview > 0 && reviewStatus !== "PENDING" && (
          <button
            type="button"
            onClick={() => {
              setLoad({ status: "loading" });
              setReviewStatus("PENDING");
              setStatus("");
              setPage(0);
            }}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-left text-sm text-amber-900 shadow-sm transition hover:bg-amber-100"
          >
            <span>
              <span className="font-semibold">
                {pendingReview} tin của nhà tuyển dụng đang chờ duyệt.
              </span>{" "}
              Tin chỉ hiện trên trang tuyển dụng sau khi được duyệt.
            </span>
            <span className="shrink-0 font-semibold">Xem ngay →</span>
          </button>
        )}
        <AdminStatusTabs
          tabs={TABS}
          value={status}
          counts={counts}
          onChange={filter(setStatus)}
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
                placeholder="Tìm theo tiêu đề, phòng ban..."
                aria-label="Tìm tin tuyển dụng"
                className="h-11 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-sm outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
              />
            </div>
            <Select
              value={jobTypeId}
              onChange={filter(setJobTypeId)}
              label="Loại công việc"
            >
              <option value="">Loại công việc: Tất cả</option>
              {jobTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.active === false ? " (đang ẩn)" : ""}
                </option>
              ))}
            </Select>
            <Select
              value={employmentType}
              onChange={(v) =>
                filter(setEmploymentType)(v as EmploymentType | "")
              }
              label="Hình thức"
            >
              <option value="">Hình thức: Tất cả</option>
              {(Object.keys(EMPLOYMENT_TYPE_LABEL) as EmploymentType[]).map(
                (t) => (
                  <option key={t} value={t}>
                    {EMPLOYMENT_TYPE_LABEL[t]}
                  </option>
                )
              )}
            </Select>
            <Select
              value={source}
              onChange={(v) =>
                filter(setSource)(v as "" | "employer" | "internal")
              }
              label="Nguồn tin"
            >
              <option value="">Nguồn: Tất cả</option>
              <option value="internal">Nội bộ Đất Việt</option>
              <option value="employer">Nhà tuyển dụng</option>
            </Select>
            <Select
              value={reviewStatus}
              onChange={(v) =>
                filter(setReviewStatus)(v as JobReviewStatus | "")
              }
              label="Trạng thái duyệt"
            >
              <option value="">Duyệt: Tất cả</option>
              {(Object.keys(JOB_REVIEW_META) as JobReviewStatus[]).map((r) => (
                <option key={r} value={r}>
                  {JOB_REVIEW_META[r].label}
                </option>
              ))}
            </Select>
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
                aria-label="Đang tải tin tuyển dụng"
              >
                {[0, 1, 2, 3].map((n) => (
                  <div key={n} className="h-14 rounded-xl bg-primary-50" />
                ))}
              </div>
            ) : load.status === "error" ? (
              <div role="alert" className="px-6 py-14 text-center">
                <p className="font-semibold text-heading">
                  Không tải được danh sách tin tuyển dụng
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
                  ? "Không có tin phù hợp với bộ lọc."
                  : "Chưa có tin tuyển dụng nào."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] text-left text-sm">
                  <thead className="bg-primary-50/60">
                    <tr>
                      <th className={TH}>Vị trí</th>
                      <th className={TH}>Nguồn</th>
                      <th className={TH}>Địa điểm</th>
                      <th className={TH}>Mức lương</th>
                      <th className={TH}>Hạn nộp</th>
                      <th className={TH}>Ứng viên</th>
                      <th className={TH}>Trạng thái</th>
                      <th className={TH} />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((j) => {
                      const meta = JOB_STATUS_META[j.status];
                      const expired =
                        j.deadline !== null &&
                        new Date(`${j.deadline}T23:59:59`) < new Date();
                      return (
                        <tr
                          key={j.id}
                          className="border-t border-line transition hover:bg-primary-50/40"
                        >
                          <td className="max-w-[320px] px-4 py-3">
                            <p
                              className="truncate font-semibold text-footer"
                              title={j.title}
                            >
                              {j.title}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-body">
                              {[
                                j.jobType?.name,
                                j.department,
                                j.employmentType &&
                                  EMPLOYMENT_TYPE_LABEL[j.employmentType],
                              ]
                                .filter(Boolean)
                                .join(" · ") || "—"}
                            </p>
                          </td>
                          <td className="max-w-[180px] px-4 py-3">
                            {j.company ? (
                              <>
                                <p
                                  className="truncate text-sm text-heading"
                                  title={j.company.name}
                                >
                                  {j.company.name}
                                </p>
                                <div className="mt-1">
                                  <JobReviewBadge status={j.reviewStatus} />
                                </div>
                              </>
                            ) : (
                              <span className="text-xs text-muted">Nội bộ</span>
                            )}
                          </td>
                          <td
                            className="max-w-[160px] truncate px-4 py-3 text-heading"
                            title={j.location ?? ""}
                          >
                            {j.location || "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-heading">
                            {formatSalary(
                              j.salaryMin,
                              j.salaryMax,
                              j.currency,
                              j.salaryNegotiable
                            )}
                          </td>
                          <td
                            className={`whitespace-nowrap px-4 py-3 ${
                              expired ? "text-danger" : "text-heading"
                            }`}
                          >
                            {j.deadline ? formatDate(j.deadline) : "Không hạn"}
                            {expired && (
                              <span className="block text-[11px]">
                                Đã quá hạn
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              to={`/admin/applications?jobId=${j.id}`}
                              title="Xem đơn ứng tuyển của tin này"
                              className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 transition hover:bg-primary-100"
                            >
                              <Users size={13} /> {j.applicationCount ?? 0}
                            </Link>
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
                                className={`appearance-none rounded-full border border-line bg-white py-1 pl-6 pr-7 text-xs font-semibold outline-none transition hover:border-primary-300 focus:border-primary-400 disabled:opacity-50 ${meta.text}`}
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
                            <div className="flex items-center justify-end gap-1.5">
                              {j.status === "OPEN" &&
                                j.reviewStatus !== "PENDING" &&
                                j.reviewStatus !== "REJECTED" && (
                                  <Link
                                    to={`/jobs/${j.id}`}
                                    target="_blank"
                                    aria-label={`Xem ${j.title}`}
                                    title="Xem trên website"
                                    className={`${btn} text-body hover:bg-primary-50`}
                                  >
                                    <Eye size={16} />
                                  </Link>
                                )}
                              <Link
                                to={`/admin/jobs/${j.id}/edit`}
                                aria-label={`Sửa ${j.title}`}
                                title={
                                  j.reviewStatus === "PENDING"
                                    ? "Duyệt tin"
                                    : "Sửa"
                                }
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

          {load.status === "ready" && total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs text-body">
              <p>
                Hiển thị {from}–{to} trong {total} tin
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

      {deleting && (
        <ConfirmDialog
          title="Xóa tin tuyển dụng?"
          message={`Bạn có chắc chắn muốn xóa "${deleting.title}" không?${
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
