import { Link } from "react-router-dom";
import { BookmarkCheck, FileText } from "lucide-react";
import useSavedJobs from "../../hooks/job/useSavedJobs";
import { JOB_SORT_LABEL, type JobSort } from "../../types/job/job.types";

/** Tiêu đề khu vực danh sách + tổng số việc làm, sắp xếp, nút tạo CV */
export default function JobListHeader({
  total,
  sort,
  onSortChange,
}: {
  total: number;
  sort: JobSort;
  onSortChange: (sort: JobSort) => void;
}) {
  const { savedIds } = useSavedJobs();

  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 className="text-2xl font-medium text-heading md:text-3xl">
          Việc làm phù hợp với năng lực của bạn
        </h2>
        <p className="mt-1 text-sm text-body">
          Đối chiếu rõ dự án, cơ chế hoa hồng và lộ trình thăng tiến trước khi
          ứng tuyển.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <p className="text-sm text-body">
          <span className="font-semibold text-heading">
            {total.toLocaleString("vi-VN")}
          </span>{" "}
          việc làm đang tuyển
        </p>

        <label className="block">
          <span className="sr-only">Sắp xếp</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as JobSort)}
            className="h-11 rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            {Object.entries(JOB_SORT_LABEL).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <Link
          to="/jobs/create-cv"
          className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-6 text-sm font-medium text-white shadow-lg shadow-primary-300/50 transition hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <FileText size={16} aria-hidden /> Tạo CV miễn phí
        </Link>
      </div>
    </div>
  );
}
