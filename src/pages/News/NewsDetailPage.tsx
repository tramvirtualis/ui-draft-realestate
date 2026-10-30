import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import NewsDetailHero from "../../components/NewDetail/NewsDetailHero";
import NewsArticle from "../../components/NewDetail/NewsArticle";
import NewsDetailSidebar from "../../components/NewDetail/NewsDetailSidebar";
import ReadingProgress from "../../components/NewDetail/ReadingProgress";
import { useArticleToc } from "../../components/NewDetail/useArticleToc";
import NewsCard from "../../components/News/NewsCard";
import { useNewsDetail } from "../../hooks/news/useNewsDetail";

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const newsId = Number(id);
  const { news, related, latest, loading } = useNewsDetail(newsId);
  const contentRef = useRef<HTMLDivElement>(null);
  // Chỉ quét tiêu đề khi bài đã hiện (hết loading), lúc đó khối nội dung mới có trong DOM
  const { items: toc, activeId } = useArticleToc(contentRef, loading ? null : news?.content);

  // Mở bài khác → cuộn lên đầu trang
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [newsId]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl animate-pulse px-4 py-16">
        <div className="h-5 w-40 rounded-full bg-primary-100" />
        <div className="mt-6 h-10 w-full rounded-xl bg-primary-100" />
        <div className="mt-3 h-10 w-2/3 rounded-xl bg-primary-100" />
        <div className="mt-6 flex gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-100" />
          <div className="h-10 w-48 rounded-xl bg-primary-100" />
        </div>
        <div className="mt-10 aspect-[21/9] rounded-[28px] bg-primary-100" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-heading">Không tìm thấy bài viết</h1>
        <p className="mt-2 text-body">Bài viết có thể đã bị gỡ hoặc đường dẫn không đúng.</p>
        <Link to="/news" className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white">
          Quay lại Tin tức
        </Link>
      </div>
    );
  }

  return (
    <>
      <ReadingProgress target={contentRef} />
      <NewsDetailHero news={news} />

      <section className="bg-page pb-20">
        <div className="container mx-auto -mt-24 max-w-[1240px] px-4 lg:px-8">
          <NewsArticle
            news={news}
            contentRef={contentRef}
            aside={<NewsDetailSidebar project={news.project} latest={latest} toc={toc} activeId={activeId} />}
          />
        </div>

        {related.length > 0 && (
          <div className="container mx-auto mt-20 max-w-[1240px] px-4 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">Đọc thêm</span>
                <h2 className="mt-2 text-2xl font-bold text-heading md:text-3xl">Bài viết liên quan</h2>
              </div>
              <Link to="/news" className="group inline-flex items-center gap-2 text-sm font-medium text-primary-700">
                Tất cả tin tức <ArrowRight size={15} className="transition group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((n) => (
                <NewsCard key={n.id} news={n} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
