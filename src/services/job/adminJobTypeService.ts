import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type {
  JobType,
  JobTypeRequest,
  PageResponse,
} from "../../types/job/job.types";

class AdminJobTypeService extends BaseService {
  constructor() {
    super("/admin/job-types");
  }

  // GET /admin/job-types?page=&size=&sort=name,asc
  async list(page = 0, size = 20): Promise<PageResponse<JobType>> {
    return toPage(
      await this.getPage<JobType>({ page, size, sort: "name,asc" })
    );
  }

  // Toàn bộ loại công việc (cho ô chọn ở form tin tuyển dụng / bộ lọc)
  async all(): Promise<JobType[]> {
    return (await this.list(0, 200)).content;
  }

  add(request: JobTypeRequest): Promise<JobType> {
    return this.create<JobType, JobTypeRequest>(request);
  }

  edit(id: number, request: JobTypeRequest): Promise<JobType> {
    return this.update<JobType, JobTypeRequest>(id, request);
  }

  // BE báo lỗi JOB_TYPE_IN_USE nếu đang có tin dùng loại này (chỉ ẩn được)
  async remove(id: number): Promise<void> {
    await this.delete(id);
  }
}

export const adminJobTypeService = new AdminJobTypeService();
