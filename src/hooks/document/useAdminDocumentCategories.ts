import { useState } from "react";
import { useToast } from "../../components/common/toastContext";
import useDelayedLoad from "../../components/common/useDelayedLoad";
import { getErrorMessage } from "../../api";
import { adminDocumentService } from "../../services/document/adminDocumentService";
import type { DocumentCategory } from "../../types/document.types";

// CRUD danh mục tài liệu; BE trả cả danh sách (ít bản ghi) nên phân trang ở client
export function useAdminDocumentCategories(pageSize = 8) {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);

  // Chờ 1 giây (có skeleton) rồi mới gọi API khi đổi trang; lần vào đầu tiên gọi ngay
  const list = useDelayedLoad(String(page), () => adminDocumentService.getCategories());

  const all = list.data ?? [];
  const pages = Math.max(1, Math.ceil(all.length / pageSize));
  // Xóa hết dòng ở trang cuối thì lùi về trang trước còn dữ liệu
  const current = Math.min(page, pages - 1);

  // Chạy 1 thao tác, báo kết quả, tải lại danh sách; trả true nếu thành công
  const run = async (action: () => Promise<unknown>, success: string): Promise<boolean> => {
    setBusy(true);
    try {
      await action();
      toast.show(success);
      list.reload();
      return true;
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const add = (name: string) => run(() => adminDocumentService.addCategory({ name }), "Đã thêm danh mục");

  const rename = (c: DocumentCategory, name: string) =>
    run(() => adminDocumentService.editCategory(c.id, { name, slug: c.slug, active: c.active !== false }), "Đã đổi tên danh mục");

  const toggleActive = (c: DocumentCategory) =>
    run(
      () => adminDocumentService.editCategory(c.id, { name: c.name, slug: c.slug, active: c.active === false }),
      c.active === false ? "Đã hiển thị danh mục" : "Đã ẩn danh mục",
    );

  const remove = (c: DocumentCategory) => run(() => adminDocumentService.removeCategory(c.id), `Đã xóa danh mục "${c.name}"`);

  return {
    categories: all.slice(current * pageSize, (current + 1) * pageSize),
    total: all.length,
    page: current,
    pages,
    setPage,
    waiting: list.waiting,
    failed: list.status === "error",
    retry: list.retry,
    busy,
    add,
    rename,
    toggleActive,
    remove,
  };
}
