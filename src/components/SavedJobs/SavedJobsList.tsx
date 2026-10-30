import { Link } from "react-router-dom";
import { BookmarkX } from "lucide-react";
import JobCard from "../Recruitment/JobCard";
import Pagination from "../common/Pagination";
import type { SavedJob } from "../../types/job/job.types";

export const SAVED_PAGE_SIZE = 5;

/** Danh sách tin đã lưu (phân trang ở BE); tin đã đóng có nhãn riêng */
export default function SavedJobsList({
  items,
  page,
  totalPages,
  totalElements,
  onPageChange,
  onUnsave,
}: {
  items: SavedJob[];
  /** bắt đầu từ 0 (giống component Pagination chung) */
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onUnsave: (jobId: number) => void;
}) {
  if (items.length === 0) {
    return (
      <div
        role="status"
        className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-white py-20 text-center"
      >
        <BookmarkX size={40} className="text-primary-300" aria-hidden />
        <p className="mt-4 font-medium text-heading">
          Bạn chưa lưu tin tuyển dụng nào
        </p>
        <p className="mt-1 text-sm text-body">
          Bấm biểu tượng đánh dấu trên tin tuyển dụng để lưu lại xem sau.
        </p>
        <Link
          to="/jobs"
          className="mt-5 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-300/50"
        >
          Tìm việc ngay
        </Link>
      </div>
    );
  }

  const start = page * SAVED_PAGE_SIZE;

  return (
    <>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className={item.applicable ? "" : "opacity-70"}>
            {!item.applicable && (
              <p className="mb-1.5 ml-2 text-xs font-medium text-red-500">
                Tin này đã ngừng tuyển
              </p>
            )}
            <JobCard job={item.job} saved onToggleSave={onUnsave} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-body">
          Hiển thị {start + 1}–{start + items.length} trong {totalElements} tin
        </p>
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={onPageChange}
        />
      </div>
    </>
  );
}
