import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type {
  AdminJob,
  EmploymentType,
  ExperienceLevel,
  JobRequest,
  JobReviewStatus,
  JobStatus,
  PageResponse,
} from "../../types/job/job.types";

export interface AdminJobQuery {
  keyword: string;
  status: JobStatus | "";
  jobTypeId: number | null;
  employmentType: EmploymentType | "";
  experienceLevel: ExperienceLevel | "";
  reviewStatus?: JobReviewStatus | "";
  // "employer" = tin nhà tuyển dụng, "internal" = tin nội bộ, "" = tất cả
  source?: "" | "employer" | "internal";
  page: number;
  size: number;
}

class AdminJobService extends BaseService {
  constructor() {
    super("/admin/jobs");
  }

  // GET /admin/jobs?status=&reviewStatus=&fromEmployer=&jobTypeId=&employmentType=&experienceLevel=&keyword=&page=&size=
  async search(q: AdminJobQuery): Promise<PageResponse<AdminJob>> {
    return toPage(
      await this.getPage<AdminJob>({
        keyword: q.keyword.trim(),
        status: q.status,
        reviewStatus: q.reviewStatus,
        fromEmployer: q.source ? q.source === "employer" : undefined,
        jobTypeId: q.jobTypeId,
        employmentType: q.employmentType,
        experienceLevel: q.experienceLevel,
        page: q.page,
        size: q.size,
        sort: "createdAt,desc",
      })
    );
  }

  // Số tin theo trạng thái ("" = tất cả), lấy từ totalElements
  async count(status: JobStatus | ""): Promise<number> {
    return toPage(await this.getPage<AdminJob>({ status, page: 0, size: 1 }))
      .totalElements;
  }

  // Số tin đang chờ duyệt (hàng chờ của admin)
  async countPendingReview(): Promise<number> {
    return toPage(
      await this.getPage<AdminJob>({
        reviewStatus: "PENDING",
        page: 0,
        size: 1,
      })
    ).totalElements;
  }

  // GET /admin/jobs/{id}
  get(id: number): Promise<AdminJob> {
    return this.getById<AdminJob>(id);
  }

  // POST /admin/jobs (JSON); không gửi status thì BE để DRAFT
  add(request: JobRequest): Promise<AdminJob> {
    return this.create<AdminJob, JobRequest>(request);
  }

  // PUT /admin/jobs/{id}
  edit(id: number, request: JobRequest): Promise<AdminJob> {
    return this.update<AdminJob, JobRequest>(id, request);
  }

  // PATCH /admin/jobs/{id}/status
  setStatus(id: number, status: JobStatus): Promise<AdminJob> {
    return this.http.patch<AdminJob>(this.url(id, "status"), { status });
  }

  // PATCH /admin/jobs/{id}/review — duyệt / từ chối (gỡ) tin; reason bắt buộc khi REJECTED
  review(
    id: number,
    status: Exclude<JobReviewStatus, "PENDING">,
    reason?: string
  ): Promise<AdminJob> {
    return this.http.patch<AdminJob>(this.url(id, "review"), {
      status,
      reason: reason?.trim() || undefined,
    });
  }

  // DELETE /admin/jobs/{id}
  async remove(id: number): Promise<void> {
    await this.delete(id);
  }
}

export const adminJobService = new AdminJobService();
