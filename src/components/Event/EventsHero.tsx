import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import EventStatusBadge from "./EventStatusBadge";
import { canRegister, eventCover, eventDateParts } from "./eventDisplay";
import type { Event } from "../../types/event/event.types";

interface EventsHeroProps {
  events: Event[];
}

const MAX_FEATURED = 5;
const AUTOPLAY_MS = 6000;

// Hero sự kiện kiểu "vé": nền ảnh tối của sự kiện đang xem, tiêu đề là khoảng ngày diễn ra,
// thẻ vé trắng (thông tin bên trái, ảnh có mép răng cưa bên phải) chuyển qua lại bằng mũi tên
export default function EventsHero({ events }: EventsHeroProps) {
  const open = events.filter(canRegister);
  const featured = (open.length ? open : events).slice(0, MAX_FEATURED);
  const count = featured.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const index = count ? current % count : 0;
  const active = featured[index];

  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => setCurrent((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, count]);

  const go = (step: number) => setCurrent((i) => (i + step + count) % count);

  // Tiêu đề: khoảng ngày của các sự kiện nổi bật (vd 27/06 – 04/07)
  const starts = featured.map((e) => new Date(e.startTime).getTime()).sort((a, b) => a - b);
  const range =
    starts.length === 0
      ? null
      : starts.length === 1 || starts[0] === starts[starts.length - 1]
        ? eventDateParts(new Date(starts[0]).toISOString()).short
        : `${eventDateParts(new Date(starts[0]).toISOString()).short} – ${eventDateParts(new Date(starts[starts.length - 1]).toISOString()).short}`;

  return (
    <section
      className="relative isolate overflow-hidden bg-ink-900 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Nền: ảnh sự kiện đang xem, mờ + phủ tối ấm */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        {featured.map((e, i) => (
          <img
            key={e.id}
            src={eventCover(e)}
            alt=""
            className={`absolute inset-0 h-full w-full scale-110 object-cover blur-[2px] transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-linear-to-b from-ink-900/85 via-ink-900/70 to-ink-900/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(232,185,58,0.25),transparent_60%)]" />
      </div>

      <div className="container mx-auto px-4 pb-12 pt-8 md:pb-20 lg:px-8">
        <nav className="flex items-center gap-1.5 text-xs text-white/60" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white">Trang chủ</Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-white">Sự kiện</span>
        </nav>

        <div className="mt-8 text-center md:mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary-300 md:text-xs md:tracking-[0.3em]">• Sự kiện bất động sản •</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:mt-4 md:text-6xl">{range ?? "Sự kiện"}</h1>
        </div>

        {active ? (
          <div className="relative mx-auto mt-8 max-w-4xl md:mt-12">
            <article key={active.id} className="animate-rise-in grid overflow-hidden bg-white text-heading shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] md:grid-cols-[1fr_1.05fr]">
              {/* Thông tin vé */}
              <div className="order-2 flex flex-col p-5 md:order-1 md:p-9">
                <EventStatusBadge status={active.status} />
                <Link to={`/events/${active.id}`}>
                  <h2 className="mt-3 line-clamp-3 text-xl font-bold leading-tight transition hover:text-primary-700 md:mt-4 md:text-3xl">{active.title}</h2>
                </Link>
                <ul className="mt-5 space-y-2 text-sm text-body">
                  <li className="flex items-center gap-2">
                    <CalendarDays size={15} className="text-primary-600" /> {eventDateParts(active.startTime).short}/{eventDateParts(active.startTime).year}
                    <span className="mx-1 h-4 w-px bg-line" aria-hidden />
                    <Clock size={15} className="text-primary-600" /> {eventDateParts(active.startTime).time}
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin size={15} className="shrink-0 text-primary-600" /> <span className="truncate">{active.location}</span>
                  </li>
                </ul>
                <div className="mt-auto flex items-center gap-5 pt-6 md:pt-7">
                  {canRegister(active) && (
                    <Link
                      to={`/events/${active.id}#dang-ky`}
                      className="flex-1 bg-primary-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary-700 md:flex-none"
                    >
                      Đăng ký tham dự
                    </Link>
                  )}
                  <Link to={`/events/${active.id}`} className="shrink-0 text-sm font-medium text-heading underline underline-offset-4 hover:text-primary-700">
                    Xem chi tiết
                  </Link>
                </div>
              </div>

              {/* Ảnh vé: mép trái răng cưa + khuyết tròn 2 đầu */}
              <div className="relative order-1 h-52 md:order-2 md:h-auto md:min-h-56">
                <img src={eventCover(active)} alt={active.title} className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute inset-y-0 left-0 hidden w-2 bg-[radial-gradient(circle_at_0_50%,#ffffff_3px,transparent_3.5px)] bg-[length:8px_12px] md:block" aria-hidden />              </div>
            </article>

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Sự kiện trước"
                  className="absolute left-0 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-heading shadow-lg transition hover:bg-primary-600 hover:text-white max-md:left-3 max-md:top-[104px] max-md:h-9 max-md:w-9 max-md:translate-x-0 max-md:bg-white/90"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Sự kiện tiếp theo"
                  className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white text-heading shadow-lg transition hover:bg-primary-600 hover:text-white max-md:right-3 max-md:top-[104px] max-md:h-9 max-md:w-9 max-md:translate-x-0 max-md:bg-white/90"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="mt-6 flex justify-center gap-2">
                  {featured.map((e, i) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setCurrent(i)}
                      aria-label={`Sự kiện ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-primary-400" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="mx-auto mt-6 max-w-xl text-center text-white/70">
            Kết nối cùng chuyên gia, khám phá dự án và cập nhật thị trường qua các sự kiện bất động sản.
          </p>
        )}
      </div>
    </section>
  );
}
