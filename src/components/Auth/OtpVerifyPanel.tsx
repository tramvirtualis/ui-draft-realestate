import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import AuthSubmitButton from "./AuthSubmitButton";
import OtpInput from "./OtpInput";
import LoadingOverlay from "../common/LoadingOverlay";
import { formatSeconds } from "../../hooks/auth/useCountdown";
import { useOtpSession } from "../../hooks/auth/useOtpSession";
import type { OtpPurpose, OtpSendResponse } from "../../types/auth/auth.types";

type Props = {
  email: string;
  purpose: OtpPurpose;
  initial: OtpSendResponse;
  submitLabel: string;
  submitting: boolean;
  error: string;
  onSubmit: (otp: string) => void;
  // Không truyền thì ẩn nút "Đổi email" (đăng ký: tài khoản đã tạo với email đó)
  onBack?: () => void;
  // Ô nhập thêm hiển thị dưới mã OTP (ví dụ mật khẩu mới khi quên mật khẩu)
  children?: ReactNode;
};

// Form nhập OTP dùng chung cho đăng ký và quên mật khẩu: đếm ngược hạn mã + nút gửi lại
export default function OtpVerifyPanel({
  email,
  purpose,
  initial,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onBack,
  children,
}: Props) {
  const [otp, setOtp] = useState("");
  const session = useOtpSession(email, purpose, initial);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(otp);
  };

  const handleResend = async () => {
    if (await session.resend()) setOtp("");
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <LoadingOverlay open={session.resending} message="Đang gửi lại mã" />
      <p className="text-sm leading-relaxed text-body">
        Mã xác thực gồm 6 chữ số đã được gửi tới <span className="font-semibold text-heading">{email}</span>.
      </p>

      <div>
        <OtpInput value={otp} onChange={setOtp} disabled={submitting} />
        <p className={`mt-2 text-xs ${session.expiresIn > 0 ? "text-muted" : "text-danger"}`}>
          {session.expiresIn > 0
            ? `Mã hết hạn sau ${formatSeconds(session.expiresIn)}`
            : "Mã đã hết hạn, vui lòng gửi lại mã mới."}
        </p>
      </div>

      {children}

      {(error || session.resendError) && (
        <p role="alert" className="text-sm text-danger">
          {error || session.resendError}
        </p>
      )}

      <AuthSubmitButton
        label={submitLabel}
        loadingLabel="Đang xử lý..."
        loading={submitting}
        disabled={otp.length !== 6}
      />

      <div className={`flex items-center gap-3 text-sm ${onBack ? "justify-between" : "justify-end"}`}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-body hover:text-heading"
          >
            <ArrowLeft size={14} />
            Đổi email
          </button>
        )}

        {session.remainingSends > 0 ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={!session.canResend}
            className="font-semibold text-primary-600 hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
          >
            {session.resending
              ? "Đang gửi..."
              : session.resendIn > 0
                ? `Gửi lại mã sau ${session.resendIn}s`
                : `Gửi lại mã (còn ${session.remainingSends} lần)`}
          </button>
        ) : (
          <span className="text-muted">Đã hết lượt gửi lại, thử lại sau 15 phút</span>
        )}
      </div>
    </form>
  );
}
