import { useEffect, useState } from "react";
import newsService from "../../services/news/newsService";
import type { News } from "../../types/new/news.types";

// Chi tiết một tin + tin liên quan + tin mới nhất (trừ chính nó)
export function useNewsDetail(newsId: number) {
  const [news, setNews] = useState<News | null>(null);
  const [related, setRelated] = useState<News[]>([]);
  const [latest, setLatest] = useState<News[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    newsService
      .getNewsById(newsId)
      .then(async (item) => {
        if (ignore) return;
        setNews(item);
        if (!item) return;

        const [rel, lat] = await Promise.all([
          // Phần phụ lỗi thì để trống, không ảnh hưởng bài chính
          newsService.getRelatedNews(item).catch(() => []),
          newsService.getLatestNews(item.id).catch(() => []),
        ]);
        if (ignore) return;
        setRelated(rel);
        setLatest(lat);
      })
      .catch(() => {
        // 404 / bài đã ẩn → hiện màn "Không tìm thấy bài viết"
        if (!ignore) setNews(null);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [newsId]);

  return { news, related, latest, loading };
}
