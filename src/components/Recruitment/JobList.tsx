import { AlertCircle, SearchX } from "lucide-react";
import JobCard from "./JobCard";
import Pagination from "../common/Pagination";
import type { Job } from "../../types/job/job.types";

type JobListProps = {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onReset: () => void;
  savedIds: number[];
  onToggleSave: (id: number) => void;
};

/** Cột trái: danh sách card, trạng thái rỗng và phân trang */
export default function JobList({
  jobs,
  loading,
  error,
  page,
  totalPages,
  onPageChange,
  onReset,
  savedIds,
  onToggleSave,
}: JobListProps) {
  return (
    <div>
      {loading ? (
        <div
          className="space-y-4"
          aria-busy="true"
          aria-label="Đang tải việc làm"
        >
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-60 animate-pulse rounded-3xl border border-line bg-primary-50/40"
            />
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="flex flex-col items-center rounded-3xl border border-dashed border-red-200 bg-white py-16 text-center"
        >
          <AlertCircle size={40} className="text-red-300" aria-hidden />
          <p className="mt-4 font-medium text-heading">
            Không tải được danh sách việc làm
          </p>
          <p className="mt-1 text-sm text-body">{error}</p>
        </div>
      ) : jobs.length === 0 ? (
        <div
          role="status"
          className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-white py-16 text-center"
        >
          <SearchX size={40} className="text-primary-300" aria-hidden />
          <p className="mt-4 font-medium text-heading">
            Không tìm thấy việc làm phù hợp
          </p>
          <p className="mt-1 text-sm text-body">
            Thử đổi từ khóa hoặc bỏ bớt bộ lọc.
          </p>
          <button
            onClick={onReset}
            className="mt-5 rounded-full bg-primary-50 px-5 py-2 text-sm font-medium text-primary-600 hover:bg-primary-100"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved={savedIds.includes(job.id)}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      )}

      <div className="mt-8">
        {!loading && !error && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}
