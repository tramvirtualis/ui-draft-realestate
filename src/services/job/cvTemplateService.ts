import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type {
  CvTemplateDetail,
  CvTemplateSummary,
} from "../../types/job/cvTemplate.types";

//Mẫu CV đang hiển thị cho người dùng chọn
class CvTemplateService extends BaseService {
  constructor() {
    super("/cv-templates", { auth: false });
  }

  // GET /cv-templates?page=&size= (BE sắp theo sortOrder, rồi tên)
  async list(page = 0, size = 50): Promise<PageResponse<CvTemplateSummary>> {
    return toPage(await this.getPage<CvTemplateSummary>({ page, size }));
  }

  // GET /cv-templates/{id}: kèm HTML/CSS để render
  get(id: number) {
    return this.getById<CvTemplateDetail>(id);
  }
}

const cvTemplateService = new CvTemplateService();
export default cvTemplateService;
