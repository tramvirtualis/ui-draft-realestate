import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type {
  CvTemplateDetail,
  CvTemplateInput,
  CvTemplateSummary,
} from "../../types/job/cvTemplate.types";

class AdminCvTemplateService extends BaseService {
  constructor() {
    super("/admin/cv-templates");
  }

  // GET ?keyword=&active=&page=&size= (active bỏ trống = cả ẩn lẫn hiện)
  async search(
    keyword: string,
    active: boolean | null,
    page = 0,
    size = 12
  ): Promise<PageResponse<CvTemplateSummary>> {
    return toPage(
      await this.getPage<CvTemplateSummary>({ keyword, active, page, size })
    );
  }

  get(id: number) {
    return this.getById<CvTemplateDetail>(id);
  }

  add(input: CvTemplateInput) {
    return this.create<CvTemplateDetail, CvTemplateInput>(input);
  }

  edit(id: number, input: CvTemplateInput) {
    return this.update<CvTemplateDetail, CvTemplateInput>(id, input);
  }

  remove(id: number) {
    return this.delete(id);
  }

  // PATCH /{id}/active: hiện / ẩn với người dùng
  setActive(id: number, active: boolean) {
    return this.http.patch<CvTemplateDetail>(this.url(id, "active"), {
      active,
    });
  }

  // PUT /{id}/thumbnail (multipart: file) — thay ảnh xem trước
  uploadThumbnail(id: number, file: File) {
    const form = new FormData();
    form.append("file", file);
    return this.http.put<CvTemplateDetail>(this.url(id, "thumbnail"), form);
  }

  // POST /{id}/duplicate: tạo bản sao ở dạng ẩn
  duplicate(id: number) {
    return this.http.post<CvTemplateDetail>(this.url(id, "duplicate"));
  }
}

export const adminCvTemplateService = new AdminCvTemplateService();
