import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { PageResponse, SavedJob } from "../../types/job/job.types";

/** Tin tuyển dụng đã lưu của người đang đăng nhập: /me/saved-jobs */
class SavedJobService extends BaseService {
  constructor() {
    super("/me/saved-jobs");
  }

  // GET /me/saved-jobs?page=&size= (mới lưu trước)
  async getMySavedJobs(page = 0, size = 10): Promise<PageResponse<SavedJob>> {
    return toPage(await this.getPage<SavedJob>({ page, size }));
  }

  // GET /me/saved-jobs/ids
  async getIds(): Promise<number[]> {
    return (await this.http.get<number[] | null>(this.url("ids"))) ?? [];
  }

  // PUT /me/saved-jobs/{jobId} (gọi lại vẫn chỉ lưu 1 bản)
  async save(jobId: number): Promise<SavedJob> {
    return this.http.put<SavedJob>(this.url(jobId), undefined, { silentLoading: true });
  }

  // DELETE /me/saved-jobs/{jobId}
  async unsave(jobId: number): Promise<void> {
    await this.http.delete(this.url(jobId), { silentLoading: true });
  }
}

const savedJobService = new SavedJobService();
export default savedJobService;
