import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Info } from "lucide-react";
import Breadcrumb from "../../components/common/Breadcrumb";
import JobForm from "../../components/Job/JobForm";
import JobReviewBadge from "../../components/Job/JobReviewBadge";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { employerJobService } from "../../services/job/employerService";
import { useJobTypes } from "../../hooks/job/useJobTypes";
import type { AdminJob, JobRequest } from "../../types/job/job.types";

// Đăng / sửa tin của nhà tuyển dụng: POST / PUT /api/employer/jobs. Lưu xong luôn chờ admin duyệt
export default function EmployerJobFormPage() {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();
  const toast = useToast();
  // Loại công việc công khai (đang hiển thị), nhà tuyển dụng không gọi được API admin
  const jobTypes = useJobTypes();
  const [job, setJob] = useState<AdminJob | null>(null);
  const [loading, setLoading] = useState(editId !== null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editId === null) return;
    employerJobService
      .get(editId)
      .then(setJob)
      .catch((err) => {
        toast.show(getErrorMessage(err), "error");
        navigate("/employer/jobs");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const submit = async (request: JobRequest) => {
    setSaving(true);
    try {
      if (editId === null) await employerJobService.add(request);
      else await employerJobService.edit(editId, request);
      toast.show("Đã gửi tin, vui lòng chờ quản trị viên duyệt");
      navigate("/employer/jobs");
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const title = editId === null ? "Đăng tin tuyển dụng" : "Sửa tin tuyển dụng";

  return (
    <>
      <title>{`${title} | Nhà tuyển dụng`}</title>
      <meta name="robots" content="noindex" />

      <Breadcrumb
        items={[
          { label: "Nhà tuyển dụng", to: "/employer/jobs" },
          { label: "Tin tuyển dụng", to: "/employer/jobs" },
          { label: title },
        ]}
      />
      <h1 className="mt-4 flex flex-wrap items-center gap-3 text-3xl font-semibold text-heading md:text-4xl">
        {title} {job && <JobReviewBadge status={job.reviewStatus} />}
      </h1>

      {job?.reviewStatus === "REJECTED" && job.reviewReason && (
        <p
          role="alert"
          className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Tin bị từ chối. Lý do: {job.reviewReason}. Sửa theo góp ý rồi lưu để
          gửi duyệt lại.
        </p>
      )}

      <JobForm
        jobTypes={jobTypes}
        job={job}
        loading={loading}
        saving={saving}
        cancelTo="/employer/jobs"
        submitLabel={
          editId === null ? "Gửi tin để duyệt" : "Lưu và gửi duyệt lại"
        }
        statusHint={'Chọn "Đang tuyển" để tin tự hiện ngay khi được duyệt'}
        className="mt-6 space-y-5"
        notice={
          <p className="flex items-start gap-2.5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <Info size={17} className="mt-0.5 shrink-0" aria-hidden />
            {job?.reviewStatus === "APPROVED"
              ? "Tin đang được duyệt sẵn. Lưu thay đổi sẽ tạm ẩn tin khỏi trang tuyển dụng cho tới khi quản trị viên duyệt lại."
              : "Tin sẽ được quản trị viên kiểm tra trước khi hiện trên trang tuyển dụng. Bạn sẽ nhận thông báo và email khi có kết quả."}
          </p>
        }
        onSubmit={submit}
      />
    </>
  );
}
