import { Bookmark } from "lucide-react";

/** Nút lưu tin ở trang chi tiết: `icon` = nút tròn nhỏ (hero), mặc định = nút full chiều ngang (cột phải) */
export default function SaveJobButton({
  saved,
  onToggle,
  variant = "full",
}: {
  saved: boolean;
  onToggle: () => void;
  variant?: "icon" | "full";
}) {
  const label = saved ? "Bỏ lưu tin" : "Lưu tin";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={saved}
        aria-label={label}
        title={label}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition focus-visible:outline-2 focus-visible:outline-primary-600 ${
          saved
            ? "border-primary-600 bg-primary-600 text-white"
            : "border-line text-body hover:border-primary-300 hover:text-primary-600"
        }`}
      >
        <Bookmark size={16} fill={saved ? "currentColor" : "none"} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={saved}
      className={`mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full border text-sm font-medium transition ${
        saved
          ? "border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100"
          : "border-line text-primary-600 hover:bg-primary-50"
      }`}
    >
      <Bookmark size={15} fill={saved ? "currentColor" : "none"} aria-hidden /> {saved ? "Đã lưu tin" : "Lưu tin"}
    </button>
  );
}
