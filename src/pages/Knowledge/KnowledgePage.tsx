import { formatDate } from "../../utils/formatDate";
import { useKnowledgePage, LIST_ANCHOR } from "../../hooks/document/useKnowledgePage";
import Heading from "../../components/Knowledge/KnowledgeHeading";
import KnowledgeHero from "../../components/Knowledge/KnowledgeHero";
import CategoryGrid from "../../components/Knowledge/CategoryGrid";
import FeaturedContent from "../../components/Knowledge/FeaturedContent";
import ArticleFilters from "../../components/Knowledge/ArticleFilters";
import ArticleList from "../../components/Knowledge/ArticleList";
import ArticlePagination from "../../components/Knowledge/ArticlePagination";
import ArticleSidebar from "../../components/Knowledge/ArticleSidebar";

export default function KnowledgePage() {
  const k = useKnowledgePage();
  const { result, loading, error } = k.list;
  const latest = k.featured.result.content[0]?.updatedAt;

  const stats = [
    { value: k.totalDocuments, label: "Tài liệu" },
    { value: k.categories.length, label: "Danh mục" },
    { value: latest ? formatDate(latest) : "—", label: "Cập nhật gần nhất" },
  ];

  return (
    <div className="bg-white">
      <KnowledgeHero
        keywordDraft={k.keywordDraft}
        setKeywordDraft={k.setKeywordDraft}
        onSearch={(e) => k.search(e, true)}
        categories={k.categories}
        onPickCategory={(id) => k.setCategoryId(id, true)}
        stats={stats}
      />

      <CategoryGrid
        categories={k.categories}
        total={k.totalDocuments}
        loading={k.categoriesLoading}
      />

      <FeaturedContent
        items={k.featured.result.content}
        loading={k.featured.loading}
        categories={k.categories}
        featuredCat={k.featuredCat}
        setFeaturedCat={k.setFeaturedCat}
      />

      <section id={LIST_ANCHOR} className="scroll-mt-24 bg-primary-50/40 py-14">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Heading eyebrow="Thư viện tài liệu" title="Tất cả tài liệu" desc="Đọc trực tuyến bài viết, file PDF và Word, hoặc tải về để xem sau." />
            <div className="flex items-center gap-3 text-xs text-muted">
              {!loading && <span>{result.totalElements} tài liệu</span>}
              {k.hasFilter && (
                <button type="button" onClick={k.clearFilters} className="font-semibold text-primary-600 hover:underline">
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          <ArticleFilters
            keywordDraft={k.keywordDraft}
            setKeywordDraft={k.setKeywordDraft}
            onSearch={(e) => k.search(e)}
            categories={k.categories}
            categoryId={k.categoryId}
            setCategoryId={(id) => k.setCategoryId(id)}
            type={k.type}
            setType={k.setType}
            sort={k.sort}
            setSort={k.setSort}
          />

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_330px]">
            <div>
              <ArticleList
                rows={result.content}
                loading={loading}
                error={error}
                emptyText={k.hasFilter ? "Không tìm thấy tài liệu phù hợp." : "Chưa có tài liệu nào."}
              />
              {!loading && result.totalPages > 1 && (
                <ArticlePagination page={k.page} totalPages={result.totalPages} setPage={k.setPage} />
              )}
            </div>

            <ArticleSidebar
              categories={k.categories}
              total={k.totalDocuments}
              categoryId={k.categoryId}
              setCategoryId={(id) => k.setCategoryId(id)}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
