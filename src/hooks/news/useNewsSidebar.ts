import { useEffect, useState } from "react";
import newsService from "../../services/news/newsService";
import type { News, NewsCategoryWithCount, ProjectWithCount } from "../../types/new/news.types";

// Chuyên mục, dự án kèm số bài + tổng số bài + tin nổi bật cho trang Tin tức
export function useNewsSidebar() {
  const [categories, setCategories] = useState<NewsCategoryWithCount[]>([]);
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [featured, setFeatured] = useState<News[]>([]);

  useEffect(() => {
    let ignore = false;
    newsService
      .getSidebarData()
      .then((res) => {
        if (ignore) return;
        setCategories(res.categories);
        setProjects(res.projects);
        setTotal(res.total);
        setFeatured(res.featured);
      })
      .catch(() => undefined); // sidebar lỗi thì để trống, danh sách vẫn hiển thị
    return () => {
      ignore = true;
    };
  }, []);

  return { categories, projects, total, featured };
}
