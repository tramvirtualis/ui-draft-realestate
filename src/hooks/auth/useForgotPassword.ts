import { useCallback, useState } from "react";
import authService from "../../services/auth/authService";
import type { OtpSendResponse } from "../../types/auth/auth.types";

interface ResetPayload {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 Quên mật khẩu 2 bước: nhập email để nhận OTP → nhập OTP + mật khẩu mới.
 otpInfo != null nghĩa là đã sang bước 2.
 */
export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [otpInfo, setOtpInfo] = useState<OtpSendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendCode = useCallback(async (value: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await authService.forgotPassword(value);
      setEmail(value);
      setOtpInfo(res);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi mã không thành công.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (payload: ResetPayload) => {
      setError("");
      if (payload.newPassword !== payload.confirmPassword) {
        setError("Mật khẩu xác nhận không khớp.");
        return false;
      }
      setLoading(true);
      try {
        await authService.resetPassword({ email, ...payload });
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đặt lại mật khẩu không thành công.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  const backToEmail = useCallback(() => {
    setOtpInfo(null);
    setError("");
  }, []);

  return { email, otpInfo, loading, error, sendCode, resetPassword, backToEmail };
}
