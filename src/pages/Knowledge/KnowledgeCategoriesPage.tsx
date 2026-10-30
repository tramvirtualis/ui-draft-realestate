import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDocumentCategories } from "../../hooks/document/useDocumentCategories";
import { useSeo } from "../../hooks/useSeo";
import KnowledgeSubHero from "../../components/KnowledgeCategory/KnowledgeSubHero";
import CategoryCard from "../../components/KnowledgeCategory/CategoryCard";
import { CATEGORIES_PATH } from "../../components/Knowledge/knowledgeHelpers";

const SITE_NAME = "Đất Việt Group";

// Tất cả danh mục của Thư viện kiến thức; bấm 1 danh mục để xem tài liệu của nó
export default function KnowledgeCategoriesPage() {
  const { categories, total, loading } = useDocumentCategories();

  useSeo({
    title: `Danh mục tài liệu | ${SITE_NAME}`,
    description: "Tài liệu và kiến thức bất động sản được phân loại theo danh mục: pháp lý, thủ tục, hợp đồng, tài chính…",
    canonical: `${window.location.origin}${CATEGORIES_PATH}`,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <KnowledgeSubHero
        breadcrumb={[{ label: "Trang chủ", to: "/" }, { label: "Kiến thức", to: "/knowledge" }, { label: "Danh mục" }]}
        eyebrow="Danh mục tài liệu"
        title="Tất cả danh mục"
        desc="Chọn một danh mục để xem toàn bộ tài liệu và bài viết thuộc chủ đề đó."
        stats={[
          { value: loading ? "—" : categories.length, label: "Danh mục" },
          { value: loading ? "—" : total, label: "Tài liệu" },
        ]}
      />

      <section className="bg-page pb-20">
        <div className="container mx-auto -mt-16 px-4 lg:px-8">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Đang tải danh mục">
              {[0, 1, 2, 3, 4, 5].map((n) => <div key={n} className="h-60 animate-pulse rounded-3xl bg-white" />)}
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-3xl border border-line bg-white py-16 text-center">
              <p className="font-semibold text-heading">Chưa có danh mục nào</p>
              <Link to="/knowledge" className="mt-4 inline-block text-sm font-semibold text-primary-600 hover:underline">Về thư viện kiến thức</Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c, i) => <CategoryCard key={c.id} category={c} index={i} total={total} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
