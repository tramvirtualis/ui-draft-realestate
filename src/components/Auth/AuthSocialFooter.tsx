import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { AUTH_COPY } from "../../data/authContent";
import authService from "../../services/auth/authService";

type Props = {
  copy: {
    divider: string;
    google: string;
    termsPrefix: string;
    terms: string;
    privacy: string;
    of: string;
  };
};

// Phần cuối thẻ đăng nhập / đăng ký: nút Google + dòng điều khoản
export default function AuthSocialFooter({ copy }: Props) {
  return (
    <>
      <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-wider text-body">
        <span className="h-px flex-1 bg-primary-100" />
        {copy.divider}
        <span className="h-px flex-1 bg-primary-100" />
      </div>

      <button
        type="button"
        onClick={() => authService.loginWithGoogle()}
        // Phẳng (không bóng, không nhấc lên khi rê chuột), đồng bộ với nút gửi; rê chuột chỉ đổi nền / viền
        className="flex h-12 w-full sm:h-13 items-center justify-center gap-3 rounded-xl border border-primary-100 bg-white text-[15px] font-medium text-navy transition-colors hover:border-primary-300 hover:bg-primary-50"
      >
        <FcGoogle size={18} />
        {copy.google}
      </button>

      <p className="mt-5 text-center text-[11px] sm:mt-6 leading-relaxed text-body">
        {copy.termsPrefix}{" "}
        <Link to={AUTH_COPY.termsHref} className="underline-offset-2 hover:text-primary-600 hover:underline">
          {copy.terms}
        </Link>{" "}
        và{" "}
        <Link to={AUTH_COPY.privacyHref} className="underline-offset-2 hover:text-primary-600 hover:underline">
          {copy.privacy}
        </Link>{" "}
        {copy.of}
      </p>
    </>
  );
}
