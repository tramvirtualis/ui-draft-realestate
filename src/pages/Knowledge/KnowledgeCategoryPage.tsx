import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useKnowledgeCategory, CATEGORY_LIST_ANCHOR } from "../../hooks/document/useKnowledgeCategory";
import { useSeo } from "../../hooks/useSeo";
import KnowledgeSubHero from "../../components/KnowledgeCategory/KnowledgeSubHero";
import CategoryListToolbar from "../../components/KnowledgeCategory/CategoryListToolbar";
import CategorySidebar from "../../components/KnowledgeCategory/CategorySidebar";
import ArticleList from "../../components/Knowledge/ArticleList";
import ArticlePagination from "../../components/Knowledge/ArticlePagination";
import { CATEGORIES_PATH, categoryIcon, categoryPath } from "../../components/Knowledge/knowledgeHelpers";

const SITE_NAME = "Đất Việt Group";

export default function KnowledgeCategoryPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  // Đổi danh mục thì làm mới toàn bộ bộ lọc / trang
  return <CategoryContent key={slug} slug={slug} />;
}

// Danh sách tài liệu của 1 danh mục, phân trang ở server
function CategoryContent({ slug }: { slug: string }) {
  const k = useKnowledgeCategory(slug);
  const { result, error } = k.list;

  useSeo({
    title: `${k.category?.name ?? "Danh mục"} | Kiến thức | ${SITE_NAME}`,
    description: k.category
      ? `Tài liệu và bài viết về ${k.category.name} từ thư viện kiến thức Đất Việt Group.`
      : "Tài liệu và kiến thức bất động sản từ Đất Việt Group.",
    canonical: `${window.location.origin}${categoryPath(slug)}`,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (k.notFound) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-heading">Không tìm thấy danh mục</h1>
        <p className="mt-2 text-body">Danh mục có thể đã bị ẩn hoặc đường dẫn không đúng.</p>
        <Link to={CATEGORIES_PATH} className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white">
          Xem tất cả danh mục
        </Link>
      </div>
    );
  }

  const name = k.category?.name ?? "Đang tải…";

  return (
    <>
      <KnowledgeSubHero
        breadcrumb={[
          { label: "Trang chủ", to: "/" },
          { label: "Kiến thức", to: "/knowledge" },
          { label: "Danh mục", to: CATEGORIES_PATH },
          { label: name },
        ]}
        eyebrow="Danh mục tài liệu"
        title={name}
        icon={k.category ? categoryIcon(k.categoryIndex) : undefined}
        stats={[{ value: k.category ? k.category.documentCount : "—", label: "Tài liệu" }]}
      />

      <section className="bg-page pb-20">
        <div id={CATEGORY_LIST_ANCHOR} className="container mx-auto -mt-16 grid scroll-mt-24 items-start gap-6 px-4 lg:grid-cols-[1fr_320px] lg:px-8">
          <div className="min-w-0 space-y-4">
            <CategoryListToolbar type={k.type} setType={k.setType} sort={k.sort} setSort={k.setSort} />
            <ArticleList
              rows={result.content}
              loading={k.loading}
              error={error}
              emptyText={k.type ? "Danh mục này chưa có tài liệu thuộc loại đã chọn." : "Danh mục này chưa có tài liệu nào."}
            />
            {!k.loading && result.totalPages > 1 && (
              <ArticlePagination page={k.page} totalPages={result.totalPages} setPage={k.setPage} />
            )}
          </div>

          <CategorySidebar categories={k.categories} currentId={k.category?.id ?? null} />
        </div>
      </section>
    </>
  );
}
