import { useState } from "react";
import { EMPTY_FILTER } from "../../services/document/documentService";
import { useDocuments } from "./useDocuments";
import { useDocumentCategories } from "./useDocumentCategories";
import type { DocumentSort, DocumentType } from "../../types/document.types";

const PAGE_SIZE = 10;
export const CATEGORY_LIST_ANCHOR = "danh-sach";

const scrollToList = () => document.getElementById(CATEGORY_LIST_ANCHOR)?.scrollIntoView({ behavior: "smooth" });

// Trang 1 danh mục: tìm danh mục theo slug rồi lấy tài liệu của nó (lọc loại, sắp xếp, phân trang ở server)
export function useKnowledgeCategory(slug: string) {
  const [type, setTypeState] = useState<DocumentType | null>(null);
  const [sort, setSortState] = useState<DocumentSort>("NEWEST");
  const [page, setPage] = useState(0);

  const { categories, total, loading: categoriesLoading } = useDocumentCategories();
  const index = categories.findIndex((c) => c.slug === slug);
  const category = index >= 0 ? categories[index] : null;

  // Chưa tìm ra danh mục thì chưa gọi API, tránh tải nhầm toàn bộ tài liệu
  const list = useDocuments(
    { filter: { ...EMPTY_FILTER, categoryId: category?.id ?? null, type }, sort, page, size: PAGE_SIZE },
    category !== null,
  );

  const setType = (t: DocumentType | null) => {
    setTypeState(t);
    setPage(0);
  };

  const setSort = (s: DocumentSort) => {
    setSortState(s);
    setPage(0);
  };

  const changePage = (p: number) => {
    setPage(p);
    scrollToList();
  };

  return {
    category,
    categoryIndex: index, // để icon trùng với icon ở trang tất cả danh mục
    categories,
    totalDocuments: total,
    categoriesLoading,
    notFound: !categoriesLoading && category === null,
    list,
    loading: categoriesLoading || list.loading,
    type,
    setType,
    sort,
    setSort,
    page,
    setPage: changePage,
  };
}
