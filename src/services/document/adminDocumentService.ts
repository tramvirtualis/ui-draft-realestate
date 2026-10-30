import BaseService from "../base/BaseService";
import { authHttp, toPage } from "../../api/http";
import { UPLOAD_CONFIG } from "../project/projectService";
import type { PageResponse } from "../../types/common.types";
import type { DocumentCategory, DocumentInput, DocumentItem, DocumentType } from "../../types/document.types";

export interface AdminDocumentQuery {
  keyword?: string;
  categoryId?: number | null;
  type?: DocumentType | null;
  published?: boolean | null; // null/undefined = cả ẩn lẫn hiện
  from?: string; // ngày tạo yyyy-MM-dd, gồm cả hai đầu
  to?: string;
  page: number;
  size: number;
}

export interface DocumentCategoryInput {
  name: string;
  slug?: string;
  active?: boolean;
}

const CATEGORY_URL = "/admin/document-categories";

// Gom input + file thành form-data đúng tên field của DocumentRequest bên BE
const toFormData = (input: DocumentInput, file: File | null, thumbnail: File | null): FormData => {
  const form = new FormData();
  form.append("type", input.type);
  if (input.categoryId) form.append("categoryId", String(input.categoryId));
  form.append("title", input.title.trim());
  if (input.slug.trim()) form.append("slug", input.slug.trim());
  form.append("description", input.description.trim());
  if (input.type === "ARTICLE") form.append("content", input.content);
  form.append("published", String(input.published));
  form.append("removeFile", String(input.removeFile));
  form.append("removeThumbnail", String(input.removeThumbnail));
  if (file) form.append("file", file);
  if (thumbnail) form.append("thumbnail", thumbnail);
  return form;
};

/**
 API quản trị tài liệu: /api/admin/documents (cần quyền DOCUMENT_VIEW / DOCUMENT_MANAGE).
 - Tạo / sửa: multipart (field + file PDF/DOCX + thumbnail).
 - Ẩn / hiện: PATCH /{id}/published.
 - Ảnh chèn trong bài viết: POST /content-images → { url }.
 */
class AdminDocumentService extends BaseService {
  constructor() {
    super("/admin/documents");
  }

  async search(query: AdminDocumentQuery): Promise<PageResponse<DocumentItem>> {
    const res = await this.getPage<DocumentItem>({
      keyword: query.keyword?.trim(),
      categoryId: query.categoryId ?? undefined,
      type: query.type ?? undefined,
      published: query.published ?? undefined,
      from: query.from || undefined,
      to: query.to || undefined,
      page: query.page,
      size: query.size,
      sort: "createdAt,desc",
    });
    return toPage(res);
  }

  // Số tài liệu theo trạng thái, dùng cho các thẻ đếm
  async counts(): Promise<{ all: number; published: number; hidden: number }> {
    const total = async (published?: boolean) => (await this.search({ published, page: 0, size: 1 })).totalElements;
    const [all, published, hidden] = await Promise.all([total(), total(true), total(false)]);
    return { all, published, hidden };
  }

  get(id: number): Promise<DocumentItem> {
    return this.getById<DocumentItem>(id);
  }

  add(input: DocumentInput, file: File | null, thumbnail: File | null): Promise<DocumentItem> {
    return authHttp.post<DocumentItem>(this.url(), toFormData(input, file, thumbnail), UPLOAD_CONFIG);
  }

  edit(id: number, input: DocumentInput, file: File | null, thumbnail: File | null): Promise<DocumentItem> {
    return authHttp.put<DocumentItem>(this.url(id), toFormData(input, file, thumbnail), UPLOAD_CONFIG);
  }

  setPublished(id: number, published: boolean): Promise<DocumentItem> {
    return authHttp.patch<DocumentItem>(this.url(id, "published"), { published });
  }

  remove(id: number) {
    return this.delete(id);
  }

  // Editor gọi khi admin chèn ảnh vào bài viết
  async uploadContentImage(image: File): Promise<string> {
    const form = new FormData();
    form.append("image", image);
    const res = await authHttp.post<{ url: string }>(this.url("content-images"), form, UPLOAD_CONFIG);
    return res.url;
  }

  // ---- Danh mục (gồm cả danh mục đang ẩn) ----
  async getCategories(): Promise<DocumentCategory[]> {
    return (await authHttp.get<DocumentCategory[] | null>(CATEGORY_URL)) ?? [];
  }

  addCategory(input: DocumentCategoryInput): Promise<DocumentCategory> {
    return authHttp.post<DocumentCategory>(CATEGORY_URL, { ...input, name: input.name.trim() });
  }

  editCategory(id: number, input: DocumentCategoryInput): Promise<DocumentCategory> {
    return authHttp.put<DocumentCategory>(`${CATEGORY_URL}/${id}`, { ...input, name: input.name.trim() });
  }

  async removeCategory(id: number): Promise<void> {
    await authHttp.delete(`${CATEGORY_URL}/${id}`);
  }
}

export const adminDocumentService = new AdminDocumentService();
