import { Link } from "react-router-dom";
import { ArrowUpRight, Building2 } from "lucide-react";
import type { News } from "../../types/new/news.types";
import { formatDate } from "../../utils/formatDate";
import { excerpt } from "../../utils/text";

interface NewsCardProps {
  news: News;
  wide?: boolean; // bản ngang khổ lớn (bài đầu danh sách)
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80";

// Thẻ tin kiểu tạp chí: ảnh góc vuông có nhãn chuyên mục, tiêu đề chữ display, dòng meta chữ nhỏ in hoa
export default function NewsCard({ news, wide = false }: NewsCardProps) {
  const detailPath = `/news/${news.id}`;
  const cover = news.images[0]?.imageUrl || FALLBACK_IMAGE;

  return (
    <article className={`group relative ${wide ? "grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center" : "flex flex-col"}`}>
      <Link to={detailPath} className={`relative block overflow-hidden bg-primary-50 ${wide ? "aspect-[4/3] md:aspect-[5/4]" : "aspect-[4/3]"}`}>
        <img
          src={cover}
          alt={news.images[0]?.title || news.title}
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute bottom-0 left-0 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-pop-600">
          {news.category?.name}
        </span>
        <span className="absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white text-heading opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100" aria-hidden>
          <ArrowUpRight size={16} />
        </span>
      </Link>

      <div className={`flex flex-1 flex-col ${wide ? "" : "pt-5"}`}>
        <p className="flex flex-wrap items-center gap-x-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          <span>{formatDate(news.createdAt)}</span>
        </p>

        <Link to={detailPath}>
          <h3
            className={`mt-2 font-semibold leading-snug text-heading transition-colors group-hover:text-primary-700 ${
              wide ? "line-clamp-3 text-2xl md:text-3xl" : "line-clamp-2 text-lg"
            }`}
          >
            {news.title}
          </h3>
        </Link>

        <p className={`mt-3 leading-relaxed text-body ${wide ? "line-clamp-4 text-base" : "line-clamp-2 text-sm"}`}>{excerpt(news.content)}</p>

        {news.project?.name && (
          <>
            <span className="mt-auto pt-4" aria-hidden />
            <p className="flex items-center gap-1.5 border-t border-line pt-3 text-[11px] font-medium text-heading">
              <Building2 size={12} className="text-primary-600" /> {news.project.name}
            </p>
          </>
        )}
      </div>
    </article>
  );
}
