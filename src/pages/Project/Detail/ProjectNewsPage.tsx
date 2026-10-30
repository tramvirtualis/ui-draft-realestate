import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProjectTabs from "../../../components/Project/Detail/ProjectTabs";
import NewsHero from "../../../components/News/NewsHero";
import NewsSearchBar from "../../../components/Project/Detail/news/NewsSearchBar";
import NewsPostList from "../../../components/Project/Detail/news/NewsPostList";
import NewsPagination from "../../../components/Project/Detail/news/NewsPagination";
import NewsSidebar from "../../../components/Project/Detail/news/NewsSidebar";
import { useProjectData } from "../../../hooks/project/useProjectData";
import { projectExtrasService } from "../../../services/project/projectExtrasService";
import type { News } from "../../../types/new/news.types";
import { parseProjectId } from "../../../utils/slug";

const load = projectExtrasService.getNews;
// 1 bài ngang khổ lớn + 9 bài (3 hàng × 3), giống trang Tin tức chung
const PER_PAGE = 10;
const NO_NEWS: News[] = [];

export default function ProjectNewsPage() {
  const { id } = useParams();
  const projectId = parseProjectId(id);
  const base = `/projects/${id}`;
  const state = useProjectData(projectId, load);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const news = state.status === "ready" ? state.data.news : NO_NEWS;

  // Chuyên mục chỉ gồm những mục có bài viết của dự án này
  const categories = useMemo(() => {
    const map = new Map<number, { id: number; name: string; count: number }>();
    news.forEach((n) => {
      if (!n.category) return;
      const c = map.get(n.category.id) ?? {
        id: n.category.id,
        name: n.category.name,
        count: 0,
      };
      c.count += 1;
      map.set(c.id, c);
    });
    return [...map.values()];
  }, [news]);

  // Bài có ảnh, mới nhất trước → hero (4 bài slide + 4 bài dải tin)
  const featured = useMemo(
    () =>
      news
        .filter((n) => n.images[0]?.imageUrl)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8),
    [news],
  );

  const filtered = useMemo(() => {
    const k = query.trim().toLowerCase();
    return news.filter(
      (n) =>
        (categoryId === null || n.category?.id === categoryId) &&
        (!k || n.title.toLowerCase().includes(k))
    );
  }, [news, query, categoryId]);

  if (state.status === "loading") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div
          className="container mx-auto animate-pulse px-4 py-10 lg:px-8"
          aria-busy="true"
        >
          <div className="h-60 rounded-3xl bg-primary-100" />
          <div className="mt-6 h-72 rounded-3xl bg-primary-50" />
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div className="px-4 py-24 text-center" role="alert">
          <p className="text-xl font-semibold text-heading">{state.message}</p>
          <Link
            to="/projects"
            className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700"
          >
            Về danh sách dự án
          </Link>
        </div>
      </div>
    );
  }

  const { project } = state.data;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const posts = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <div className="overflow-x-clip bg-page">
      <ProjectTabs />

      <NewsHero
        total={news.length}
        featured={featured}
        eyebrow={`Tin tức ${project.name}`}
        crumbs={[
          { label: "Trang chủ", to: "/" },
          { label: project.name, to: base },
          { label: "Tin tức" },
        ]}
      />

      <section className="bg-page pb-24 pt-12">
        <div className="container mx-auto px-4 lg:px-8">
          <NewsSearchBar
            draft={draft}
            setDraft={setDraft}
            setQuery={setQuery}
            setPage={setPage}
          />

          <div className="mt-14 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-heading md:text-3xl">Tin tức về dự án</h2>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              Trang {current} / {totalPages} · {filtered.length} bài viết
            </span>
          </div>

          <div className="mt-8 grid items-start gap-12 lg:grid-cols-[1fr_280px]">
            <div>
              <NewsPostList posts={posts} />
              {posts.length === 0 && (
                <p className="py-12 text-center text-body">
                  {news.length === 0
                    ? "Dự án chưa có bài viết nào."
                    : "Không tìm thấy bài viết phù hợp."}
                </p>
              )}
              <NewsPagination
                page={current}
                totalPages={totalPages}
                setPage={setPage}
              />
            </div>

            <NewsSidebar
              categories={categories}
              total={news.length}
              categoryId={categoryId}
              setCategoryId={(c) => {
                setCategoryId(c);
                setPage(1);
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
