export const STATUS: Record<
  string,
  { label: string; badge: string; dot: string; pin: string }
> = {
  available: {
    label: "Còn trống",
    badge: "bg-success/10 text-success",
    dot: "bg-success",
    pin: "bg-success",
  },
  holding: {
    label: "Đang giữ chỗ",
    badge: "bg-warning/10 text-warning",
    dot: "bg-warning",
    pin: "bg-warning",
  },
  sold: {
    label: "Đã bán",
    badge: "bg-danger/10 text-danger",
    dot: "bg-danger",
    pin: "bg-danger",
  },
  closed: {
    label: "Đã cho thuê",
    badge: "bg-line text-body",
    dot: "bg-muted",
    pin: "bg-muted",
  },
};
