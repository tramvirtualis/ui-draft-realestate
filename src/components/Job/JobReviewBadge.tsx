import {
  JOB_REVIEW_META,
  type JobReviewStatus,
} from "../../types/job/job.types";

// Nhãn trạng thái duyệt tin (Chờ duyệt / Đã duyệt / Bị từ chối)
export default function JobReviewBadge({
  status,
}: {
  status?: JobReviewStatus;
}) {
  if (!status) return null;
  const meta = JOB_REVIEW_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.label}
    </span>
  );
}
