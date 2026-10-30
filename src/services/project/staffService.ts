import { authHttp } from "../../api/http";
import type { ProjectStaff, StaffCandidate, StaffType } from "../../types/project/staff.types";

const path = (projectId: number, type: StaffType) => `/admin/projects/${projectId}/${type === "ADMIN" ? "admins" : "directors"}`;

async function get(projectId: number): Promise<ProjectStaff> {
  return authHttp.get<ProjectStaff>(`/admin/projects/${projectId}/staff`);
}

async function add(projectId: number, type: StaffType, userId: number): Promise<void> {
  await authHttp.post(path(projectId, type), { userId });
}

async function remove(projectId: number, type: StaffType, userId: number): Promise<void> {
  await authHttp.delete(`${path(projectId, type)}/${userId}`);
}

// Tìm tài khoản theo tên để thêm; tài khoản không giao được kèm lý do
async function candidates(type: StaffType, keyword: string): Promise<StaffCandidate[]> {
  return (await authHttp.get<StaffCandidate[]>("/admin/project-staff/candidates", { params: { type, keyword } })) ?? [];
}

export const adminStaffService = { get, add, remove, candidates };
