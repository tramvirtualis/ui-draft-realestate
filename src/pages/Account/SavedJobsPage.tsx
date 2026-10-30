import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import Breadcrumb from "../../components/common/Breadcrumb";
import useSavedJobs from "../../hooks/job/useSavedJobs";
import SavedJobsList, {
  SAVED_PAGE_SIZE,
} from "../../components/SavedJobs/SavedJobsList";
import { useMySavedJobs } from "../../hooks/job/useMySavedJobs";

const TITLE = "Tin tuyển dụng đã lưu | NovaLand Hub";

/** Trang "Tin tuyển dụng đã lưu" trong khu vực tài khoản: GET /me/saved-jobs (phân trang ở BE) */
export default function SavedJobsPage() {
  const { toggle } = useSavedJobs();
  const [page, setPage] = useState(0);
  const { result, loading, error, reload } = useMySavedJobs(
    page,
    SAVED_PAGE_SIZE
  );

  const handleUnsave = async (jobId: number) => {
    if (!(await toggle(jobId))) return;
    // bỏ tin cuối cùng của trang (không phải trang đầu) thì lùi về trang trước
    if (result.content.length === 1 && page > 0) setPage(page - 1);
    else reload();
  };

  return (
    <>
      <title>{TITLE}</title>
      <meta name="robots" content="noindex" />

      <Breadcrumb
        items={[
          { label: "Tài khoản", to: "/account" },
          { label: "Tin tuyển dụng đã lưu" },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-heading md:text-4xl">
            Tin tuyển dụng đã lưu
          </h1>
          <p className="mt-2 text-sm text-body">
            {result.totalElements > 0
              ? `${result.totalElements} tin bạn đã lưu để xem lại sau.`
              : "Những tin bạn lưu sẽ hiển thị tại đây."}
          </p>
        </div>
        <Link
          to="/jobs"
          className="flex h-11 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-medium text-white shadow-lg shadow-primary-300/50 transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <Search size={15} aria-hidden /> Tìm việc mới
        </Link>
      </div>

      <div className="mt-6">
        {loading ? (
          <div
            className="space-y-4"
            aria-busy="true"
            aria-label="Đang tải tin đã lưu"
          >
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-60 animate-pulse rounded-3xl bg-primary-50/60"
              />
            ))}
          </div>
        ) : error ? (
          <p
            role="alert"
            className="rounded-3xl bg-red-50 px-6 py-10 text-center text-sm text-red-500"
          >
            {error}
          </p>
        ) : (
          <SavedJobsList
            items={result.content}
            page={page}
            totalPages={result.totalPages}
            totalElements={result.totalElements}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onUnsave={handleUnsave}
          />
        )}
      </div>
    </>
  );
}
