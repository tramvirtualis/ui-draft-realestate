// Tên role bên BE ("ROLE_USER"...) đổi sang nhãn hiển thị
const ROLE_LABELS: Record<string, string> = {
  USER: "Thành viên",
  SUPER_ADMIN: "Quản trị hệ thống",
  ADMIN: "Quản trị viên",
  STAFF: "Nhân viên",
  PROJECT_ADMIN: "Admin dự án",
  PROJECT_DIRECTOR: "Giám đốc dự án",
};

// Vai trò tự tạo trên trang Phân quyền (vd ROLE_EDITOR) hiển thị đúng tên "EDITOR"
export const roleLabel = (role: string): string => {
  const key = role.replace(/^ROLE_/, "").toUpperCase();
  return ROLE_LABELS[key] ?? key;
};

// Chưa có avatar thì hiển thị chữ cái đầu của họ và tên
export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
