export type ApplicationStatus =
  | "PENDING"
  | "REVIEWING"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEWED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  "PENDING",
  "REVIEWING",
  "INTERVIEW_SCHEDULED",
  "INTERVIEWED",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
];

export const APPLICATION_STATUS_META: Record<
  ApplicationStatus,
  { label: string; badge: string }
> = {
  PENDING: { label: "Chờ duyệt", badge: "bg-primary-100 text-primary-700" },
  REVIEWING: { label: "Đang xem xét", badge: "bg-blue-50 text-blue-600" },
  INTERVIEW_SCHEDULED: {
    label: "Hẹn phỏng vấn",
    badge: "bg-amber-50 text-amber-600",
  },
  INTERVIEWED: { label: "Đã phỏng vấn", badge: "bg-green-50 text-green-600" },
  ACCEPTED: { label: "Trúng tuyển", badge: "bg-emerald-50 text-emerald-600" },
  REJECTED: { label: "Không phù hợp", badge: "bg-red-50 text-red-500" },
  WITHDRAWN: { label: "Đã rút", badge: "bg-gray-100 text-gray-500" },
};

export interface ApplicationStatusLog {
  id: number;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  note: string | null;
  changedBy?: number | null;
  interviewAt?: string | null;
  interviewLocation?: string | null;
  createdAt: string;
}

export interface Application {
  id: number;
  job: { id: number; title: string; location: string | null } | null;
  userId?: number;
  fullName: string;
  email: string;
  phone: string;
  cvId?: number | null;
  cvUrl?: string | null;
  cvFileName?: string | null;
  cvFileSize?: number | null;
  cvMimeType?: string | null;
  coverLetter?: string | null;
  sources?: string | null;
  status: ApplicationStatus;
  interviewAt?: string | null;
  interviewLocation?: string | null;
  statusChangedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  latestNote?: string | null;
  statusLogs?: ApplicationStatusLog[];
  // Ghi chú nội bộ, chỉ API admin trả về
  adminNote?: string | null;
}

// Khớp ApplicationStatusRequest bên BE (admin đổi trạng thái đơn)
export interface ApplicationStatusRequest {
  status: ApplicationStatus;
  //Ghi chú gửi kèm lần đổi trạng thái (ứng viên thấy trong lịch sử)
  note?: string;
  // Ghi chú nội bộ của HR
  adminNote?: string;
  interviewAt?: string | null;
  interviewLocation?: string;
}

export type ApplicationRange = "1m" | "3m" | "6m" | "all";

export const APPLICATION_RANGE_LABEL: Record<ApplicationRange, string> = {
  "1m": "1 tháng gần đây",
  "3m": "3 tháng gần đây",
  "6m": "6 tháng gần đây",
  all: "Tất cả thời gian",
};

export const APPLICATION_RANGE_DAYS: Record<ApplicationRange, number> = {
  "1m": 30,
  "3m": 90,
  "6m": 180,
  all: Infinity,
};

export type ApplicationSort = "NEWEST" | "OLDEST" | "UPDATED";

export const APPLICATION_SORT_LABEL: Record<ApplicationSort, string> = {
  NEWEST: "Mới nhất",
  OLDEST: "Cũ nhất",
  UPDATED: "Cập nhật gần nhất",
};
