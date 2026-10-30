import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useToast } from "../../components/common/toastContext";
import useDelayedLoad from "../../components/common/useDelayedLoad";
import { getErrorMessage } from "../../api";
import { adminDocumentService } from "../../services/document/adminDocumentService";
import type { DocumentCategory, DocumentItem, DocumentType } from "../../types/document.types";

export type DocumentStatusFilter = "all" | "published" | "hidden";

const EMPTY_COUNTS: Record<DocumentStatusFilter, number> = { all: 0, published: 0, hidden: 0 };

const publishedParam = (s: DocumentStatusFilter) => (s === "all" ? null : s === "published");

// Trang quản lý tài liệu: lọc / tìm kiếm / phân trang ở server, ẩn hiện, xóa
export function useAdminDocuments(pageSize = 8) {
  const toast = useToast();
  // keywordDraft: đang gõ; keyword: đã bấm Tìm kiếm
  const [keywordDraft, setKeywordDraft] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<DocumentStatusFilter>("all");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [type, setType] = useState<DocumentType | null>(null);
  // Khoảng ngày tạo (yyyy-MM-dd), rỗng = không lọc
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    adminDocumentService.getCategories().then(setCategories).catch(() => undefined);
  }, []);

  const loadCounts = useCallback(() => adminDocumentService.counts().then(setCounts).catch(() => undefined), []);
  useEffect(() => {
    void loadCounts();
  }, [loadCounts]);

  // Chờ 1 giây (có skeleton) rồi mới gọi API khi đổi trang / bộ lọc; lần vào đầu tiên gọi ngay
  const list = useDelayedLoad(JSON.stringify([keyword, categoryId, type, status, from, to, page, pageSize]), () =>
    adminDocumentService.search({ keyword, categoryId, type, published: publishedParam(status), from, to, page, size: pageSize }),
  );

  const refresh = () => {
    list.reload();
    void loadCounts();
  };

  // Đổi bộ lọc nào cũng quay về trang đầu
  const withFirstPage =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(0);
    };

  const search = (e?: FormEvent) => {
    e?.preventDefault();
    setKeyword(keywordDraft.trim());
    setPage(0);
  };

  const resetFilters = () => {
    setKeywordDraft("");
    setKeyword("");
    setStatus("all");
    setCategoryId(null);
    setType(null);
    setFrom("");
    setTo("");
    setPage(0);
  };

  const togglePublished = async (doc: DocumentItem) => {
    setBusyId(doc.id);
    try {
      await adminDocumentService.setPublished(doc.id, !doc.published);
      toast.show(doc.published ? "Đã ẩn tài liệu" : "Đã hiển thị tài liệu");
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (doc: DocumentItem): Promise<boolean> => {
    try {
      await adminDocumentService.remove(doc.id);
      toast.show(`Đã xóa tài liệu "${doc.title}"`);
      refresh();
      return true;
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
      return false;
    }
  };

  return {
    waiting: list.waiting,
    failed: list.status === "error",
    retry: list.retry,
    items: list.data?.content ?? [],
    total: list.data?.totalElements ?? 0,
    pages: list.data?.totalPages ?? 1,
    page,
    setPage,
    keywordDraft,
    setKeywordDraft,
    search,
    status,
    setStatus: withFirstPage(setStatus),
    categoryId,
    setCategoryId: withFirstPage(setCategoryId),
    type,
    setType: withFirstPage(setType),
    from,
    setFrom: withFirstPage(setFrom),
    to,
    setTo: withFirstPage(setTo),
    badRange: from !== "" && to !== "" && from > to,
    hasFilter: keyword !== "" || status !== "all" || categoryId !== null || type !== null || from !== "" || to !== "",
    resetFilters,
    counts,
    categories,
    busyId,
    togglePublished,
    remove,
  };
}
