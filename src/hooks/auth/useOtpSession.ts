import { useCallback, useState } from "react";
import authService from "../../services/auth/authService";
import type { OtpPurpose, OtpSendResponse } from "../../types/auth/auth.types";
import { useCountdown } from "./useCountdown";

/**
 Trạng thái của 1 mã OTP đã gửi: thời gian sống còn lại, thời gian chờ gửi lại,
 số lần gửi còn lại và hàm gửi lại. initial = response của lần gửi đầu tiên.
 */
export function useOtpSession(email: string, purpose: OtpPurpose, initial: OtpSendResponse) {
  const expiry = useCountdown(initial.expiresInSeconds);
  const cooldown = useCountdown(initial.resendAfterSeconds);
  const [remainingSends, setRemainingSends] = useState(initial.remainingSends);
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState("");

  const { start: startExpiry } = expiry;
  const { start: startCooldown } = cooldown;

  const resend = useCallback(async () => {
    setResendError("");
    setResending(true);
    try {
      const res = await authService.resendOtp(email, purpose);
      startExpiry(res.expiresInSeconds);
      startCooldown(res.resendAfterSeconds);
      setRemainingSends(res.remainingSends);
      return true;
    } catch (err) {
      setResendError(err instanceof Error ? err.message : "Gửi lại mã không thành công.");
      return false;
    } finally {
      setResending(false);
    }
  }, [email, purpose, startExpiry, startCooldown]);

  return {
    expiresIn: expiry.secondsLeft,
    resendIn: cooldown.secondsLeft,
    remainingSends,
    canResend: cooldown.secondsLeft === 0 && remainingSends > 0 && !resending,
    resending,
    resendError,
    resend,
  };
}
