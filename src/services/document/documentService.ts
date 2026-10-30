import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type {
  DocumentCategory,
  DocumentCategoryWithCount,
  DocumentFilter,
  DocumentItem,
  DocumentSort,
} from "../../types/document.types";

export interface GetDocumentsParams {
  filter: DocumentFilter;
  sort: DocumentSort;
  page?: number;
  size?: number;
}

const DOCUMENT_SORT_PARAM: Record<DocumentSort, string> = {
  NEWEST: "createdAt,desc",
  OLDEST: "createdAt,asc",
  UPDATED: "updatedAt,desc",
};

export const EMPTY_FILTER: DocumentFilter = { keyword: "", categoryId: null, type: null };

// API công khai: chỉ trả tài liệu / danh mục đang hiển thị
class DocumentService extends BaseService {
  constructor() {
    super("/documents", { auth: false });
  }

  // GET /documents?keyword=&categoryId=&type=&page=&size=&sort=
  async getDocuments({ filter, sort, page = 0, size = 6 }: GetDocumentsParams): Promise<PageResponse<DocumentItem>> {
    const res = await this.getPage<DocumentItem>({
      keyword: filter.keyword.trim(),
      categoryId: filter.categoryId,
      type: filter.type,
      page,
      size,
      sort: DOCUMENT_SORT_PARAM[sort],
    });
    return toPage(res);
  }

  // GET /documents/{slug}
  getBySlug(slug: string): Promise<DocumentItem> {
    return this.getById<DocumentItem>(slug);
  }

  // GET /document-categories
  async getCategories(): Promise<DocumentCategory[]> {
    return (await this.http.get<DocumentCategory[] | null>("/document-categories")) ?? [];
  }

  // BE chưa có API đếm → mỗi danh mục gọi 1 trang size=1 để lấy totalElements
  async getCategoriesWithCount(): Promise<{ categories: DocumentCategoryWithCount[]; total: number }> {
    const count = (categoryId: number | null) =>
      this.getDocuments({ filter: { ...EMPTY_FILTER, categoryId }, sort: "NEWEST", size: 1 }).then((p) => p.totalElements);

    const categories = await this.getCategories();
    const [total, ...counts] = await Promise.all([count(null), ...categories.map((c) => count(c.id))]);
    return {
      categories: categories.map((c, i) => ({ ...c, documentCount: counts[i] })),
      total,
    };
  }

  // Cùng danh mục, bỏ chính nó
  async getRelated(doc: DocumentItem, limit = 4): Promise<DocumentItem[]> {
    const page = await this.getDocuments({
      filter: { ...EMPTY_FILTER, categoryId: doc.category?.id ?? null },
      sort: "NEWEST",
      size: limit + 1,
    });
    return page.content.filter((d) => d.id !== doc.id).slice(0, limit);
  }
}

const documentService = new DocumentService();
export default documentService;
