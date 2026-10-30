import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type {
  Company,
  CompanyFiles,
  CompanyInput,
  CompanyStatus,
} from "../../types/job/company.types";

// Thông tin + file → form-data. File null thì không gửi (BE giữ file cũ khi sửa)
const toForm = (input: CompanyInput, files: CompanyFiles): FormData => {
  const form = new FormData();
  (Object.keys(input) as (keyof CompanyInput)[]).forEach((k) =>
    form.append(k, input[k].trim())
  );
  if (files.logo) form.append("logo", files.logo);
  if (files.businessLicense)
    form.append("businessLicense", files.businessLicense);
  if (files.idCardFront) form.append("idCardFront", files.idCardFront);
  if (files.idCardBack) form.append("idCardBack", files.idCardBack);
  return form;
};

/** Hồ sơ nhà tuyển dụng của người đang đăng nhập: /me/company */
class MyCompanyService extends BaseService {
  constructor() {
    super("/me/company");
  }

  // GET /me/company — null nếu chưa đăng ký.
  // BE bỏ field `data` khi null → unwrap trả nguyên vỏ { code, message }, nên chỉ coi là có hồ sơ khi có id
  async get(): Promise<Company | null> {
    const company = await this.http.get<Company | null>(this.url());
    return company?.id ? company : null;
  }

  // POST /me/company (multipart, bắt buộc đủ 3 file)
  register(input: CompanyInput, files: CompanyFiles): Promise<Company> {
    return this.http.post<Company>(this.url(), toForm(input, files));
  }

  // PUT /me/company (multipart, file không bắt buộc). Bị từ chối → tự gửi lại chờ duyệt
  updateMine(input: CompanyInput, files: CompanyFiles): Promise<Company> {
    return this.http.put<Company>(this.url(), toForm(input, files));
  }
}

export interface AdminCompanyQuery {
  keyword: string; // tên / MST / email
  status: CompanyStatus | "";
  page: number;
  size: number;
}

/** Duyệt nhà tuyển dụng: /admin/companies (GET cần COMPANY_VIEW, PATCH cần COMPANY_MANAGE) */
class AdminCompanyService extends BaseService {
  constructor() {
    super("/admin/companies");
  }

  async search(q: AdminCompanyQuery): Promise<PageResponse<Company>> {
    return toPage(
      await this.getPage<Company>({
        keyword: q.keyword.trim(),
        status: q.status,
        page: q.page,
        size: q.size,
        sort: "createdAt,desc",
      })
    );
  }

  // Số hồ sơ theo trạng thái ("" = tất cả) cho các thẻ lọc
  async count(status: CompanyStatus | ""): Promise<number> {
    return toPage(await this.getPage<Company>({ status, page: 0, size: 1 }))
      .totalElements;
  }

  // GET /admin/companies/{id}: số CCCD đầy đủ + link giấy tờ mới (hạn 10 phút)
  get(id: number): Promise<Company> {
    return this.getById<Company>(id);
  }

  // PATCH /admin/companies/{id}/status — reason bắt buộc khi REJECTED / SUSPENDED
  setStatus(
    id: number,
    status: CompanyStatus,
    reason?: string
  ): Promise<Company> {
    return this.http.patch<Company>(this.url(id, "status"), {
      status,
      reason: reason?.trim() || undefined,
    });
  }
}

export const myCompanyService = new MyCompanyService();
export const adminCompanyService = new AdminCompanyService();
