import { X } from "lucide-react";
import { getFilterChips } from "../../utils/jobUtils";
import {
  DEFAULT_JOB_FILTER,
  type JobFilter,
  type JobType,
} from "../../types/job/job.types";

/** Hàng chip "Đang áp dụng" có nút xóa từng chip và "Xóa tất cả" */
export default function JobFilterChips({
  value,
  jobTypes,
  onApply,
}: {
  value: JobFilter;
  jobTypes: JobType[];
  onApply: (f: JobFilter) => void;
}) {
  const chips = getFilterChips(value, jobTypes);
  if (chips.length === 0) return null;

  return (
    <>
      <span className="text-xs text-muted">Đang áp dụng:</span>
      {chips.map((c) => (
        <span
          key={c.key}
          className="inline-flex items-center gap-1 rounded-full bg-primary-100 py-1 pl-3 pr-1.5 text-xs font-medium text-primary-700"
        >
          {c.label}
          <button
            type="button"
            onClick={() => onApply({ ...value, [c.key]: "" })}
            aria-label={`Xóa bộ lọc ${c.label}`}
            className="rounded-full p-0.5 hover:bg-primary-200"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => onApply(DEFAULT_JOB_FILTER)}
        className="text-xs font-medium text-danger hover:underline"
      >
        Xóa tất cả
      </button>
    </>
  );
}
