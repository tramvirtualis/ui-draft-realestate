import { useEffect, useState } from "react";
import documentService, { type GetDocumentsParams } from "../../services/document/documentService";
import { getErrorMessage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type { DocumentItem } from "../../types/document.types";

const EMPTY_PAGE: PageResponse<DocumentItem> = {
  content: [],
  totalElements: 0,
  totalPages: 1,
  number: 0,
  size: 0,
};

// Danh sách tài liệu công khai theo bộ lọc / sắp xếp / trang; enabled = false thì chưa gọi API (vd chờ tìm ra danh mục)
export function useDocuments({ filter, sort, page = 0, size = 6 }: GetDocumentsParams, enabled = true) {
  const [result, setResult] = useState<PageResponse<DocumentItem>>(EMPTY_PAGE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // filter là object mới mỗi lần render → so sánh theo nội dung
  const filterKey = JSON.stringify(filter);

  useEffect(() => {
    if (!enabled) return;
    let ignore = false;
    setLoading(true);
    setError(null);

    documentService
      .getDocuments({ filter: JSON.parse(filterKey), sort, page, size })
      .then((res) => !ignore && setResult(res))
      .catch((err) => {
        if (ignore) return;
        setResult(EMPTY_PAGE);
        setError(getErrorMessage(err));
      })
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [filterKey, sort, page, size, enabled]);

  return { result, loading, error };
}
