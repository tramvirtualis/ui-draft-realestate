import {
  EMPLOYMENT_TYPE_LABEL,
  EXPERIENCE_LEVEL_LABEL,
  LOCATION_LABEL,
  type JobFilter,
  type JobType,
} from "../types/job/job.types";

const MILLION = 1_000_000;

const toAmount = (value: number, currency: string): string => {
  if (currency !== "VND") return value.toLocaleString("vi-VN");
  const million = value >= MILLION ? value / MILLION : value;
  return million.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
};

/**
 * VND: "35–80 triệu/tháng", "Từ 35 triệu", "Đến 80 triệu".
 * Không có lương hoặc negotiable: "Thỏa thuận".
 */
export const formatSalary = (
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string | null = "VND",
  negotiable: boolean = false
): string => {
  const cur = currency || "VND";
  const hasMin = typeof min === "number" && min > 0;
  const hasMax = typeof max === "number" && max > 0;
  if (negotiable || (!hasMin && !hasMax)) return "Thỏa thuận";

  const unit = cur === "VND" ? "triệu" : cur;
  if (hasMin && hasMax)
    return `${toAmount(min, cur)}–${toAmount(max, cur)} ${unit}/tháng`;
  return hasMin
    ? `Từ ${toAmount(min!, cur)} ${unit}`
    : `Đến ${toAmount(max!, cur)} ${unit}`;
};

/** "cập nhật hôm nay" / "cập nhật hôm qua" / "cập nhật 3 ngày trước" */
export const formatUpdated = (iso: string): string => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "cập nhật hôm nay";
  if (days === 1) return "cập nhật hôm qua";
  return `cập nhật ${days} ngày trước`;
};

/** Hết ngày hạn nộp (deadline là yyyy-MM-dd) */
export const deadlineTime = (date: string): number =>
  new Date(`${date}T23:59:59`).getTime();

/** Số ngày còn lại tới hạn nộp (0 nếu đã hết hạn); null nếu tin không có hạn */
export const daysLeft = (date: string | null): number | null =>
  date
    ? Math.max(0, Math.ceil((deadlineTime(date) - Date.now()) / 86_400_000))
    : null;

/** Danh sách chip các bộ lọc đang áp dụng */
export function getFilterChips(
  f: JobFilter,
  jobTypes: JobType[]
): { key: keyof JobFilter; label: string }[] {
  const chips: { key: keyof JobFilter; label: string }[] = [];
  if (f.keyword) chips.push({ key: "keyword", label: f.keyword });
  if (f.jobTypeId)
    chips.push({
      key: "jobTypeId",
      label:
        jobTypes.find((t) => String(t.id) === f.jobTypeId)?.name ??
        "Loại công việc",
    });
  if (f.employmentType)
    chips.push({
      key: "employmentType",
      label: EMPLOYMENT_TYPE_LABEL[f.employmentType],
    });
  if (f.experienceLevel)
    chips.push({
      key: "experienceLevel",
      label: EXPERIENCE_LEVEL_LABEL[f.experienceLevel],
    });
  if (f.location)
    chips.push({
      key: "location",
      label: LOCATION_LABEL[f.location] ?? f.location,
    });
  return chips;
}
