import { useState, type FormEvent } from "react";
import { EMPTY_FILTER } from "../../services/document/documentService";
import { useDocuments } from "./useDocuments";
import { useDocumentCategories } from "./useDocumentCategories";
import type { DocumentSort, DocumentType } from "../../types/document.types";

const PAGE_SIZE = 6;
const FEATURED_SIZE = 4;
export const LIST_ANCHOR = "tai-lieu";

const scrollToList = () => document.getElementById(LIST_ANCHOR)?.scrollIntoView({ behavior: "smooth" });

// Toàn bộ state của trang Thư viện kiến thức: bộ lọc, danh sách, nổi bật, danh mục
export function useKnowledgePage() {
  // keywordDraft: đang gõ; keyword: đã bấm Tìm kiếm
  const [keywordDraft, setKeywordDraft] = useState("");
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryIdState] = useState<number | null>(null);
  const [type, setTypeState] = useState<DocumentType | null>(null);
  const [sort, setSortState] = useState<DocumentSort>("NEWEST");
  const [page, setPage] = useState(0);
  const [featuredCat, setFeaturedCat] = useState<number | null>(null);

  const { categories, total, loading: categoriesLoading } = useDocumentCategories();
  const list = useDocuments({ filter: { keyword, categoryId, type }, sort, page, size: PAGE_SIZE });
  const featured = useDocuments({
    filter: { ...EMPTY_FILTER, categoryId: featuredCat },
    sort: "UPDATED",
    size: FEATURED_SIZE,
  });

  // Ô tìm kiếm ở hero và ở bộ lọc dùng chung keywordDraft
  const search = (e?: FormEvent, scroll = false) => {
    e?.preventDefault();
    setKeyword(keywordDraft.trim());
    setPage(0);
    if (scroll) scrollToList();
  };

  const setCategoryId = (id: number | null, scroll = false) => {
    setCategoryIdState(id);
    setPage(0);
    if (scroll) scrollToList();
  };

  const setType = (t: DocumentType | null) => {
    setTypeState(t);
    setPage(0);
  };

  const setSort = (s: DocumentSort) => {
    setSortState(s);
    setPage(0);
  };

  const clearFilters = () => {
    setKeywordDraft("");
    setKeyword("");
    setCategoryIdState(null);
    setTypeState(null);
    setPage(0);
  };

  const changePage = (p: number) => {
    setPage(p);
    scrollToList();
  };

  return {
    keywordDraft,
    setKeywordDraft,
    keyword,
    search,
    categoryId,
    setCategoryId,
    type,
    setType,
    sort,
    setSort,
    page,
    setPage: changePage,
    hasFilter: keyword !== "" || categoryId !== null || type !== null,
    clearFilters,
    categories,
    totalDocuments: total,
    categoriesLoading,
    list,
    featured,
    featuredCat,
    setFeaturedCat,
  };
}
