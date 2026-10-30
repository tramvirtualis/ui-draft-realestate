import { useState, type FormEvent } from "react";
import { getErrorMessage } from "../../api";
import profileService from "../../services/user/profileService";

// Giống RegisterRequest bên BE
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

// Form đổi mật khẩu; tài khoản Google chưa có mật khẩu (hasPassword = false) thì không cần mật khẩu hiện tại
export function useChangePassword(hasPassword: boolean, onChanged: () => void) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (hasPassword && !currentPassword) return "Vui lòng nhập mật khẩu hiện tại";
    if (!PASSWORD_PATTERN.test(newPassword)) return "Mật khẩu mới tối thiểu 8 ký tự, ít nhất một chữ cái và một số";
    if (newPassword !== confirmPassword) return "Mật khẩu xác nhận không khớp";
    if (hasPassword && newPassword === currentPassword) return "Mật khẩu mới phải khác mật khẩu hiện tại";
    return null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await profileService.changePassword({
        currentPassword: hasPassword ? currentPassword : undefined,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    canSubmit: (!hasPassword || currentPassword !== "") && newPassword !== "" && confirmPassword !== "",
    saving,
    error,
    submit,
  };
}
