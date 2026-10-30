import JobFilterBar from "./JobFilterBar";
import JobListHeader from "./JobListHeader";
import JobList from "./JobList";
import JobSidebar from "./JobSidebar";
import useJobFilterParams from "../../hooks/job/useJobFilterParams";
import useSavedJobs from "../../hooks/job/useSavedJobs";
import { useJobs } from "../../hooks/job/useJobs";
import { useJobTypes } from "../../hooks/job/useJobTypes";

const PAGE_SIZE = 5;

/** Khu vực danh sách việc làm: bộ lọc + danh sách (đồng bộ URL) + sidebar */
export default function JobListSection() {
  const { filter, sort, page, setFilter, resetFilter, setSort, setPage } =
    useJobFilterParams();
  const { savedIds, toggle, loginPrompt } = useSavedJobs();
  const jobTypes = useJobTypes();
  const { result, loading, error } = useJobs({
    filter,
    sort,
    page,
    size: PAGE_SIZE,
  });

  const handlePageChange = (p: number) => {
    setPage(p);
    document.getElementById("job-list")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="job-list" className="scroll-mt-24 bg-white py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <JobListHeader
          total={result.totalElements}
          sort={sort}
          onSortChange={setSort}
        />

        {/* key theo filter để bản nháp trong thanh lọc được reset khi URL đổi */}
        <JobFilterBar
          key={JSON.stringify(filter)}
          value={filter}
          jobTypes={jobTypes}
          onApply={setFilter}
        />

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[2fr_1fr]">
          <JobList
            jobs={result.content}
            loading={loading}
            error={error}
            page={page}
            totalPages={result.totalPages}
            onPageChange={handlePageChange}
            onReset={resetFilter}
            savedIds={savedIds}
            onToggleSave={toggle}
          />
          <JobSidebar />
        </div>
      </div>
      {loginPrompt}
    </section>
  );
}
