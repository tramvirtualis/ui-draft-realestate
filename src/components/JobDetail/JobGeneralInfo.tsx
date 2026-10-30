import {
  Award,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { JobDetailData } from "../../types/job/jobDetail.types";

/** "Thông tin chung": lưới 2 cột x 4 hàng */
export default function JobGeneralInfo({ job }: { job: JobDetailData }) {
  const rows: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Briefcase, label: "Loại công việc", value: job.jobTypeName },
    { icon: Clock, label: "Hình thức", value: job.employmentTypeLabel },
    { icon: Award, label: "Cấp bậc", value: job.levelLabel },
    { icon: Building2, label: "Phòng ban", value: job.department },
    { icon: CheckCircle2, label: "Kinh nghiệm", value: job.experience },
    { icon: Users, label: "Số lượng tuyển", value: job.quantity },
    { icon: MapPin, label: "Địa điểm", value: job.location },
    { icon: CalendarDays, label: "Hạn nộp", value: job.deadlineDate },
  ];

  return (
    <section
      className="rounded-3xl border border-line bg-white p-6 shadow-sm md:p-8"
      aria-labelledby="job-general-title"
    >
      <h2 id="job-general-title" className="text-xl font-medium text-heading">
        Thông tin chung
      </h2>
      <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <Icon
              size={16}
              className="mt-1 shrink-0 text-gray-400"
              aria-hidden
            />
            <div>
              <dt className="text-xs text-gray-400">{label}</dt>
              <dd className="text-sm font-semibold text-heading">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
