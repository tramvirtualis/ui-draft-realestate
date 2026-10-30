import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { CvRequest, MyCv } from "../../types/job/myCv.types";
import type { PageResponse } from "../../types/common.types";

/** CV (file) của người đang đăng nhập: /me/cvs */
class CvService extends BaseService {
  constructor() {
    super("/me/cvs");
  }

  // GET /me/cvs?page=&size= (BE xếp CV mặc định lên đầu)
  async getMyCvs(page = 0, size = 20): Promise<PageResponse<MyCv>> {
    return toPage(await this.getPage<MyCv>({ page, size }));
  }

  // GET /me/cvs/{id}
  async getMyCv(id: number): Promise<MyCv> {
    return this.getById<MyCv>(id);
  }

  // POST /me/cvs (multipart: title, isDefault, file)
  async upload(request: CvRequest, file: File): Promise<MyCv> {
    const form = new FormData();
    form.append("title", request.title);
    if (request.isDefault !== undefined)
      form.append("isDefault", String(request.isDefault));
    form.append("file", file);
    return this.http.post<MyCv>(this.url(), form);
  }

  // PUT /me/cvs/{id}
  async updateCv(id: number, request: CvRequest): Promise<MyCv> {
    return this.update<MyCv, CvRequest>(id, request);
  }

  // PATCH /me/cvs/{id}/default
  async setDefault(id: number): Promise<MyCv> {
    return this.http.patch<MyCv>(this.url(id, "default"));
  }

  // DELETE /me/cvs/{id}
  async deleteCv(id: number): Promise<void> {
    await this.delete(id);
  }
}

const cvService = new CvService();
export default cvService;
