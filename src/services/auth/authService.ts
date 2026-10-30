import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  OtpPurpose,
  OtpSendResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from "../../types/auth/auth.types";
import { authHttp, getErrorMessage, refreshAccessToken } from "../../api";
import { store } from "../../store";
import { clearAuth, setAccessToken, setChecking, setUser } from "../../store/authSlice";
import BaseService from "../base/BaseService";
import { disablePush } from "../notification/pushService";

// Ném Error có message tiếng Việt từ BE để trang hiển thị
const toError = (err: unknown) => new Error(getErrorMessage(err));

class AuthService extends BaseService {
  constructor() {
    // Các API đăng nhập/đăng ký đều public, không gắn token
    super("/users", { auth: false });
  }

  async login(payload: LoginRequest): Promise<AuthResponse> {
    try {
      const res = await this.create<AuthResponse>(
        { emailOrPhone: payload.identifier, password: payload.password },
        "login"
      );
      store.dispatch(setAccessToken(res.token));
      await this.fetchMe();
      return res;
    } catch (err) {
      throw toError(err);
    }
  }

  /**
   Đăng nhập Google: chuyển nguyên trang sang BE (URL cấu hình ở VITE_GOOGLE_AUTH_URL).
   Xong BE set cookie refreshToken rồi redirect về FE, restoreSession sẽ lấy access token.
   */
  loginWithGoogle(): void {
    window.location.href = import.meta.env.VITE_GOOGLE_AUTH_URL;
  }

  // Tạo tài khoản chưa kích hoạt, BE gửi OTP về email và trả thông tin đếm ngược
  async register(payload: RegisterRequest): Promise<OtpSendResponse> {
    try {
      return await this.create<OtpSendResponse>(payload, "register");
    } catch (err) {
      throw toError(err);
    }
  }

  // Nhập OTP đăng ký → kích hoạt tài khoản
  async verifyOtp(email: string, otp: string): Promise<void> {
    try {
      await this.create({ email, otp }, "verify-otp");
    } catch (err) {
      throw toError(err);
    }
  }

  // Gửi lại OTP (BE chặn: chờ 60s giữa 2 lần, tối đa 5 lần mỗi đợt)
  async resendOtp(email: string, purpose: OtpPurpose): Promise<OtpSendResponse> {
    try {
      return await this.create<OtpSendResponse>({ email, purpose }, "resend-otp");
    } catch (err) {
      throw toError(err);
    }
  }

  // Quên mật khẩu: gửi OTP đặt lại mật khẩu về email
  async forgotPassword(email: string): Promise<OtpSendResponse> {
    try {
      return await this.create<OtpSendResponse>({ email }, "forgot-password");
    } catch (err) {
      throw toError(err);
    }
  }

  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    try {
      await this.create(payload, "reset-password");
    } catch (err) {
      throw toError(err);
    }
  }

  // Gọi API lỗi (mất mạng...) vẫn xoá phiên ở FE để người dùng thoát được
  async logout(): Promise<void> {
    // Tắt FCM push trước khi xóa phiên (API cần token), nếu không trình duyệt vẫn nhận push của tài khoản cũ
    await disablePush().catch(() => undefined);
    await this.create(undefined, "logout").catch(() => undefined);
    store.dispatch(clearAuth());
  }

  /**
   Gọi 1 lần khi mở app: access token nằm trên RAM nên reload là mất,
   dùng cookie refreshToken để lấy lại. Không có cookie → coi như chưa đăng nhập.
   */
  async restoreSession(): Promise<void> {
    if (store.getState().auth.status !== "idle") return;
    store.dispatch(setChecking());
    const token = await refreshAccessToken().catch(() => null);
    if (token) await this.fetchMe();
  }

  // GET /users/me: lấy thông tin người dùng đang đăng nhập, lưu vào store
  async fetchMe(): Promise<AuthUser | null> {
    try {
      const user = await authHttp.get<AuthUser>(this.url("me"));
      store.dispatch(setUser(user));
      return user;
    } catch {
      // Không lấy được thông tin thì vẫn giữ phiên, chỉ thiếu tên/avatar
      return null;
    }
  }
}

export default new AuthService();
