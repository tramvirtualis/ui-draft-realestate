import { ArrowRight } from "lucide-react";

type Props = {
  label: string;
  loadingLabel: string;
  loading: boolean;
  disabled?: boolean;
};

// Nút submit phẳng dùng chung cho các form xác thực (đăng nhập, đăng ký, quên mật khẩu): nền vàng đặc, rê chuột đậm hơn một bậc
export default function AuthSubmitButton({ label, loadingLabel, loading, disabled }: Props) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 text-base font-bold text-white transition-colors hover:bg-primary-700 disabled:opacity-60 sm:h-13"
    >
      {loading ? loadingLabel : label}
      {!loading && <ArrowRight size={18} className="transition group-hover:translate-x-1" />}
    </button>
  );
}
