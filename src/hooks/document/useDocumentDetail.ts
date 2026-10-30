import { useEffect, useState } from "react";
import documentService from "../../services/document/documentService";
import type { DocumentItem } from "../../types/document.types";

// Chi tiết tài liệu theo slug + tài liệu cùng danh mục
export function useDocumentDetail(slug: string) {
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [related, setRelated] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setRelated([]);

    documentService
      .getBySlug(slug)
      .then(async (item) => {
        if (ignore) return;
        setDoc(item);
        // Phần phụ lỗi thì để trống, không ảnh hưởng tài liệu chính
        const rel = await documentService.getRelated(item).catch(() => []);
        if (!ignore) setRelated(rel);
      })
      // 404 / tài liệu đã ẩn → hiện màn "Không tìm thấy"
      .catch(() => !ignore && setDoc(null))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [slug]);

  return { doc, related, loading };
}
