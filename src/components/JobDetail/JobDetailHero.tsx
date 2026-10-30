import { Briefcase, CheckCircle2, Clock, MapPin, Users } from "lucide-react";
import ApplyButton from "./ApplyButton";
import SaveJobButton from "./SaveJobButton";
import CompanyLogo from "../Employer/CompanyLogo";
import type { JobDetailData } from "../../types/job/jobDetail.types";
import type { JobCompany } from "../../types/job/job.types";

/** Thẻ đầu trang: badge, tiêu đề, thu nhập, thông tin nhanh và nút ứng tuyển  */
export default function JobDetailHero({
  job,
  applied,
  onApply,
  saved,
  onToggleSave,
  company,
}: {
  job: JobDetailData;
  // Công ty đăng tin (tin nhà tuyển dụng); null = tin nội bộ, không hiện logo
  company?: JobCompany | null;
  applied: boolean;
  onApply: () => void;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const meta = [
    { icon: MapPin, text: job.location },
    { icon: Briefcase, text: job.department },
    { icon: CheckCircle2, text: `Kinh nghiệm ${job.experience}` },
    { icon: Users, text: `Số lượng tuyển: ${job.quantity}` },
  ];

  return (
    <section
      className="rounded-3xl border border-line bg-white p-6 shadow-sm md:p-8"
      aria-labelledby="job-title"
    >
      <div className="flex items-start justify-between gap-4">
        {company && (
          <CompanyLogo
            name={company.name}
            logoUrl={company.logoUrl}
            className="h-16 w-16 md:h-20 md:w-20"
            textSize="text-lg"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
              {job.jobTypeName}
            </span>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
              {job.statusLabel}
            </span>
          </div>
          <h1
            id="job-title"
            className="mt-3 text-2xl font-semibold leading-tight text-heading md:text-3xl"
          >
            {job.title}
          </h1>
          {company && (
            <p className="mt-1 truncate text-base font-semibold text-primary-600" title={company.name}>
              {company.name}
            </p>
          )}
          <p className="mt-2 text-xs text-body">
            {job.department} · {job.publishedText} · {job.updatedText}
          </p>
        </div>
        <SaveJobButton variant="icon" saved={saved} onToggle={onToggleSave} />
      </div>

      <div className="mt-6 rounded-2xl bg-primary-50 px-5 py-4">
        <p className="text-[11px] uppercase tracking-wide text-gray-400">
          Thu nhập dự kiến
        </p>
        <p className="mt-1 text-2xl font-medium text-primary-600 md:text-3xl">
          {job.salaryText}
        </p>
      </div>

      <ul className="mt-5 grid gap-3 text-sm text-body sm:grid-cols-2 lg:grid-cols-4">
        {meta.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2">
            <Icon size={15} className="shrink-0 text-gray-400" aria-hidden />
            {text}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
        <p className="flex items-center gap-2 text-sm text-body">
          <Clock size={16} className="text-amber-500" aria-hidden />
          Hạn nộp {job.deadlineDate} · {job.daysLeftText}
        </p>
        <ApplyButton
          applied={applied}
          onApply={onApply}
          className="h-12 min-w-48 px-6"
        />
      </div>
    </section>
  );
}
