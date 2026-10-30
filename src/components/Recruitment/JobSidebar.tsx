import SuggestedJobs from "./SuggestedJobs";
import { useJobs } from "../../hooks/job/useJobs";
import { DEFAULT_JOB_FILTER, JOB_SORT } from "../../types/job/job.types";

/** Cột phải trang Tuyển dụng (sticky trên desktop): tin mới đăng */
export default function JobSidebar() {
  const { result } = useJobs({
    filter: DEFAULT_JOB_FILTER,
    sort: JOB_SORT.NEWEST,
    page: 0,
    size: 5,
  });

  return (
    <aside className="space-y-5 lg:sticky lg:top-24">
      <SuggestedJobs jobs={result.content} />
    </aside>
  );
}
