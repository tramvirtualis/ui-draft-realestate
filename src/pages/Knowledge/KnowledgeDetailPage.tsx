import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDocumentDetail } from "../../hooks/document/useDocumentDetail";
import { useSeo } from "../../hooks/useSeo";
import DocumentDetailHero from "../../components/KnowledgeDetail/DocumentDetailHero";
import DocumentFileViewer from "../../components/KnowledgeDetail/DocumentFileViewer";
import DocumentArticle from "../../components/KnowledgeDetail/DocumentArticle";
import DocumentDetailSidebar from "../../components/KnowledgeDetail/DocumentDetailSidebar";

const SITE_NAME = "Đất Việt Group";

export default function KnowledgeDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { doc, related, loading } = useDocumentDetail(slug);

  useSeo({
    title: doc ? `${doc.title} | ${SITE_NAME}` : `Kiến thức | ${SITE_NAME}`,
    description: doc?.description ?? "Tài liệu và kiến thức bất động sản từ Đất Việt Group.",
    canonical: `${window.location.origin}/knowledge/${slug}`,
    image: doc?.thumbnail,
    type: "article",
  });

  // Mở tài liệu khác → cuộn lên đầu trang
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto animate-pulse px-4 py-16 lg:px-8" aria-busy="true">
        <div className="h-4 w-48 rounded bg-primary-50" />
        <div className="mt-8 h-10 w-3/4 rounded bg-primary-50" />
        <div className="mt-3 h-4 w-1/2 rounded bg-primary-50" />
        <div className="mt-10 h-[60vh] rounded-3xl bg-primary-50" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-heading">Không tìm thấy tài liệu</h1>
        <p className="mt-2 text-body">Tài liệu có thể đã bị gỡ hoặc đường dẫn không đúng.</p>
        <Link to="/knowledge" className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white">
          Về thư viện kiến thức
        </Link>
      </div>
    );
  }

  return (
    <>
      <DocumentDetailHero doc={doc} />
      <section className="bg-page pb-20">
        <div className="container mx-auto -mt-16 grid items-start gap-6 px-4 lg:grid-cols-[1fr_320px] lg:px-8">
          <div className="min-w-0">
            {doc.type === "ARTICLE" ? <DocumentArticle doc={doc} /> : <DocumentFileViewer doc={doc} />}
          </div>
          <DocumentDetailSidebar related={related} />
        </div>
      </section>
    </>
  );
}
