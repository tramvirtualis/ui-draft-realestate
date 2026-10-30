import { useEffect, useState } from "react";
import newsService from "../../services/news/newsService";
import type { News } from "../../types/new/news.types";

// Vài tin mới nhất (trang chủ, sidebar trang Cộng đồng...)
export function useLatestNews(limit = 5) {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    newsService
      .getLatestNews(0, limit)
      .then((res) => !ignore && setNews(res))
      .catch(() => {
        /* lỗi tải tin: để trống, không chặn trang đang xem */
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [limit]);

  return { news, loading };
}
