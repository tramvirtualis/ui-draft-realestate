import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays } from "lucide-react";
import Skeleton from "../common/Skeleton";
import SidebarThumb from "./sidebar/SidebarThumb";
import { useLatestEvents } from "../../hooks/social/useLatestEvents";
import { EVENT_STATUS_META } from "../../types/event/event.types";
import { formatDate, formatTime } from "../../utils/formatDate";

export default function EventList() {
  const { events, loading } = useLatestEvents(5);

  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
        <h3 className="flex items-center gap-2.5 font-semibold text-heading"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-600"><CalendarDays size={15} aria-hidden /></span>Sự kiện sắp tới</h3>
        <Link
          to="/events"
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
          : events.map((e) => {
              const status = EVENT_STATUS_META[e.status];
              return (
                <li key={e.id}>
                  <Link to={`/events/${e.id}`} className="group flex gap-3">
                    <SidebarThumb src={e.images[0]?.imageUrl} alt={e.title} icon={CalendarDays} />
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-heading group-hover:text-primary-700">
                        {e.title}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
                        <span>
                          {formatTime(e.startTime)} · {formatDate(e.startTime)}
                        </span>
                        {status && (
                          <span className={`flex items-center gap-1 ${status.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        )}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
      </ul>
    </section>
  );
}
