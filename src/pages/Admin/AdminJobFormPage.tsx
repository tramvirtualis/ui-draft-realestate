import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, Building2, XCircle } from "lucide-react";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import AdminModal from "../../components/Admin/AdminModal";
import JobForm from "../../components/Job/JobForm";
import JobReviewBadge from "../../components/Job/JobReviewBadge";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminJobService } from "../../services/job/adminJobService";
import { adminJobTypeService } from "../../services/job/adminJobTypeService";
import {
  selectIsSuperAdmin,
  selectPermissions,
  useAppSelector,
} from "../../store";
import { formatDate, formatTime } from "../../utils/formatDate";
import type { AdminJob, JobRequest, JobType } from "../../types/job/job.types";

const REJECT_SUGGESTIONS = [
  "Nội dung tin chưa rõ ràng hoặc thiếu mô tả công việc",
  "Mức lương / quyền lợi không minh bạch",
  "Tin có dấu hiệu lừa đảo hoặc thu phí ứng viên",
];

// Khối duyệt tin của nhà tuyển dụng (tin nội bộ không cần)
function ReviewPanel({
  job,
  onReviewed,
}: {
  job: AdminJob;
  onReviewed: (job: AdminJob) => void;
}) {
  const toast = useToast();
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const permissions = useAppSelector(selectPermissions);
  const canManage = isSuperAdmin || permissions.includes("JOB_MANAGE");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const review = async (status: "APPROVED" | "REJECTED", why?: string) => {
    setSaving(true);
    try {
      const updated = await adminJobService.review(job.id, status, why);
      onReviewed(updated);
      setRejecting(false);
      setReason("");
      toast.show(
        status === "APPROVED"
          ? "Đã duyệt tin, nhà tuyển dụng đã được thông báo"
          : "Đã từ chối tin, nhà tuyển dụng đã được thông báo"
      );
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm text-body">
            <Building2 size={16} className="text-primary-600" aria-hidden /> Tin
            của nhà tuyển dụng
          </p>
          <p className="mt-1 text-lg font-bold text-footer">
            {job.company?.name}
          </p>
          <p className="mt-1 text-xs text-body">
            Người đăng: {job.recruiter?.fullName ?? "—"} · Gửi lúc{" "}
            {formatTime(job.updatedAt)} · {formatDate(job.updatedAt)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <JobReviewBadge status={job.reviewStatus} />
            {job.company && (
              <Link
                to={`/admin/companies/${job.company.id}`}
                className="text-xs font-semibold text-primary-700 hover:underline"
              >
                Xem hồ sơ công ty
              </Link>
            )}
          </div>
          {job.reviewStatus === "REJECTED" && job.reviewReason && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              Lý do: {job.reviewReason}
            </p>
          )}
        </div>

        {canManage && (
          <div className="flex flex-wrap gap-2">
            {job.reviewStatus !== "APPROVED" && (
              <button
                type="button"
                onClick={() => review("APPROVED")}
                disabled={saving}
                className="flex h-11 items-center gap-2 rounded-xl bg-green-600 px-5 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-95 disabled:opacity-60"
              >
                <BadgeCheck size={17} /> Duyệt tin
              </button>
            )}
            {job.reviewStatus !== "REJECTED" && (
              <button
                type="button"
                onClick={() => setRejecting(true)}
                disabled={saving}
                className="flex h-11 items-center gap-2 rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 active:scale-95 disabled:opacity-60"
              >
                <XCircle size={17} />{" "}
                {job.reviewStatus === "APPROVED" ? "Gỡ tin" : "Từ chối"}
              </button>
            )}
          </div>
        )}
      </div>

      {rejecting && (
        <AdminModal
          title={
            job.reviewStatus === "APPROVED"
              ? "Gỡ tin tuyển dụng"
              : "Từ chối tin tuyển dụng"
          }
          onClose={() => !saving && setRejecting(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (reason.trim()) review("REJECTED", reason);
            }}
          >
            <div className="space-y-3 p-6">
              <label className="block text-sm font-semibold text-heading">
                Lý do <span className="text-danger">*</span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  maxLength={500}
                  autoFocus
                  placeholder="Lý do sẽ được gửi cho nhà tuyển dụng qua thông báo và email"
                  className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm font-normal outline-none focus:border-primary-600"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {REJECT_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReason(s)}
                    className="rounded-full border border-line px-3 py-1 text-xs text-body transition hover:border-primary-300 hover:text-primary-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => setRejecting(false)}
                className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50 disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                disabled={saving || !reason.trim()}
                className="rounded-lg bg-danger px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-60"
              >
                {saving
                  ? "Đang lưu..."
                  : job.reviewStatus === "APPROVED"
                  ? "Gỡ tin"
                  : "Từ chối"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </section>
  );
}

export default function AdminJobFormPage() {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();
  const toast = useToast();
  const [job, setJob] = useState<AdminJob | null>(null);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(editId !== null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminJobTypeService
      .all()
      .then(setJobTypes)
      .catch(() => toast.show("Không tải được loại công việc", "error"));
  }, []);

  useEffect(() => {
    if (editId === null) return;
    adminJobService
      .get(editId)
      .then(setJob)
      .catch((err) => {
        toast.show(getErrorMessage(err), "error");
        navigate("/admin/jobs");
      })
      .finally(() => setLoading(false));
  }, [editId]);

  const submit = async (request: JobRequest) => {
    setSaving(true);
    try {
      if (editId === null) await adminJobService.add(request);
      else await adminJobService.edit(editId, request);
      toast.show(
        editId === null
          ? "Đã đăng tin tuyển dụng"
          : "Đã cập nhật tin tuyển dụng"
      );
      navigate("/admin/jobs");
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const title =
    editId === null
      ? "Đăng tin tuyển dụng"
      : job?.company
      ? "Duyệt / sửa tin tuyển dụng"
      : "Sửa tin tuyển dụng";

  return (
    <>
      <AdminPageHeader
        breadcrumb={[
          { label: "Tổng quan", to: "/admin/dashboard" },
          { label: "Tin tuyển dụng", to: "/admin/jobs" },
          { label: title },
        ]}
        title={title}
      />
      <div className="-mt-16 space-y-5 px-4 pb-10 md:px-8">
        {job?.company && <ReviewPanel job={job} onReviewed={setJob} />}
        <JobForm
          jobTypes={jobTypes}
          job={job}
          loading={loading}
          saving={saving}
          cancelTo="/admin/jobs"
          onSubmit={submit}
          statusHint={
            job?.company
              ? '"Đang tuyển" và đã duyệt mới hiện trên trang tuyển dụng. Admin sửa không làm đổi trạng thái duyệt.'
              : undefined
          }
        />
      </div>
    </>
  );
}
