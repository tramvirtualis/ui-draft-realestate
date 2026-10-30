import { useEffect, useState } from "react";
import newsService, { type GetNewsParams } from "../../services/news/newsService";
import { getErrorMessage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type { News } from "../../types/new/news.types";

const EMPTY_PAGE: PageResponse<News> = {
  content: [],
  totalElements: 0,
  totalPages: 1,
  number: 0,
  size: 0,
};

// Danh sách tin theo bộ lọc / sắp xếp / trang
export function useNews({ filter, sort, page = 0, size = 9 }: GetNewsParams) {
  const [result, setResult] = useState<PageResponse<News>>(EMPTY_PAGE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // filter là object mới mỗi lần render → so sánh theo nội dung
  const filterKey = JSON.stringify(filter);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    newsService
      .getNews({ filter: JSON.parse(filterKey), sort, page, size })
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
  }, [filterKey, sort, page, size]);

  return { result, loading, error };
}
