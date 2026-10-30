import { UserRound } from "lucide-react";
import ApplyButton from "./ApplyButton";
import SaveJobButton from "./SaveJobButton";
import type { JobDetailData } from "../../types/job/jobDetail.types";

export default function ApplySummaryCard({
  job,
  applied,
  onApply,
  saved,
  onToggleSave,
}: {
  job: JobDetailData;
  applied: boolean;
  onApply: () => void;
  saved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <section
      className="rounded-3xl border border-line bg-white p-6 shadow-sm"
      aria-labelledby="apply-summary-title"
    >
      <h2 id="apply-summary-title" className="text-lg font-medium text-heading">
        Thông tin ứng tuyển
      </h2>

      <div className="mt-4 rounded-2xl bg-primary-50 px-4 py-3">
        <p className="text-[11px] uppercase tracking-wide text-gray-400">
          Thu nhập dự kiến
        </p>
        <p className="mt-0.5 text-xl font-medium text-primary-600">
          {job.salaryText}
        </p>
      </div>

      <p className="mt-4 text-sm text-body">Hạn nộp {job.deadlineDate}</p>
      <div className="mt-2 flex justify-between text-xs">
        <span className="font-medium text-heading">{job.daysLeftText}</span>
        <span className="text-gray-400">
          {job.publishedText.replace("Đăng ngày", "Đăng")}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Thời gian đã trôi đến hạn nộp"
        aria-valuenow={job.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-primary-100"
      >
        <div
          className="h-full rounded-full bg-primary-600"
          style={{ width: `${job.progressPercent}%` }}
        />
      </div>

      <p className="mt-4 flex items-center gap-2 text-sm text-body">
        <UserRound size={15} className="text-gray-400" aria-hidden /> Số lượng
        tuyển: {job.quantity}
      </p>

      <ApplyButton
        applied={applied}
        onApply={onApply}
        className="mt-5 h-12 w-full"
      />
      <SaveJobButton saved={saved} onToggle={onToggleSave} />
    </section>
  );
}
