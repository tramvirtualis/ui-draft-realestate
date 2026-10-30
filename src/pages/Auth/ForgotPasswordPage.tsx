import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import AuthField from "../../components/Auth/AuthField";
import AuthHeader from "../../components/Auth/AuthHeader";
import AuthSubmitButton from "../../components/Auth/AuthSubmitButton";
import OtpVerifyPanel from "../../components/Auth/OtpVerifyPanel";
import PasswordToggle from "../../components/Auth/PasswordToggle";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { FORGOT_PASSWORD_COPY } from "../../data/authContent";
import { useForgotPassword } from "../../hooks/auth/useForgotPassword";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { email, otpInfo, loading, error, sendCode, resetPassword, backToEmail } = useForgotPassword();

  const handleSendCode = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void sendCode(emailInput.trim());
  };

  const handleReset = async (otp: string) => {
    if (await resetPassword({ otp, newPassword, confirmPassword })) {
      navigate("/login", { state: { notice: "Đặt lại mật khẩu thành công, mời bạn đăng nhập lại." } });
    }
  };

  return (
    <>
      <LoadingOverlay open={loading} message={otpInfo ? "Đang đặt lại mật khẩu" : "Đang gửi mã xác thực"} />
      <AuthHeader
        welcome={FORGOT_PASSWORD_COPY.welcome}
        title={FORGOT_PASSWORD_COPY.title}
        subtitle={otpInfo ? undefined : FORGOT_PASSWORD_COPY.subtitle}
      />

      {!otpInfo ? (
        // Bước 1: nhập email để nhận mã
        <form className="mt-6 space-y-4 sm:mt-8 sm:space-y-5" onSubmit={handleSendCode}>
          <AuthField
            label={FORGOT_PASSWORD_COPY.emailLabel}
            icon={Mail}
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="email@example.com"
            autoComplete="email"
            required
          />

          {error && (
            <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <AuthSubmitButton label={FORGOT_PASSWORD_COPY.sendCode} loadingLabel="Đang gửi mã..." loading={loading} />
        </form>
      ) : (
        // Bước 2: nhập mã + mật khẩu mới
        <div className="mt-6">
          <OtpVerifyPanel
            email={email}
            purpose="RESET_PASSWORD"
            initial={otpInfo}
            submitLabel={FORGOT_PASSWORD_COPY.submit}
            submitting={loading}
            error={error}
            onSubmit={handleReset}
            onBack={backToEmail}
          >
            <AuthField
              label={FORGOT_PASSWORD_COPY.newPasswordLabel}
              icon={Lock}
              hint={FORGOT_PASSWORD_COPY.passwordHint}
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
            />
            <AuthField
              label={FORGOT_PASSWORD_COPY.confirmPasswordLabel}
              icon={Lock}
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </OtpVerifyPanel>
        </div>
      )}
    </>
  );
}
