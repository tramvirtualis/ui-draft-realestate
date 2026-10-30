// status của Zones là chuỗi tự do → suy ra màu theo từ khóa, không nhận ra thì dùng màu trung tính
export function statusTone(status: string | null): { badge: string; dot: string } {
  const s = (status ?? "").toLowerCase();
  if (s.includes("ít") || s.includes("hết")) return { badge: "bg-danger/10 text-danger", dot: "bg-danger" };
  if (s.includes("lập")) return { badge: "bg-warning/10 text-warning", dot: "bg-warning" };
  if (s.includes("bàn giao")) return { badge: "bg-success/10 text-success", dot: "bg-success" };
  if (s.includes("sắp")) return { badge: "bg-warning/10 text-warning", dot: "bg-warning" };
  if (s.includes("mở bán")) return { badge: "bg-success/10 text-success", dot: "bg-success" };
  return { badge: "bg-primary-50 text-primary-700", dot: "bg-primary-500" };
}
