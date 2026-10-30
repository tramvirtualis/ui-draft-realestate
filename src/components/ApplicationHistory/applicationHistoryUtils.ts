import {
  APPLICATION_RANGE_DAYS,
  APPLICATION_STATUS_ORDER,
  type Application,
  type ApplicationRange,
  type ApplicationSort,
  type ApplicationStatus,
} from "../../types/applicationHistory.types";

// Hàm lọc/sắp xếp/đếm và định dạng cho trang Lịch sử ứng tuyển (dữ liệu từ GET /me/applications)

export const PAGE_SIZE = 5;

export interface ApplicationQuery {
  status: ApplicationStatus | "ALL";
  keyword: string;
  range: ApplicationRange;
  sort: ApplicationSort;
}

// Lịch phỏng vấn sắp tới, lấy từ đơn có interviewAt ở tương lai
export interface UpcomingInterview {
  applicationId: number;
  jobId: number | null;
  jobTitle: string;
  startAt: string;
  endAt: string;
  location: string;
}

const INTERVIEW_MINUTES = 60;

const time = (iso: string) => new Date(iso).getTime();

export const jobTitleOf = (a: Application): string =>
  a.job?.title ?? "Tin tuyển dụng đã gỡ";

export function filterApplications(
  items: Application[],
  q: ApplicationQuery
): Application[] {
  const keyword = q.keyword.trim().toLowerCase();
  const maxAge = APPLICATION_RANGE_DAYS[q.range] * 86_400_000;

  return items
    .filter((a) => {
      if (q.status !== "ALL" && a.status !== q.status) return false;
      if (
        keyword &&
        !`${jobTitleOf(a)} ${a.job?.location ?? ""}`
          .toLowerCase()
          .includes(keyword)
      )
        return false;
      if (Date.now() - time(a.createdAt) > maxAge) return false;
      return true;
    })
    .sort((a, b) => {
      if (q.sort === "OLDEST") return time(a.createdAt) - time(b.createdAt);
      if (q.sort === "UPDATED") return time(b.updatedAt) - time(a.updatedAt);
      return time(b.createdAt) - time(a.createdAt);
    });
}

/** Số hồ sơ theo từng trạng thái (kèm tổng) */
export function countByStatus(
  items: Application[]
): Record<ApplicationStatus | "ALL", number> {
  const counts = { ALL: items.length } as Record<
    ApplicationStatus | "ALL",
    number
  >;
  for (const s of APPLICATION_STATUS_ORDER)
    counts[s] = items.filter((a) => a.status === s).length;
  return counts;
}

const isActive = (a: Application) =>
  a.status !== "REJECTED" && a.status !== "WITHDRAWN";

/** Các lịch phỏng vấn còn ở phía trước, gần nhất trước */
export function getUpcomingInterviews(
  items: Application[]
): UpcomingInterview[] {
  return items
    .filter(
      (a) => isActive(a) && a.interviewAt && time(a.interviewAt) > Date.now()
    )
    .sort((a, b) => time(a.interviewAt!) - time(b.interviewAt!))
    .map((a) => ({
      applicationId: a.id,
      jobId: a.job?.id ?? null,
      jobTitle: jobTitleOf(a),
      startAt: a.interviewAt!,
      endAt: new Date(
        time(a.interviewAt!) + INTERVIEW_MINUTES * 60_000
      ).toISOString(),
      location: a.interviewLocation || "Nhà tuyển dụng sẽ thông báo",
    }));
}

/** BE chỉ cho rút đơn khi đang PENDING hoặc REVIEWING */
export const canWithdraw = (status: ApplicationStatus): boolean =>
  status === "PENDING" || status === "REVIEWING";

/** Ghi chú của lần đổi trạng thái gần nhất (BE trả sẵn latestNote ở API danh sách) */
export const latestNote = (a: Application): string | null =>
  a.latestNote ??
  (a.statusLogs?.length
    ? a.statusLogs[a.statusLogs.length - 1].note ?? null
    : null);

/** "06/10" từ ISO */
export const formatShortDate = (iso: string): string => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}`;
};

export const formatTimeOfDay = (iso: string): string => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
};

/** "Thứ Ba" */
export const weekdayName = (iso: string): string =>
  new Date(iso).toLocaleDateString("vi-VN", { weekday: "long" });

export const daysUntil = (iso: string): number =>
  Math.max(0, Math.ceil((time(iso) - Date.now()) / 86_400_000));

const icsStamp = (iso: string) =>
  new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

/** Tải file .ics để thêm lịch phỏng vấn vào Google/Apple/Outlook Calendar */
export function downloadInterviewIcs(i: UpcomingInterview) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NovaLand Hub//Interview//VI",
    "BEGIN:VEVENT",
    `UID:interview-${i.applicationId}@novaland-hub`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(i.startAt)}`,
    `DTEND:${icsStamp(i.endAt)}`,
    `SUMMARY:Phỏng vấn ${i.jobTitle}`,
    `LOCATION:${i.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const url = URL.createObjectURL(
    new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "lich-phong-van.ics";
  a.click();
  URL.revokeObjectURL(url);
}
