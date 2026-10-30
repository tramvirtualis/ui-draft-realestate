import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import JobFilterFields from "./JobFilterFields";
import JobFilterChips from "./JobFilterChips";
import { getFilterChips } from "../../utils/jobUtils";
import JobFilterSheet from "./JobFilterSheet";
import type { JobFilter, JobType } from "../../types/job/job.types";

const applyClass =
  "flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-6 text-sm font-medium text-white shadow-lg shadow-primary-300/50 transition hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600";

/**
 * Thanh bộ lọc: chỉnh nháp, chỉ khi bấm "Áp dụng bộ lọc" mới gửi lên trang cha.
 * Mobile: thu vào nút "Bộ lọc" và mở bottom sheet.
 * Trang cha đặt `key` theo filter để nháp được reset khi URL đổi.
 */
export default function JobFilterBar({
  value,
  jobTypes,
  onApply,
}: {
  value: JobFilter;
  jobTypes: JobType[];
  onApply: (f: JobFilter) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);

  const patch = (p: Partial<JobFilter>) => setDraft((d) => ({ ...d, ...p }));
  const chipCount = getFilterChips(value, jobTypes).length;

  const submit = () => {
    onApply(draft);
    setOpen(false);
  };

  return (
    <div className="rounded-3xl border border-primary-100 bg-primary-50/60 p-4 md:p-5">
      {/* Mobile: nút mở bộ lọc */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary-100 bg-white text-sm font-medium text-heading md:hidden"
      >
        <SlidersHorizontal size={16} aria-hidden /> Bộ lọc
        {chipCount > 0 && (
          <span className="rounded-full bg-primary-600 px-2 text-xs text-white">
            {chipCount}
          </span>
        )}
      </button>

      {/* Tablet / desktop */}
      <form
        className="hidden md:block"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <JobFilterFields draft={draft} jobTypes={jobTypes} onChange={patch} />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <JobFilterChips value={value} jobTypes={jobTypes} onApply={onApply} />
          <button type="submit" className={`${applyClass} ml-auto`}>
            <SlidersHorizontal size={16} aria-hidden /> Áp dụng bộ lọc
          </button>
        </div>
      </form>

      {/* Mobile: chip đang chọn */}
      {chipCount > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 md:hidden">
          <JobFilterChips value={value} jobTypes={jobTypes} onApply={onApply} />
        </div>
      )}

      {open && (
        <JobFilterSheet onClose={() => setOpen(false)} onApply={submit}>
          <JobFilterFields draft={draft} jobTypes={jobTypes} onChange={patch} />
        </JobFilterSheet>
      )}
    </div>
  );
}
