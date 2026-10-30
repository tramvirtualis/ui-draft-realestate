import {
  EMPLOYMENT_TYPE_LABEL,
  EXPERIENCE_LEVEL_LABEL,
  type Job,
} from "../../types/job/job.types";
import type {
  JobDetailData,
  JobDetailSection,
} from "../../types/job/jobDetail.types";
import { formatDate } from "../../utils/formatDate";
import {
  daysLeft,
  deadlineTime,
  formatSalary,
  formatUpdated,
} from "../../utils/jobUtils";

const NONE = "Không yêu cầu";

// Mô tả từ BE là văn bản nhiều dòng → mỗi dòng một gạch đầu dòng (bỏ ký hiệu "-", "•" ở đầu dòng)
const toItems = (text?: string | null): string[] =>
  (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-•*+]\s*/, "").trim())
    .filter(Boolean);

/** Ghép dữ liệu một tin tuyển dụng thành các chuỗi hiển thị cho trang chi tiết */
export function buildJobDetail(job: Job): JobDetailData {
  const salaryText = formatSalary(
    job.salaryMin,
    job.salaryMax,
    job.currency,
    job.salaryNegotiable
  );
  const deadline = job.deadline ? deadlineTime(job.deadline) : null;
  const isOpen =
    job.status === "OPEN" && (deadline === null || deadline >= Date.now());
  const left = daysLeft(job.deadline);

  const publishedAt = job.publishedAt ?? job.createdAt;
  const start = new Date(publishedAt).getTime();
  const progress =
    deadline && deadline > start
      ? ((Date.now() - start) / (deadline - start)) * 100
      : 0;

  const updated = formatUpdated(job.updatedAt);

  const sections: JobDetailSection[] = [
    { heading: "Mô tả công việc", items: toItems(job.description) },
    { heading: "Yêu cầu ứng viên", items: toItems(job.requirements) },
    { heading: "Quyền lợi", items: toItems(job.benefits) },
  ].filter((s) => s.items.length > 0);

  return {
    id: job.id,
    title: job.title,
    jobTypeName: job.jobType?.name ?? "Việc làm",
    employmentTypeLabel: job.employmentType
      ? EMPLOYMENT_TYPE_LABEL[job.employmentType]
      : "—",
    levelLabel: job.experienceLevel
      ? EXPERIENCE_LEVEL_LABEL[job.experienceLevel]
      : "—",
    statusLabel: isOpen ? "Đang tuyển" : "Đã đóng",
    isOpen,
    department: job.department || "—",
    publishedText: `Đăng ngày ${formatDate(publishedAt)}`,
    updatedText: updated.charAt(0).toUpperCase() + updated.slice(1),
    salaryText,
    location: job.location || "—",
    experience: job.experience || NONE,
    quantity: job.quantity ? `${job.quantity} người` : "Không giới hạn",
    deadlineDate: job.deadline
      ? formatDate(`${job.deadline}T00:00:00`)
      : "Không giới hạn",
    daysLeftText: !isOpen
      ? "Đã hết hạn"
      : left === null
      ? "Không giới hạn"
      : `Còn ${left} ngày`,
    progressPercent: Math.round(Math.min(100, Math.max(0, progress))),
    sections,
  };
}
