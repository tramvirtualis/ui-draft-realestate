// Khớp PermissionResponse / RoleDetailResponse / RoleRequest bên BE
export interface Permission {
  code: string; // "NEWS_VIEW"
  description: string; // "Xem tin tức"
}

export interface RoleDetail {
  id: number;
  name: string; // "ROLE_EDITOR"
  system: boolean; // role hệ thống: không đổi tên / xóa được
  permissionsEditable: boolean; // tick lại quyền được (role thường + Admin / Giám đốc dự án)
  permissions: string[];
  userCount: number;
}

export interface RoleRequest {
  name: string; // "EDITOR" — BE tự viết hoa và thêm ROLE_
  permissionCodes: string[];
}

// Tên module theo tiền tố mã quyền: NEWS_VIEW → NEWS
export const PERMISSION_MODULE_LABEL: Record<string, string> = {
  USER: "Người dùng",
  POST: "Cộng đồng",
  NEWS: "Tin tức",
  JOB: "Tuyển dụng",
  EVENT: "Sự kiện",
  NOTIFICATION: "Thông báo",
  PROJECT: "Dự án",
};

// Hậu tố mã quyền → tên cột trên bảng tick (khớp SecurityConfig: GET / còn lại)
export const PERMISSION_ACTION_LABEL: Record<string, string> = {
  VIEW: "Xem",
  MANAGE: "Thêm / sửa / xóa",
};

// "NEWS_VIEW" → { module: "NEWS", action: "VIEW" }
export const splitPermission = (code: string) => {
  const i = code.lastIndexOf("_");
  return { module: code.slice(0, i), action: code.slice(i + 1) };
};
