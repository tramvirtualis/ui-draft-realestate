import { useState } from "react";
import { KeyRound, Loader2, Lock } from "lucide-react";
import AuthField from "../Auth/AuthField";
import PasswordToggle from "../Auth/PasswordToggle";
import { useToast } from "../common/toastContext";
import { useChangePassword } from "../../hooks/account/useChangePassword";

// Đổi mật khẩu; tài khoản Google chưa có mật khẩu thì là "Đặt mật khẩu" (không hỏi mật khẩu hiện tại)
export default function ChangePasswordCard({ hasPassword }: { hasPassword: boolean }) {
  const toast = useToast();
  const form = useChangePassword(hasPassword, () =>
    toast.show(hasPassword ? "Đã đổi mật khẩu, các thiết bị khác đã bị đăng xuất" : "Đã đặt mật khẩu"),
  );
  const [shown, setShown] = useState(false);
  const toggle = <PasswordToggle shown={shown} onToggle={() => setShown((v) => !v)} />;
  const type = shown ? "text" : "password";

  return (
    <section className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-heading">{hasPassword ? "Đổi mật khẩu" : "Đặt mật khẩu"}</h2>
      <p className="mt-1 text-sm text-body">
        {hasPassword
          ? "Sau khi đổi, các thiết bị khác đang đăng nhập sẽ bị đăng xuất."
          : "Tài khoản của bạn đăng nhập bằng Google. Đặt mật khẩu để đăng nhập được bằng email."}
      </p>

      <form onSubmit={form.submit} className="mt-6 grid gap-5 sm:grid-cols-2">
        {hasPassword && (
          <AuthField
            label="Mật khẩu hiện tại"
            icon={Lock}
            type={type}
            value={form.currentPassword}
            onChange={(e) => form.setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            trailing={toggle}
            className="sm:col-span-2"
          />
        )}
        <AuthField
          label="Mật khẩu mới"
          icon={KeyRound}
          type={type}
          value={form.newPassword}
          onChange={(e) => form.setNewPassword(e.target.value)}
          autoComplete="new-password"
          hint="Tối thiểu 8 ký tự, có cả chữ và số."
          trailing={toggle}
        />
        <AuthField
          label="Xác nhận mật khẩu mới"
          icon={KeyRound}
          type={type}
          value={form.confirmPassword}
          onChange={(e) => form.setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          trailing={toggle}
        />

        {form.error && (
          <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger sm:col-span-2">
            {form.error}
          </p>
        )}

        <div className="flex justify-end sm:col-span-2">
          <button
            type="submit"
            disabled={!form.canSubmit || form.saving}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-2.5 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {form.saving && <Loader2 size={16} className="animate-spin" />}
            {hasPassword ? "Đổi mật khẩu" : "Đặt mật khẩu"}
          </button>
        </div>
      </form>
    </section>
  );
}
