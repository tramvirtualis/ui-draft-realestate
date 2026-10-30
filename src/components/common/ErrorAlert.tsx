import { AlertCircle, X } from "lucide-react";

type Props = {
  message: string | null;
  onClose?: () => void;
  className?: string;
};

export default function ErrorAlert({ message, onClose, className = "" }: Props) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger ${className}`}
    >
      <AlertCircle size={18} className="mt-px shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thông báo lỗi"
          className="rounded-full p-0.5 hover:bg-danger/15"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
