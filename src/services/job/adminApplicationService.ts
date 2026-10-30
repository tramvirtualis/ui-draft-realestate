import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type {
  Application,
  ApplicationStatus,
  ApplicationStatusRequest,
} from "../../types/applicationHistory.types";

export interface AdminApplicationQuery {
  keyword: string; // tên / email / SĐT
  status: ApplicationStatus | "";
  jobId: number | null;
  page: number;
  size: number;
}

class AdminApplicationService extends BaseService {
  constructor() {
    super("/admin/applications");
  }

  // GET /admin/applications?jobId=&status=&keyword=&page=&size=
  async search(q: AdminApplicationQuery): Promise<PageResponse<Application>> {
    return toPage(
      await this.getPage<Application>({
        keyword: q.keyword.trim(),
        status: q.status,
        jobId: q.jobId,
        page: q.page,
        size: q.size,
        sort: "createdAt,desc",
      })
    );
  }

  // Số đơn theo trạng thái ("" = tất cả) trong phạm vi tin đang lọc
  async count(
    status: ApplicationStatus | "",
    jobId: number | null
  ): Promise<number> {
    return toPage(
      await this.getPage<Application>({ status, jobId, page: 0, size: 1 })
    ).totalElements;
  }

  // GET /admin/applications/{id}: kèm lịch sử trạng thái
  get(id: number): Promise<Application> {
    return this.getById<Application>(id);
  }

  // PATCH /admin/applications/{id}/status
  setStatus(
    id: number,
    request: ApplicationStatusRequest
  ): Promise<Application> {
    return this.http.patch<Application>(this.url(id, "status"), request);
  }

  // DELETE /admin/applications/{id} (xóa mềm)
  async remove(id: number): Promise<void> {
    await this.delete(id);
  }
}

export const adminApplicationService = new AdminApplicationService();
