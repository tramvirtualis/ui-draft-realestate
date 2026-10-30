import { useState } from "react";
import { FileX, X } from "lucide-react";
import NewsHero from "../../components/News/NewsHero";
import NewsSearchBar from "../../components/News/NewsSearchBar";
import NewsCard from "../../components/News/NewsCard";
import NewsCardSkeleton from "../../components/News/NewsCardSkeleton";
import NewsSidebar from "../../components/News/NewsSidebar";
import Pagination from "../../components/common/Pagination";
import { useNews } from "../../hooks/news/useNews";
import { useNewsSidebar } from "../../hooks/news/useNewsSidebar";
import { DEFAULT_NEWS_FILTER } from "../../types/new/news.types";
import type { NewsFilter, NewsSort } from "../../types/new/news.types";

// 1 bài ngang khổ lớn + 9 bài (3 hàng × 3)
const PAGE_SIZE = 10;

export default function NewsPage() {
  const [filter, setFilter] = useState<NewsFilter>(DEFAULT_NEWS_FILTER);
  const [sort, setSort] = useState<NewsSort>("NEWEST");
  const [page, setPage] = useState<number>(0);

  const { result, loading, error } = useNews({ filter, sort, page, size: PAGE_SIZE });
  const { content: news, totalElements: total, totalPages } = result;
  const { categories, projects, total: allCount, featured } = useNewsSidebar();

  const updateFilter = (next: NewsFilter) => {
    setFilter(next);
    setPage(0);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeCategory = categories.find((c) => c.id === filter.categoryId);
  const activeProject = projects.find((p) => p.id === filter.projectId);
  const hasFilter = Boolean(filter.keyword || activeCategory || activeProject);

  return (
    <>
      <NewsHero total={allCount} featured={featured} />

      <section className="bg-page pb-24 pt-12">
        <div className="container mx-auto px-4 lg:px-8">
          <NewsSearchBar
            filter={filter}
            sort={sort}
            categories={categories}
            onSearch={updateFilter}
            onSortChange={(s) => {
              setSort(s);
              setPage(0);
            }}
          />

          <div className="mt-14 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-heading md:text-3xl">Tin mới cập nhật</h2>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              {news.length} / {total} bài viết
            </p>
          </div>

          {/* Bộ lọc đang áp dụng */}
          {hasFilter && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              {filter.keyword && (
                <Chip
                  label={`"${filter.keyword}"`}
                  onRemove={() => updateFilter({ ...filter, keyword: "" })}
                />
              )}
              {activeCategory && (
                <Chip
                  label={activeCategory.name}
                  onRemove={() => updateFilter({ ...filter, categoryId: null })}
                />
              )}
              {activeProject && (
                <Chip
                  label={activeProject.name}
                  onRemove={() => updateFilter({ ...filter, projectId: null })}
                />
              )}
              <button
                onClick={() => updateFilter(DEFAULT_NEWS_FILTER)}
                className="font-medium text-primary-600 hover:underline"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          <div className="mt-8 grid items-start gap-12 lg:grid-cols-[1fr_280px]">
            <div>
              {loading ? (
                <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <NewsCardSkeleton key={i} />
                  ))}
                </div>
              ) : news.length === 0 ? (
                <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-white py-16 text-center">
                  <FileX size={40} className="text-primary-300" />
                  <p className="mt-4 font-medium text-heading">
                    {error
                      ? "Không tải được bài viết"
                      : "Không có bài viết phù hợp"}
                  </p>
                  <p className="mt-1 text-sm text-body">
                    {error ?? "Thử từ khóa khác hoặc bỏ bớt bộ lọc."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                  {news.map((n, i) =>
                    // Bài đầu danh sách: thẻ ngang khổ lớn chiếm cả hàng
                    i === 0 ? (
                      <div key={n.id} className="border-b border-line pb-12 sm:col-span-2 xl:col-span-3">
                        <NewsCard news={n} wide />
                      </div>
                    ) : (
                      <NewsCard key={n.id} news={n} />
                    ),
                  )}
                </div>
              )}

              {!loading && (
                <div className="mt-10">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onChange={handlePageChange}
                  />
                </div>
              )}
            </div>

            <NewsSidebar
              categories={categories}
              projects={projects}
              activeCategoryId={filter.categoryId}
              activeProjectId={filter.projectId}
              onCategoryClick={(categoryId) =>
                updateFilter({ ...filter, categoryId })
              }
              onProjectClick={(projectId) =>
                updateFilter({ ...filter, projectId })
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-heading ring-1 ring-line">
      {label}
      <button
        onClick={onRemove}
        aria-label="Bỏ lọc"
        className="text-body hover:text-danger"
      >
        <X size={12} />
      </button>
    </span>
  );
}
