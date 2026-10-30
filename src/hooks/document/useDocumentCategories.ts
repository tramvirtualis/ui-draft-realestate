import { useEffect, useState } from "react";
import documentService from "../../services/document/documentService";
import type { DocumentCategoryWithCount } from "../../types/document.types";

// Danh mục đang hiển thị kèm số tài liệu mỗi danh mục + tổng số tài liệu
export function useDocumentCategories() {
  const [categories, setCategories] = useState<DocumentCategoryWithCount[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    documentService
      .getCategoriesWithCount()
      .then((res) => {
        if (ignore) return;
        setCategories(res.categories);
        setTotal(res.total);
      })
      // Lỗi thì để trống, các phần khác của trang vẫn dùng được
      .catch(() => undefined)
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, []);

  return { categories, total, loading };
}
