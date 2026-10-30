import { useState } from "react";
import ApplicationHistoryHeader from "../../components/ApplicationHistory/ApplicationHistoryHeader";
import ApplicationStats from "../../components/ApplicationHistory/ApplicationStats";
import UpcomingInterviewCard from "../../components/ApplicationHistory/UpcomingInterviewCard";
import ApplicationTabs from "../../components/ApplicationHistory/ApplicationTabs";
import ApplicationToolbar from "../../components/ApplicationHistory/ApplicationToolbar";
import ApplicationList from "../../components/ApplicationHistory/ApplicationList";
import ToastProvider from "../../components/common/Toast";
import { useToast } from "../../components/common/toastContext";
import {
  countByStatus,
  filterApplications,
  getUpcomingInterviews,
  jobTitleOf,
  type ApplicationQuery,
} from "../../components/ApplicationHistory/applicationHistoryUtils";
import { useMyApplications } from "../../hooks/job/useMyApplications";
import { getErrorMessage } from "../../api/http";

const TITLE = "Lịch sử ứng tuyển | NovaLand Hub";
const DEFAULT_QUERY: ApplicationQuery = { status: "ALL", keyword: "", range: "3m", sort: "NEWEST" };

/** Lịch sử ứng tuyển của người đang đăng nhập (route đã bọc ProtectedRoute) */
function ApplicationHistory() {
  const toast = useToast();
  const { items, loading, error, withdraw } = useMyApplications();
  const [query, setQuery] = useState<ApplicationQuery>(DEFAULT_QUERY);
  const [page, setPage] = useState(0);

  const update = (patch: Partial<ApplicationQuery>) => {
    setQuery((q) => ({ ...q, ...patch }));
    setPage(0);
  };

  const filtered = filterApplications(items, query);
  const counts = countByStatus(items);
  const hasFilter = query.status !== "ALL" || query.keyword !== "" || query.range !== DEFAULT_QUERY.range;

  const handleWithdraw = async (id: number) => {
    const target = items.find((a) => a.id === id);
    if (!target || !window.confirm(`Rút hồ sơ ứng tuyển "${jobTitleOf(target)}"?`)) return;
    try {
      await withdraw(id);
      toast.show("Đã rút hồ sơ");
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    }
  };

  const interview = getUpcomingInterviews(items)[0] ?? null;

  return (
    <>
      <title>{TITLE}</title>
      <meta name="robots" content="noindex" />

      {/* Khung tài khoản (sidebar, bố cục) do AccountLayout cung cấp */}
      <div className="space-y-5">
        <ApplicationHistoryHeader />
        <ApplicationStats items={items} />
        <UpcomingInterviewCard interview={interview} />

        <ApplicationTabs value={query.status} counts={counts} onChange={(status) => update({ status })} />
        <ApplicationToolbar
          keyword={query.keyword}
          onKeywordChange={(keyword) => update({ keyword })}
          range={query.range}
          onRangeChange={(range) => update({ range })}
          sort={query.sort}
          onSortChange={(sort) => update({ sort })}
        />

        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Đang tải hồ sơ">
            {[0, 1].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-3xl bg-primary-50/60" />
            ))}
          </div>
        ) : error ? (
          <p role="alert" className="rounded-3xl bg-red-50 px-6 py-10 text-center text-sm text-red-500">
            {error}
          </p>
        ) : (
        <ApplicationList
          items={filtered}
          page={page}
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onWithdraw={handleWithdraw}
          hasFilter={hasFilter}
          onClearFilter={() => update({ status: "ALL", keyword: "", range: DEFAULT_QUERY.range })}
        />
        )}
      </div>
    </>
  );
}

export default function ApplicationHistoryPage() {
  return (
    <ToastProvider>
      <ApplicationHistory />
    </ToastProvider>
  );
}
