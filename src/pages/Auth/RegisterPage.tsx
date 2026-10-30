import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Phone, User } from "lucide-react";
import AuthField from "../../components/Auth/AuthField";
import AuthHeader from "../../components/Auth/AuthHeader";
import AuthSocialFooter from "../../components/Auth/AuthSocialFooter";
import AuthSubmitButton from "../../components/Auth/AuthSubmitButton";
import OtpVerifyPanel from "../../components/Auth/OtpVerifyPanel";
import PasswordToggle from "../../components/Auth/PasswordToggle";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { REGISTER_COPY } from "../../data/authContent";
import { useRegister } from "../../hooks/auth/useRegister";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { otpInfo, loading, error, register, verify } = useRegister();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void register({ fullName, email, phone, password, confirmPassword });
  };

  const handleVerify = async (otp: string) => {
    if (await verify(otp)) {
      navigate("/login", { state: { notice: "Kích hoạt tài khoản thành công, mời bạn đăng nhập." } });
    }
  };

  // Bước 2: nhập OTP kích hoạt tài khoản
  if (otpInfo) {
    return (
      <>
        <LoadingOverlay open={loading} message="Đang kích hoạt tài khoản" />
        <AuthHeader welcome={REGISTER_COPY.welcome} title="Xác thực email" />
        <div className="mt-6">
          <OtpVerifyPanel
            email={email}
            purpose="REGISTER"
            initial={otpInfo}
            submitLabel="Kích hoạt tài khoản"
            submitting={loading}
            error={error}
            onSubmit={handleVerify}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <LoadingOverlay open={loading} message="Đang tạo tài khoản" />
      <AuthHeader
        welcome={REGISTER_COPY.welcome}
        title={REGISTER_COPY.title}
        subtitle={REGISTER_COPY.subtitle}
      />

      <form className="mt-6 space-y-4 sm:mt-8" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            label={REGISTER_COPY.nameLabel}
            icon={User}
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={REGISTER_COPY.namePlaceholder}
            autoComplete="name"
            required
          />
          <AuthField
            label={REGISTER_COPY.phoneLabel}
            icon={Phone}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={REGISTER_COPY.phonePlaceholder}
            autoComplete="tel"
            required
          />
        </div>

        <AuthField
          label={REGISTER_COPY.emailLabel}
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={REGISTER_COPY.emailPlaceholder}
          autoComplete="email"
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            label={REGISTER_COPY.passwordLabel}
            icon={Lock}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
          />
          <AuthField
            label={REGISTER_COPY.confirmPasswordLabel}
            icon={Lock}
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </div>
        <p className="-mt-2 text-xs text-body/80">{REGISTER_COPY.passwordHint}</p>

        {error && (
          <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <AuthSubmitButton label={REGISTER_COPY.submit} loadingLabel="Đang tạo tài khoản..." loading={loading} />
      </form>

      <AuthSocialFooter copy={REGISTER_COPY} />
    </>
  );
}
