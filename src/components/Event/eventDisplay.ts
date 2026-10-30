import { EVENT_STATUS, type Event } from "../../types/event/event.types";

export const EVENT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80";

const pad = (n: number) => String(n).padStart(2, "0");

export const eventCover = (e: Event) => e.images?.[0]?.imageUrl || EVENT_FALLBACK_IMAGE;

// Khối ngày kiểu vé: tháng / ngày / năm / giờ bắt đầu
export const eventDateParts = (iso: string) => {
  const d = new Date(iso);
  return {
    month: `TH ${d.getMonth() + 1}`,
    day: pad(d.getDate()),
    year: String(d.getFullYear()),
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    short: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
  };
};

export const canRegister = (e: Event) => e.status === EVENT_STATUS.UPCOMING || e.status === EVENT_STATUS.ONGOING;

// Dòng tình trạng đăng ký dưới mỗi sự kiện
export function registrationOf(event: Event): { text: string; className: string } {
  if (event.status === EVENT_STATUS.CANCELLED) return { text: "Sự kiện đã hủy", className: "text-danger" };
  if (event.status === EVENT_STATUS.COMPLETED) return { text: "Đã đóng đăng ký", className: "text-muted" };
  const remaining = event.maxAttendees - event.attendeeCount;
  if (remaining <= 0) return { text: "Hết chỗ", className: "text-danger" };
  if (remaining <= 10) return { text: `Chỉ còn ${remaining} chỗ`, className: "text-pop-600" };
  return { text: `Còn ${remaining} chỗ · Miễn phí`, className: "text-success" };
}
