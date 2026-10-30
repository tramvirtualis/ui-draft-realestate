import { Eye, EyeOff } from "lucide-react";

type Props = {
  shown: boolean;
  onToggle: () => void;
};

// Nút ẩn/hiện mật khẩu, đặt trong prop `trailing` của AuthField
export default function PasswordToggle({ shown, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-body hover:text-heading"
      aria-label={shown ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
    >
      {shown ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}
