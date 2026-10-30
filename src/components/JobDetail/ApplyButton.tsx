import { Link } from "react-router-dom";
import { CheckCircle2, Send } from "lucide-react";

const base =
  "relative z-10 flex items-center justify-center gap-2 rounded-full text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2";

export default function ApplyButton({
  applied,
  onApply,
  to,
  className = "",
}: {
  applied: boolean;
  onApply?: () => void;
  to?: string;
  className?: string;
}) {
  if (applied) {
    return (
      <Link
        to="/applications"
        title="Xem trong Lịch sử ứng tuyển"
        className={`${base} ${className} border border-green-200 bg-green-50 text-green-600 hover:bg-green-100 focus-visible:outline-green-600`}
      >
        <CheckCircle2 size={15} aria-hidden /> Đã ứng tuyển
      </Link>
    );
  }

  const cls = `${base} ${className} bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-300/50 hover:opacity-95 focus-visible:outline-primary-600`;
  const content = (
    <>
      <Send size={15} aria-hidden /> Ứng tuyển nhanh
    </>
  );

  return to ? (
    <Link to={to} className={cls}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onApply} className={cls}>
      {content}
    </button>
  );
}
