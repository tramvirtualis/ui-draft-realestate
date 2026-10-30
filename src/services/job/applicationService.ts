import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { Application } from "../../types/applicationHistory.types";
import type { ApplicationRequest } from "../../types/job/jobDetail.types";
import type { PageResponse } from "../../types/common.types";

// Gom request + file CV vào FormData cho @ModelAttribute + @RequestPart("cvFile")
const toFormData = (
  request: ApplicationRequest,
  cvFile?: File | null
): FormData => {
  const form = new FormData();
  Object.entries(request).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "")
      form.append(key, String(value));
  });
  if (cvFile) form.append("cvFile", cvFile);
  return form;
};

/** Ứng viên nộp đơn và theo dõi đơn của chính mình (cần đăng nhập → authHttp) */
class ApplicationService extends BaseService {
  constructor() {
    super("");
  }

  // POST /jobs/{jobId}/applications (multipart: cvId hoặc cvFile)
  async apply(
    jobId: number,
    request: ApplicationRequest,
    cvFile?: File | null
  ): Promise<Application> {
    return this.http.post<Application>(
      this.url("jobs", jobId, "applications"),
      toFormData(request, cvFile)
    );
  }

  // GET /me/applications?page=&size=
  async getMyApplications(
    page = 0,
    size = 10
  ): Promise<PageResponse<Application>> {
    const res = await this.getPage<Application>(
      { page, size, sort: "createdAt,desc" },
      "me/applications"
    );
    return toPage(res);
  }

  // GET /me/applications/{id} (kèm statusLogs)
  async getMyApplication(id: number): Promise<Application> {
    return this.http.get<Application>(this.url("me/applications", id));
  }

  // PATCH /me/applications/{id}/withdraw (chỉ khi PENDING / REVIEWING)
  async withdraw(id: number): Promise<Application> {
    return this.http.patch<Application>(
      this.url("me/applications", id, "withdraw")
    );
  }
}

const applicationService = new ApplicationService();
export default applicationService;
