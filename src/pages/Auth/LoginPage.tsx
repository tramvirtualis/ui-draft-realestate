import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import AuthErrorModal from "../../components/Auth/AuthErrorModal";
import AuthField from "../../components/Auth/AuthField";
import AuthHeader from "../../components/Auth/AuthHeader";
import AuthSocialFooter from "../../components/Auth/AuthSocialFooter";
import AuthSubmitButton from "../../components/Auth/AuthSubmitButton";
import PasswordToggle from "../../components/Auth/PasswordToggle";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { LOGIN_COPY } from "../../data/authContent";
import authService from "../../services/auth/authService";
import { selectIsSuperAdmin, selectPermissions, store } from "../../store";
import { firstAdminPath } from "../../config/adminAccess";

export default function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Thông báo từ trang khác (kích hoạt tài khoản / đặt lại mật khẩu thành công)
  const notice = (useLocation().state as { notice?: string } | null)?.notice;
  // BE redirect về /login?error=... khi đăng nhập Google thất bại → hiện modal
  const [oauthError, setOauthError] = useState(
    () => new URLSearchParams(window.location.search).get("error") ?? ""
  );

  // Đã lấy lỗi vào state thì xoá ?error khỏi URL để reload không hiện lại
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("error")) {
      params.delete("error");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (qs ? `?${qs}` : "")
      );
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.login({ identifier, password, remember });
      // Hết phiên giữa chừng (axios / AdminRoute gắn ?redirect=) thì quay lại đúng trang đang dùng;
      // không có thì ADMIN vào trang Tổng quan quản trị, người dùng thường về trang chủ
      const redirect = new URLSearchParams(window.location.search).get(
        "redirect"
      );
      const state = store.getState();
      const home = firstAdminPath(selectPermissions(state), selectIsSuperAdmin(state)) ?? "/";
      navigate(redirect?.startsWith("/") ? redirect : home, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đăng nhập không thành công."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay open={loading} message="Đang đăng nhập" />
      <AuthErrorModal
        open={!!oauthError}
        message={oauthError}
        title="Đăng nhập Google thất bại"
        onClose={() => setOauthError("")}
      />
      <AuthHeader
        welcome={LOGIN_COPY.welcome}
        title={LOGIN_COPY.title}
        subtitle={LOGIN_COPY.subtitle}
      />

      <form className="mt-6 space-y-4 sm:mt-8 sm:space-y-5" onSubmit={handleSubmit}>
        <AuthField
          label={LOGIN_COPY.identifierLabel}
          icon={Mail}
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={LOGIN_COPY.identifierPlaceholder}
          autoComplete="username"
          required
        />

        <AuthField
          label={LOGIN_COPY.passwordLabel}
          icon={Lock}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
          trailing={
            <PasswordToggle
              shown={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />
          }
        />

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-body">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded accent-primary-600"
            />
            {LOGIN_COPY.remember}
          </label>
          <Link
            to="/forgot-password"
            className="font-bold text-primary-600 hover:text-primary-700 hover:underline"
          >
            {LOGIN_COPY.forgot}
          </Link>
        </div>

        {notice && !error && (
          <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            {notice}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <AuthSubmitButton
          label={LOGIN_COPY.submit}
          loadingLabel="Đang đăng nhập..."
          loading={loading}
        />
      </form>

      <AuthSocialFooter copy={LOGIN_COPY} />
    </>
  );
}
