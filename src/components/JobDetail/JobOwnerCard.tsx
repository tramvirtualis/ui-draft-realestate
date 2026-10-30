import RecruiterAvatar from "../Recruitment/RecruiterAvatar";
import CompanyLogo from "../Employer/CompanyLogo";
import type { JobCompany, JobRecruiter } from "../../types/job/job.types";

// Cột phải trang chi tiết: công ty đăng tin (tin nhà tuyển dụng) hoặc người đăng (tin nội bộ)
export default function JobOwnerCard({
  recruiter,
  company,
}: {
  recruiter?: JobRecruiter | null;
  company?: JobCompany | null;
}) {
  return (
    <section
      className="rounded-3xl border border-line bg-white p-6 shadow-sm"
      aria-labelledby="owner-title"
    >
      <h2 id="owner-title" className="text-lg font-medium text-heading">
        {company ? "Nhà tuyển dụng" : "Người tuyển dụng"}
      </h2>
      {company ? (
        <div className="mt-4 flex items-center gap-3">
          <CompanyLogo name={company.name} logoUrl={company.logoUrl} />

          <div className="min-w-0">
            <p
              className="truncate text-sm font-semibold text-heading"
              title={company.name}
            >
              {company.name}
            </p>
            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="truncate text-xs text-primary-700 hover:underline"
              >
                {company.website}
              </a>
            ) : (
              <p className="text-xs text-body">Nhà tuyển dụng đã xác minh</p>
            )}
          </div>
        </div>
      ) : (
        recruiter && (
          <div className="mt-4 flex items-center gap-3">
            <RecruiterAvatar recruiter={recruiter} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-heading">
                {recruiter.fullName}
              </p>
              <p className="text-xs text-body">Người phụ trách đăng tin</p>
            </div>
          </div>
        )
      )}
    </section>
  );
}
