import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { formatSalary } from "../../utils/jobUtils";
import type { Job } from "../../types/job/job.types";

/** "Việc làm mới đăng": danh sách gọn ở sidebar */
export default function SuggestedJobs({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) return null;

  return (
    <section
      className="rounded-3xl border border-line bg-white p-6 shadow-sm"
      aria-labelledby="suggested-heading"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 id="suggested-heading" className="text-lg font-medium text-heading">
          Việc làm mới đăng
        </h2>
        <Link
          to="/jobs"
          className="text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          Xem tất cả
        </Link>
      </div>

      <ul className="space-y-4">
        {jobs.map((job) => (
          <li key={job.id}>
            <Link
              to={`/jobs/${job.id}`}
              className="group flex items-center gap-3"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <Briefcase size={18} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-heading group-hover:text-primary-600">
                  {job.title}
                </p>
                <p className="truncate text-xs text-muted">
                  {formatSalary(
                    job.salaryMin,
                    job.salaryMax,
                    job.currency,
                    job.salaryNegotiable
                  )}
                  {job.location && ` · ${job.location}`}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
