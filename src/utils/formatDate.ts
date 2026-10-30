const pad = (n: number): string => String(n).padStart(2, "0");

//format time
export const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

//format date
export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

// Hiển thị thời gian sự kiện:
//  - Cùng ngày:  "09:30 – 11:30 · 18/10/2026"
//  - Khác ngày:  "09:00 – 17:00 · 11/10 – 12/10/2026"
export const formatEventTime = (startIso: string, endIso: string): string => {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const time = `${formatTime(startIso)} – ${formatTime(endIso)}`;

  if (s.toDateString() === e.toDateString()) {
    return `${time} · ${formatDate(startIso)}`;
  }
  return `${time} · ${pad(s.getDate())}/${pad(s.getMonth() + 1)} – ${formatDate(
    endIso
  )}`;
};

/** "Chủ nhật, 18/10/2026" */
export const formatWeekdayDate = (iso: string): string => {
  const days = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];
  return `${days[new Date(iso).getDay()]}, ${formatDate(iso)}`;
};

/** "Vừa xong", "5 phút trước", "2 giờ trước", "3 ngày trước", quá 7 ngày thì hiện ngày */
export const formatRelativeTime = (iso: string): string => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)} ngày trước`;
  return formatDate(iso);
};

/** Kiểu bình luận Facebook: "Vừa xong", "5 phút", "17 giờ", "3 ngày", quá 30 ngày thì hiện ngày */
export const formatShortRelativeTime = (iso: string): string => {
  const min = Math.floor(Math.max(0, Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "Vừa xong";
  if (min < 60) return `${min} phút`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} giờ`;
  const day = Math.floor(hour / 24);
  if (day < 30) return `${day} ngày`;
  return new Date(iso).toLocaleDateString("vi-VN");
};
