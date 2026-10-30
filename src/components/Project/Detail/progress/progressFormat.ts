// Ngày hiển thị: ưu tiên report_date, không có thì dùng created_at
export const displayDate = (p: { reportDate: string | null; createdAt: string }) => new Date(p.reportDate ?? p.createdAt);

export const formatFull = (d: Date) => d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
