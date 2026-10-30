import type { InputHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: LucideIcon;
  hint?: string;
  // Nút nằm bên phải ô nhập (ví dụ ẩn/hiện mật khẩu)
  trailing?: ReactNode;
};

const inputCls =
  "h-12 sm:h-13 w-full rounded-xl border border-primary-100 bg-primary-50/40 pl-12 pr-4 text-base sm:text-[15px] text-heading outline-none transition placeholder:text-body/70 focus:border-primary-300 focus:bg-white focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-body";

// Ô nhập dùng chung cho các form đăng nhập / đăng ký / quên mật khẩu
export default function AuthField({ label, icon: Icon, hint, trailing, className = "", ...input }: Props) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-bold text-navy">{label}</span>
      <span className="relative block">
        <Icon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-body" />
        <input {...input} className={`${inputCls} ${trailing ? "pr-11" : ""}`} />
        {trailing}
      </span>
      {hint && <span className="mt-1.5 block text-xs text-body/80">{hint}</span>}
    </label>
  );
}
