import type { JobRecruiter } from "../../types/job/job.types";

// "Bùi Trọng Vũ" → "TV" (2 chữ cuối, dùng khi không có ảnh)
export const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
// Ảnh đại diện người tuyển dụng; không có ảnh thì hiện chữ viết tắt
export default function RecruiterAvatar({
  recruiter,
  size = "h-12 w-12",
  textSize = "text-sm",
}: {
  recruiter: JobRecruiter;
  size?: string;
  textSize?: string;
}) {
  return recruiter.avatarUrl ? (
    <img
      src={recruiter.avatarUrl}
      alt={`Ảnh đại diện ${recruiter.fullName}`}
      className={`${size} shrink-0 rounded-full object-cover`}
    />
  ) : (
    <span
      aria-hidden
      className={`${size} ${textSize} flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700`}
    >
      {initialsOf(recruiter.fullName)}
    </span>
  );
}
