import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type {
  AdminJob,
  JobRequest,
  JobReviewStatus,
  JobStatus,
} from "../../types/job/job.types";
import type {
  Application,
  ApplicationStatus,
  ApplicationStatusRequest,
} from "../../types/applicationHistory.types";

export interface EmployerJobQuery {
  keyword: string;
  status: JobStatus | "";
  reviewStatus: JobReviewStatus | "";
  page: number;
  size: number;
}

/** Tin tuyển dụng của công ty mình: /employer/jobs (cần công ty đã duyệt) */
class EmployerJobService extends BaseService {
  constructor() {
    super("/employer/jobs");
  }

  async search(q: EmployerJobQuery): Promise<PageResponse<AdminJob>> {
    return toPage(
      await this.getPage<AdminJob>({
        keyword: q.keyword.trim(),
        status: q.status,
        reviewStatus: q.reviewStatus,
        page: q.page,
        size: q.size,
        sort: "createdAt,desc",
      })
    );
  }

  // Số tin theo trạng thái duyệt ("" = tất cả) cho các thẻ lọc
  async count(reviewStatus: JobReviewStatus | ""): Promise<number> {
    return toPage(
      await this.getPage<AdminJob>({ reviewStatus, page: 0, size: 1 })
    ).totalElements;
  }

  get(id: number): Promise<AdminJob> {
    return this.getById<AdminJob>(id);
  }

  // POST → luôn chờ admin duyệt
  add(request: JobRequest): Promise<AdminJob> {
    return this.create<AdminJob, JobRequest>(request);
  }

  // PUT → chờ duyệt lại
  edit(id: number, request: JobRequest): Promise<AdminJob> {
    return this.update<AdminJob, JobRequest>(id, request);
  }

  // PATCH /status: mở / tạm dừng / đóng, không cần duyệt lại
  setStatus(id: number, status: JobStatus): Promise<AdminJob> {
    return this.http.patch<AdminJob>(this.url(id, "status"), { status });
  }

  async remove(id: number): Promise<void> {
    await this.delete(id);
  }
}

export interface EmployerApplicationQuery {
  keyword: string;
  status: ApplicationStatus | "";
  jobId: number | null;
  page: number;
  size: number;
}

/** Đơn ứng tuyển vào tin của công ty mình: /employer/applications */
class EmployerApplicationService extends BaseService {
  constructor() {
    super("/employer/applications");
  }

  async search(
    q: EmployerApplicationQuery
  ): Promise<PageResponse<Application>> {
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

  async count(
    status: ApplicationStatus | "",
    jobId: number | null
  ): Promise<number> {
    return toPage(
      await this.getPage<Application>({ status, jobId, page: 0, size: 1 })
    ).totalElements;
  }

  get(id: number): Promise<Application> {
    return this.getById<Application>(id);
  }

  setStatus(
    id: number,
    request: ApplicationStatusRequest
  ): Promise<Application> {
    return this.http.patch<Application>(this.url(id, "status"), request);
  }
}

export const employerJobService = new EmployerJobService();
export const employerApplicationService = new EmployerApplicationService();
