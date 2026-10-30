export type EventStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

export const EVENT_STATUS = {
  UPCOMING: "UPCOMING",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const EVENT_STATUS_META: Record<
  EventStatus,
  { label: string; dot: string; text: string }
> = {
  UPCOMING: {
    label: "Sắp diễn ra",
    dot: "bg-amber-500",
    text: "text-amber-600",
  },
  ONGOING: { label: "Đang diễn ra", dot: "bg-pop-500", text: "text-pop-600" },
  COMPLETED: { label: "Đã kết thúc", dot: "bg-gray-400", text: "text-body" },
  CANCELLED: { label: "Đã hủy", dot: "bg-danger", text: "text-danger" },
};

export type EventSort = "NEWEST" | "SOONEST" | "LATEST";

export const EVENT_SORT = {
  NEWEST: "NEWEST",
  SOONEST: "SOONEST",
  LATEST: "LATEST",
} as const;

export const EVENT_SORT_LABEL: Record<EventSort, string> = {
  NEWEST: "Mới đăng",
  SOONEST: "Sắp diễn ra trước",
  LATEST: "Diễn ra muộn nhất",
};

export const EVENT_SORT_PARAM: Record<EventSort, string> = {
  NEWEST: "createdAt,desc",
  SOONEST: "startTime,asc",
  LATEST: "startTime,desc",
};

export interface UserSummary {
  id: number;
  fullName: string;
  avatarUrl?: string | null;
}

export interface EventImage {
  id: number;
  imageUrl: string;
}

export interface Event {
  id: number;
  title: string;
  content: string;
  location: string;
  maxAttendees: number;
  attendeeCount: number;
  startTime: string;
  endTime: string;
  status: EventStatus;
  createdBy: UserSummary;
  images: EventImage[];
  createdAt: string;
  updatedAt: string;
}

export interface EventComment {
  id: number;
  eventId: number;
  user: UserSummary;
  content: string;
  createdAt: string;
}

export interface EventMember {
  id: number;
  user: UserSummary;
  joinedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // trang hiện tại, bắt đầu từ 0
  size: number;
}

export interface EventFilter {
  keyword: string;
  status: EventStatus | "";
}

export const DEFAULT_EVENT_FILTER: EventFilter = { keyword: "", status: "" };

// Khớp EventRequest bên BE (tạo / sửa sự kiện)
export interface EventRequest {
  title: string;
  content: string;
  location: string;
  maxAttendees: number;
  startTime: string; // ISO, ví dụ 2026-10-20T09:00:00
  endTime: string;
}

export interface EventStatusRequest {
  status: EventStatus;
}

export interface CommentEventRequest {
  content: string;
}
