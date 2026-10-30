import { Link } from "react-router-dom";
import JobCard from "../Recruitment/JobCard";
import useSavedJobs from "../../hooks/job/useSavedJobs";
import { useJobs } from "../../hooks/job/useJobs";
import { DEFAULT_JOB_FILTER, JOB_SORT } from "../../types/job/job.types";

const LIMIT = 3;

/** "Việc làm tương tự": tin cùng loại công việc (bỏ tin đang xem), kèm link xem tất cả */
export default function SimilarJobs({
  currentJobId,
  jobTypeId,
  jobTypeName,
}: {
  currentJobId: number;
  jobTypeId: number | null;
  jobTypeName: string;
}) {
  const { savedIds, toggle, loginPrompt } = useSavedJobs();
  // lấy dư 1 tin phòng trường hợp tin đang xem nằm trong kết quả
  const { result } = useJobs({
    filter: {
      ...DEFAULT_JOB_FILTER,
      jobTypeId: jobTypeId ? String(jobTypeId) : "",
    },
    sort: JOB_SORT.NEWEST,
    page: 0,
    size: LIMIT + 1,
  });

  const jobs = result.content
    .filter((j) => j.id !== currentJobId)
    .slice(0, LIMIT);
  if (jobs.length === 0) return null;

  return (
    <section
      className="rounded-3xl border border-line bg-white p-5 shadow-sm md:p-6"
      aria-labelledby="similar-title"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="similar-title" className="text-xl font-medium text-heading">
            Việc làm tương tự
          </h2>
          <p className="mt-1 text-sm text-body">
            Các vị trí {jobTypeName.toLowerCase()} khác đang tuyển.
          </p>
        </div>
        <Link
          to={jobTypeId ? `/jobs?type=${jobTypeId}` : "/jobs"}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="mt-5 space-y-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            saved={savedIds.includes(job.id)}
            onToggleSave={toggle}
          />
        ))}
      </div>
      {loginPrompt}
    </section>
  );
}
