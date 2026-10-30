import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type { AdminUser, AdminUserStats, AdminUserStatus, RoleOption } from "../../types/admin/adminUser.types";

export interface AdminUserQuery {
  keyword?: string;
  roleId?: number | null;
  status?: AdminUserStatus | null;
  from?: string; // yyyy-MM-dd
  to?: string; // yyyy-MM-dd
  page: number;
  size: number;
}

export interface AdminUserInput {
  fullName: string;
  email: string;
  phone: string; // rỗng = không có số điện thoại
  roleId: number;
}

// Khớp AdminUserCreateRequest bên BE
export interface AdminUserCreateInput extends AdminUserInput {
  password: string;
  confirmPassword: string;
}

/**
 API quản trị người dùng: /api/admin/users (chỉ ADMIN).
 - Danh sách lọc ở server: keyword (tên / email / SĐT), roleId, status, from, to, page, size.
 - Khóa / mở khóa: PATCH /{id}/lock; đổi vai trò: PATCH /{id}/role; thẻ đếm: GET /stats; vai trò: GET /roles.
 */
class AdminUserService extends BaseService {
  constructor() {
    super("/admin/users");
  }

  async search(query: AdminUserQuery): Promise<PageResponse<AdminUser>> {
    return toPage(
      await this.getPage<AdminUser>({
        keyword: query.keyword?.trim(),
        roleId: query.roleId ?? undefined,
        status: query.status ?? undefined,
        from: query.from || undefined,
        to: query.to || undefined,
        page: query.page,
        size: query.size,
        sort: "createdAt,desc",
      }),
    );
  }

  stats(): Promise<AdminUserStats> {
    return this.http.get<AdminUserStats>(this.url("stats"));
  }

  roles(): Promise<RoleOption[]> {
    return this.getList<RoleOption>(undefined, "roles");
  }

  get(id: number): Promise<AdminUser> {
    return this.getById<AdminUser>(id);
  }

  // POST /admin/users (JSON) — tạo tài khoản đã kích hoạt sẵn, đăng nhập được ngay
  createUser(input: AdminUserCreateInput): Promise<AdminUser> {
    return this.create<AdminUser, AdminUserCreateInput>({
      ...input,
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
    });
  }

  // PUT /admin/users/{id} (JSON) — sửa thông tin, không gồm mật khẩu
  edit(id: number, input: AdminUserInput): Promise<AdminUser> {
    return this.update<AdminUser, AdminUserInput>(id, {
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      roleId: input.roleId,
    });
  }

  // PATCH /admin/users/{id}/password — đặt mật khẩu mới (mật khẩu cũ không bao giờ trả về)
  async changePassword(id: number, newPassword: string, confirmPassword: string): Promise<void> {
    await this.http.patch(this.url(id, "password"), { newPassword, confirmPassword });
  }

  setLocked(id: number, locked: boolean): Promise<AdminUser> {
    return this.http.patch<AdminUser>(this.url(id, "lock"), { locked });
  }

  changeRole(id: number, roleId: number): Promise<AdminUser> {
    return this.http.patch<AdminUser>(this.url(id, "role"), { roleId });
  }
}

export const adminUserService = new AdminUserService();
