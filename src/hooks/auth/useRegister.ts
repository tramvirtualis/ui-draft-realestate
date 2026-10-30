import { useCallback, useState } from "react";
import authService from "../../services/auth/authService";
import type { OtpSendResponse, RegisterRequest } from "../../types/auth/auth.types";

/**
 Đăng ký 2 bước: điền form → nhập OTP gửi về email để kích hoạt.
 otpInfo != null nghĩa là đã sang bước nhập OTP.
 */
export function useRegister() {
  const [email, setEmail] = useState("");
  const [otpInfo, setOtpInfo] = useState<OtpSendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = useCallback(async (payload: RegisterRequest) => {
    setError("");
    if (payload.password !== payload.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return false;
    }
    setLoading(true);
    try {
      const res = await authService.register(payload);
      setEmail(payload.email);
      setOtpInfo(res);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký không thành công.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const verify = useCallback(
    async (otp: string) => {
      setError("");
      setLoading(true);
      try {
        await authService.verifyOtp(email, otp);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Xác thực không thành công.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  return { email, otpInfo, loading, error, register, verify };
}
