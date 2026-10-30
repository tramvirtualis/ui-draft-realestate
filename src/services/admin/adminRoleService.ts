import BaseService from "../base/BaseService";
import type { Permission, RoleDetail, RoleRequest } from "../../types/admin/role.types";

/**
 Trang phân quyền (chỉ SUPER_ADMIN):
 GET /admin/permissions, GET/POST /admin/roles, PUT/DELETE /admin/roles/{id}.
 */
class AdminRoleService extends BaseService {
  constructor() {
    super("/admin/roles");
  }

  list(): Promise<RoleDetail[]> {
    return this.getList<RoleDetail>();
  }

  // Danh sách quyền nằm ở /admin/permissions, không nằm dưới /admin/roles
  async permissions(): Promise<Permission[]> {
    return (await this.http.get<Permission[] | null>("/admin/permissions")) ?? [];
  }

  add(request: RoleRequest): Promise<RoleDetail> {
    return this.create<RoleDetail, RoleRequest>(request);
  }

  // Danh sách quyền gửi lên thay thế toàn bộ quyền cũ
  edit(id: number, request: RoleRequest): Promise<RoleDetail> {
    return this.update<RoleDetail, RoleRequest>(id, request);
  }

  // BE báo ROLE_IN_USE nếu còn người dùng, ROLE_SYSTEM_LOCKED nếu là role hệ thống
  async remove(id: number): Promise<void> {
    await this.delete(id);
  }
}

export const adminRoleService = new AdminRoleService();
