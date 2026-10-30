// Nhân sự dự án (bảng project_admins, project_directors)

export type StaffType = "ADMIN" | "DIRECTOR";

export interface StaffMember {
  userId: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

// Kết quả tìm để thêm vào dự án; unavailableReason có giá trị thì không giao được (vd đang có vai trò HR)
export interface StaffCandidate extends StaffMember {
  unavailableReason: string | null;
}

export interface ProjectStaff {
  admins: StaffMember[];
  directors: StaffMember[];
  canManageAdmins: boolean; // chỉ SUPER_ADMIN gỡ admin dự án
  canManageDirectors: boolean; // admin của dự án hoặc SUPER_ADMIN
  canAddAdmins: boolean; // thêm admin dự án: admin của dự án hoặc SUPER_ADMIN
}
