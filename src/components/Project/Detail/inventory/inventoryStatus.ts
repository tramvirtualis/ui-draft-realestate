// Nhãn và màu của từng tình trạng căn: badge (nền + chữ), dot (chấm màu), text (màu chữ trên nền trắng)
export const STATUS: Record<string, { label: string; badge: string; dot: string; text: string }> = {
  available: { label: "Còn trống", badge: "bg-success/10 text-success", dot: "bg-success", text: "text-success" },
  holding: { label: "Đang giữ chỗ", badge: "bg-warning/10 text-warning", dot: "bg-warning", text: "text-warning" },
  sold: { label: "Đã bán", badge: "bg-danger/10 text-danger", dot: "bg-danger", text: "text-danger" },
  closed: { label: "Đã cho thuê", badge: "bg-line text-body", dot: "bg-muted", text: "text-body" },
};

export const fmt = (n: number | null) => (n == null ? "—" : `${n.toFixed(2).replace(".", ",")} tỷ`);
export const dash = "—";
