export interface LoginRequest {
  identifier: string;
  password: string;
  remember: boolean;
}

// Khớp RegisterRequest bên BE
export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
  // Tên role bên BE, ví dụ "ROLE_USER"
  role: string;
  phone?: string | null;
  createdAt?: string;
  // false: tài khoản tạo bằng Google, chưa có mật khẩu (đặt mật khẩu không cần mật khẩu cũ)
  hasPassword?: boolean;
  // Mã quyền trang quản trị (vd "NEWS_VIEW"); SUPER_ADMIN có đủ, người dùng thường rỗng
  permissions?: string[];
}

// Khớp form-data PUT /users/me
export interface UpdateProfileRequest {
  fullName: string;
  phone: string;
  avatar?: File | null; // có file thì thay ảnh cũ
  removeAvatar?: boolean;
}

// Khớp ChangePasswordRequest bên BE
export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

// Khớp JwtAuthResponse bên BE: chỉ trả access token
export interface AuthResponse {
  token: string;
}

export type AuthLocale = "VI" | "EN";

// Khớp enum OtpPurpose bên BE
export type OtpPurpose = "REGISTER" | "RESET_PASSWORD";

// Khớp OtpSendResponse bên BE: dùng để đếm ngược trên form OTP
export interface OtpSendResponse {
  expiresInSeconds: number;
  resendAfterSeconds: number;
  remainingSends: number;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}
