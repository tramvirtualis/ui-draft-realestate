import { Link } from "react-router-dom";
import { ArrowRight, Newspaper } from "lucide-react";
import Skeleton from "../common/Skeleton";
import SidebarThumb from "./sidebar/SidebarThumb";
import { useLatestNews } from "../../hooks/news/useLatestNews";
import { formatRelativeTime } from "../../utils/formatDate";

export default function NewsList() {
  const { news, loading } = useLatestNews(5);

  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
        <h3 className="flex items-center gap-2.5 font-semibold text-heading"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Newspaper size={15} aria-hidden /></span>Tin tức mới</h3>
        <Link
          to="/news"
          className="flex items-center gap-0.5 text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          Xem tất cả <ArrowRight size={12} />
        </Link>
      </div>

      <ul className="space-y-3">
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="flex gap-3">
                <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-1.5 pt-1">
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                  <Skeleton className="h-2.5 w-16 rounded" />
                </div>
              </li>
            ))
          : news.map((n) => (
              <li key={n.id}>
                <Link to={`/news/${n.id}`} className="group flex gap-3">
                  <SidebarThumb src={n.images[0]?.imageUrl} alt={n.title} icon={Newspaper} />
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-heading group-hover:text-primary-700">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                </Link>
              </li>
            ))}
      </ul>
    </section>
  );
}
