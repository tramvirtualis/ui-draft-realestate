import { Link } from "react-router-dom";
import { ChevronRight, CalendarDays, Building2 } from "lucide-react";
import type { News } from "../../types/new/news.types";
import { formatDate } from "../../utils/formatDate";

interface NewsDetailHeroProps {
  news: News;
}
export default function NewsDetailHero({ news }: NewsDetailHeroProps) {
  const categories = news.categories?.length
    ? news.categories
    : [news.category].filter(Boolean);

  return (
    <section className="bg-gradient-to-b from-primary-100 via-primary-50 to-page pb-32 pt-8">
      <div className="container mx-auto px-4 lg:px-8">
        <nav
          className="flex min-w-0 items-center gap-1.5 text-xs text-body"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="shrink-0 whitespace-nowrap hover:text-primary-600"
          >
            Trang chủ
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          <Link
            to="/news"
            className="shrink-0 whitespace-nowrap hover:text-primary-600"
          >
            Tin tức
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className="truncate font-medium text-primary-600">
            {news.title}
          </span>
        </nav>

        <div className="mx-auto mt-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <span
                key={c.id}
                className="rounded-full bg-primary-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm shadow-primary-200"
              >
                {c.name}
              </span>
            ))}
          </div>

          <h1 className="mt-5 text-balance text-[1.7rem] font-bold leading-[1.3] tracking-tight text-heading md:text-[2.15rem] md:leading-[1.28]">
            {news.title}
          </h1>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-primary-100 pt-6 text-sm text-body">
            <span>
              Tác giả{" "}
              <span className="font-semibold text-heading">{news.author.fullName}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={15} className="text-primary-500" />{" "}
              {formatDate(news.createdAt)}
            </span>
            {news.project && (
              <Link
                to={`/projects/${news.project.id}`}
                className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 font-medium text-heading ring-1 ring-primary-100 transition hover:text-primary-700 hover:ring-primary-300"
              >
                <Building2 size={15} className="text-primary-600" />{" "}
                {news.project.name}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
