import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";
import ApplicationCard from "./ApplicationCard";
import { PAGE_SIZE } from "./applicationHistoryUtils";
import Pagination from "../common/Pagination";
import type { Application } from "../../types/applicationHistory.types";

// Danh sách "Hồ sơ gần đây": tiêu đề, thẻ hồ sơ, trạng thái rỗng và phân trang
export default function ApplicationList({
  items,
  page,
  onPageChange,
  onWithdraw,
  hasFilter,
  onClearFilter,
}: {
  items: Application[];
  // bắt đầu từ 0 (giống component Pagination chung)
  page: number;
  onPageChange: (page: number) => void;
  onWithdraw: (id: number) => void;
  hasFilter: boolean;
  onClearFilter: () => void;
}) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const visible = items.slice(start, start + PAGE_SIZE);

  return (
    <section aria-labelledby="recent-title">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="recent-title" className="text-lg font-semibold text-heading">
          Hồ sơ gần đây
        </h2>
        <span className="text-xs text-gray-400">{items.length} hồ sơ</span>
      </div>

      {items.length === 0 ? (
        <div
          role="status"
          className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-white py-16 text-center"
        >
          <Inbox size={40} className="text-primary-300" aria-hidden />
          <p className="mt-4 font-medium text-heading">
            {hasFilter
              ? "Không có hồ sơ phù hợp bộ lọc"
              : "Bạn chưa ứng tuyển vị trí nào"}
          </p>
          {hasFilter ? (
            <button
              type="button"
              onClick={onClearFilter}
              className="mt-5 rounded-full bg-primary-50 px-5 py-2 text-sm font-medium text-primary-600 hover:bg-primary-100"
            >
              Xóa bộ lọc
            </button>
          ) : (
            <Link
              to="/jobs"
              className="mt-5 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-2.5 text-sm font-medium text-white"
            >
              Tìm việc ngay
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {visible.map((item) => (
              <ApplicationCard
                key={item.id}
                item={item}
                onWithdraw={onWithdraw}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-body">
              Hiển thị {start + 1}–{start + visible.length} trong {items.length}{" "}
              hồ sơ
            </p>
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={onPageChange}
            />
          </div>
        </>
      )}
    </section>
  );
}
