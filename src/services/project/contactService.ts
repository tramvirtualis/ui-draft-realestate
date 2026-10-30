import { publicHttp } from "../../api/http";

// Đầu mối liên hệ của dự án ở khung booking: giám đốc + admin dự án (GET /contacts?projectId=, công khai)
export interface ContactDto {
  name: string;
  role: string; // "Giám đốc dự án" | "Admin dự án"
  phone: string;
  zaloUrl: string | null;
  avatarUrl: string | null;
}

const cache = new Map<number, Promise<ContactDto[]>>();

// Ít thay đổi: mỗi dự án tải một lần cho cả phiên, lỗi thì cho tải lại lần sau
export function getContacts(projectId: number): Promise<ContactDto[]> {
  let request = cache.get(projectId);
  if (!request) {
    request = publicHttp.get<ContactDto[]>("/contacts", { params: { projectId } }).then((list) => list ?? []);
    request.catch(() => cache.delete(projectId));
    cache.set(projectId, request);
  }
  return request;
}
