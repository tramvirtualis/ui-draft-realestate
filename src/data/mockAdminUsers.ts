// TODO: thay bằng dữ liệu gọi từ API khi backend có API quản trị người dùng (chỉ là dữ liệu mẫu cho giao diện)

export type UserRole = "admin" | "recruiter" | "editor" | "candidate";
export type UserStatus = "active" | "pending" | "locked";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  status: UserStatus;
  lastAccess: string;
}

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Quản trị viên",
  recruiter: "Nhà tuyển dụng",
  editor: "Biên tập viên",
  candidate: "Ứng viên",
};

// Màu badge vai trò: quản trị/nhà tuyển dụng nổi bật, còn lại trung tính
export const ROLE_TONE: Record<UserRole, { badge: string; dot: string }> = {
  admin: { badge: "bg-primary-100 text-primary-700", dot: "bg-primary-600" },
  recruiter: { badge: "bg-blue-100 text-blue-700", dot: "bg-blue-600" },
  editor: { badge: "bg-line text-body", dot: "bg-muted" },
  candidate: { badge: "bg-line text-body", dot: "bg-muted" },
};

export const STATUS_LABEL: Record<UserStatus, string> = {
  active: "Đang hoạt động",
  pending: "Chờ xác minh",
  locked: "Đã khóa",
};

export const STATUS_TONE: Record<UserStatus, { badge: string; dot: string }> = {
  active: { badge: "bg-success/10 text-success", dot: "bg-success" },
  pending: { badge: "bg-amber-100 text-warning", dot: "bg-warning" },
  locked: { badge: "bg-danger/10 text-danger", dot: "bg-danger" },
};

// Nhãn trong form chỉnh sửa (trạng thái "Đã khóa" gọi là "Tạm ngưng")
export const STATUS_OPTION_LABEL: Record<UserStatus, string> = {
  active: "Đang hoạt động",
  locked: "Tạm ngưng",
  pending: "Chờ xác minh",
};

export const ROLES = Object.keys(ROLE_LABEL) as UserRole[];
export const STATUSES = Object.keys(STATUS_LABEL) as UserStatus[];

export const MOCK_ADMIN_USERS: AdminUser[] = [
  { id: 1, name: "Hoàng Ngọc Anh", email: "ngocanh@novatech.vn", role: "admin", organization: "NovaTech Việt Nam", status: "active", lastAccess: "2 phút trước" },
  { id: 2, name: "Đỗ Minh Tuấn", email: "tuan.dm@talentflow.vn", role: "recruiter", organization: "TalentFlow", status: "active", lastAccess: "18 phút trước" },
  { id: 3, name: "Lê Thu Phương", email: "phuong.le@finx.vn", role: "editor", organization: "FinX Việt Nam", status: "active", lastAccess: "Hôm qua, 16:42" },
  { id: 4, name: "Quách Văn Vũ", email: "vuvu@cloudnine.io", role: "recruiter", organization: "CloudNine", status: "pending", lastAccess: "Chưa đăng nhập" },
  { id: 5, name: "Nguyễn Gia Hân", email: "han.nguyen@gmail.com", role: "candidate", organization: "Cá nhân", status: "locked", lastAccess: "28/09/2026" },
  { id: 6, name: "Trần Bảo Châu", email: "chau.tran@novatech.vn", role: "editor", organization: "NovaTech Việt Nam", status: "active", lastAccess: "3 giờ trước" },
  { id: 7, name: "Phạm Quốc Đạt", email: "dat.pham@talentflow.vn", role: "recruiter", organization: "TalentFlow", status: "active", lastAccess: "Hôm qua, 09:15" },
];

export interface UserStat {
  key: string;
  label: string;
  value: string;
  note: string;
  tone: "green" | "violet" | "amber" | "orange";
  icon: "users" | "active" | "pending" | "roles";
}

export const USER_STATS: UserStat[] = [
  { key: "total", label: "Tổng người dùng", value: "12.480", note: "+326 tháng này", tone: "green", icon: "users" },
  { key: "active", label: "Đang hoạt động", value: "11.926", note: "95,6% tổng số", tone: "violet", icon: "active" },
  { key: "pending", label: "Chờ xác minh", value: "126", note: "24 mới hôm nay", tone: "amber", icon: "pending" },
  { key: "roles", label: "Vai trò tùy chỉnh", value: "38", note: "6 đang sử dụng", tone: "orange", icon: "roles" },
];

export const ORGANIZATIONS = ["NovaTech Việt Nam", "TalentFlow", "FinX Việt Nam", "CloudNine", "Cá nhân"];
