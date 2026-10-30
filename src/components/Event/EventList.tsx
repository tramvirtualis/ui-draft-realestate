import type { ReactNode } from "react";
import { CalendarX, CircleAlert, RotateCcw } from "lucide-react";
import EventCard from "./EventCard";
import EventCardSkeleton from "./EventCardSkeleton";
import Pagination from "../common/Pagination";
import {
  EVENT_SORT_LABEL,
  type Event,
  type EventSort,
} from "../../types/event/event.types";

type EventListProps = {
  events: Event[];
  total: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  sort: EventSort;
  onSortChange: (sort: EventSort) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onReset: () => void;
  filterBar?: ReactNode;
};

export default function EventList({
  events,
  total,
  loading,
  error,
  onRetry,
  sort,
  onSortChange,
  page,
  totalPages,
  onPageChange,
  onReset,
  filterBar,
}: EventListProps) {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container mx-auto max-w-5xl px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-heading md:text-4xl">Lịch sự kiện</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-body">
            Theo dõi các sự kiện sắp tới và đăng ký sớm để giữ chỗ tham dự.
          </p>
        </div>

        <div className="mt-8">{filterBar}</div>

        <div className="mb-8 mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-heading">
            {loading ? "Đang tải sự kiện..." : error ? "Không tải được sự kiện" : `${total} sự kiện`}
          </p>

          <label className="flex w-fit items-center gap-2 rounded-full border border-line px-4 py-2 text-sm">
            <span className="text-body">Sắp xếp:</span>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as EventSort)}
              className="bg-transparent font-medium text-heading outline-none"
            >
              {Object.entries(EVENT_SORT_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div>
            {Array.from({ length: 4 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-danger/40 bg-danger/5 py-16 text-center">
            <CircleAlert size={40} className="text-danger" />
            <p className="mt-4 font-medium text-heading">{error}</p>
            <p className="mt-1 text-sm text-body">
              Vui lòng kiểm tra kết nối và thử lại.
            </p>
            <button
              onClick={onRetry}
              className="mt-5 flex items-center gap-1.5 rounded-full bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              <RotateCcw size={15} /> Thử lại
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-line py-16 text-center">
            <CalendarX size={40} className="text-primary-300" />
            <p className="mt-4 font-medium text-heading">
              Không tìm thấy sự kiện phù hợp
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
          <div>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={onPageChange}
            />
          </div>
        )}
      </div>
    </section>
  );
}
