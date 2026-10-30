// Khớp AdminUserResponse / RoleResponse / AdminUserStatsResponse bên BE
export type AdminUserStatus = "ACTIVE" | "INACTIVE" | "LOCKED";

export interface RoleOption {
  id: number;
  name: string; // vd ROLE_ADMIN, ROLE_USER
}

export interface AdminUser {
  id: number;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: RoleOption | null;
  status: AdminUserStatus;
  createdAt: string | null;
  projectStaff: boolean; // đang phụ trách dự án: vai trò chỉ đổi qua trang Nhân sự dự án
}

export interface AdminUserStats {
  all: number;
  active: number;
  inactive: number;
  locked: number;
}

export const USER_STATUS_LABEL: Record<AdminUserStatus, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Chưa kích hoạt",
  LOCKED: "Bị khóa",
};

// Khớp RegisterRequest / AdminUserUpdateRequest / AdminPasswordRequest bên BE
export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
export const PHONE_RULE = /^(0?)(3[2-9]|5[6|7|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
export const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ROLE_SUPER_ADMIN → "Quản trị hệ thống", ROLE_USER → "Người dùng", vai trò tự tạo thì bỏ tiền tố ROLE_
const ROLE_NAMES: Record<string, string> = {
  SUPER_ADMIN: "Quản trị hệ thống",
  ADMIN: "Quản trị viên",
  USER: "Người dùng",
  PROJECT_ADMIN: "Admin dự án",
  PROJECT_DIRECTOR: "Giám đốc dự án",
};

// BE không trả role này trong GET /admin/users/roles cho người không phải SUPER_ADMIN,
// nên ô chọn vai trò của họ không có lựa chọn "Quản trị hệ thống"
export const SUPER_ADMIN_ROLE_NAME = "ROLE_SUPER_ADMIN";

// Vai trò dự án: tự gán khi giao dự án ở trang Nhân sự dự án, không chọn tay ở trang người dùng
const PROJECT_ROLE_NAMES = ["ROLE_PROJECT_ADMIN", "ROLE_PROJECT_DIRECTOR"];
export const isProjectRole = (name?: string | null): boolean => !!name && PROJECT_ROLE_NAMES.includes(name);

export const roleLabel = (name?: string | null): string => {
  if (!name) return "—";
  const key = name.replace(/^ROLE_/, "");
  return ROLE_NAMES[key] ?? key;
};
