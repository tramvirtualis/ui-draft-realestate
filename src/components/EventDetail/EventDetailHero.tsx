import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import EventStatusBadge from "../Event/EventStatusBadge";
import { EVENT_FALLBACK_IMAGE, canRegister, eventDateParts, registrationOf } from "../Event/eventDisplay";
import { formatWeekdayDate } from "../../utils/formatDate";
import type { Event } from "../../types/event/event.types";

const SLIDE_INTERVAL = 4500;

const daysUntil = (iso: string): number => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);

// Hero chi tiết sự kiện, cùng kiểu trang Sự kiện: nền ảnh mờ tối, tiêu đề là ngày diễn ra,
// thẻ vé lớn (thông tin bên trái, bộ ảnh có mép răng cưa bên phải)
export default function EventDetailHero({ event }: { event: Event }) {
  const images = event.images?.length ? event.images.map((img) => img.imageUrl) : [EVENT_FALLBACK_IMAGE];
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const t = setInterval(() => setCurrent((i) => (i + 1) % images.length), SLIDE_INTERVAL);
    return () => clearInterval(t);
  }, [images.length, paused]);

  const active = current < images.length ? current : 0;
  const start = eventDateParts(event.startTime);
  const end = eventDateParts(event.endTime);
  const days = daysUntil(event.startTime);
  const open = canRegister(event);
  const registration = registrationOf(event);

  return (
    <section className="relative isolate overflow-hidden bg-ink-900 text-white">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <img src={images[0]} alt="" className="h-full w-full scale-110 object-cover blur-[2px]" />
        <div className="absolute inset-0 bg-linear-to-b from-ink-900/85 via-ink-900/70 to-ink-900/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(232,185,58,0.25),transparent_60%)]" />
      </div>

      <div className="container mx-auto px-4 pb-20 pt-8 lg:px-8">
        <nav className="flex min-w-0 items-center gap-1.5 text-xs text-white/60" aria-label="Breadcrumb">
          <Link to="/" className="shrink-0 hover:text-white">Trang chủ</Link>
          <ChevronRight size={12} className="shrink-0" />
          <Link to="/events" className="shrink-0 hover:text-white">Sự kiện</Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className="truncate font-semibold text-white">{event.title}</span>
        </nav>

        <div className="mt-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-300">• {formatWeekdayDate(event.startTime).split(",")[0]} •</p>
          <p className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
            {start.short === end.short ? `${start.short}/${start.year}` : `${start.short} – ${end.short}/${end.year}`}
          </p>
        </div>

        <article className="animate-rise-in mx-auto mt-12 grid max-w-5xl overflow-hidden bg-white text-heading shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] md:grid-cols-[1fr_1.1fr]">
          {/* Thông tin vé */}
          <div className="order-2 flex flex-col p-6 md:order-1 md:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <EventStatusBadge status={event.status} />
              {days > 0 && open && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-pop-600">
                  <Clock size={13} /> Còn {days} ngày
                </span>
              )}
            </div>
            <h1 className="mt-4 text-2xl font-bold leading-tight md:text-4xl">{event.title}</h1>

            <ul className="mt-6 space-y-2.5 text-sm text-body">
              <li className="flex flex-wrap items-center gap-2">
                <CalendarDays size={15} className="text-primary-600" /> {formatWeekdayDate(event.startTime)}
                <span className="mx-1 h-4 w-px bg-line" aria-hidden />
                <Clock size={15} className="text-primary-600" /> {start.time} – {end.time}
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={15} className="shrink-0 text-primary-600" /> {event.location}
              </li>
              <li className="flex items-center gap-2">
                <Users size={15} className="text-primary-600" /> {event.attendeeCount}/{event.maxAttendees} người đã đăng ký
                <span className={`font-semibold ${registration.className}`}>· {registration.text}</span>
              </li>
            </ul>

            <div className="mt-auto flex flex-wrap items-center gap-5 pt-8">
              {open && (
                <a href="#dang-ky" className="flex items-center gap-2 bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
                  Đăng ký tham dự <ArrowRight size={15} />
                </a>
              )}
              <a href="#dia-diem" className="text-sm font-medium text-heading underline underline-offset-4 hover:text-primary-700">
                Xem địa điểm
              </a>
            </div>
          </div>

          {/* Bộ ảnh vé */}
          <div
            className="relative order-1 min-h-64 md:order-2"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {images.map((src, i) => (
              <img
                key={src + i}
                src={src}
                alt={`${event.title} - ảnh ${i + 1}`}
                onError={(e) => {
                  if (e.currentTarget.src !== EVENT_FALLBACK_IMAGE) e.currentTarget.src = EVENT_FALLBACK_IMAGE;
                }}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <span className="absolute inset-y-0 left-0 hidden w-2 bg-[radial-gradient(circle_at_0_50%,#ffffff_3px,transparent_3.5px)] bg-[length:8px_12px] md:block" aria-hidden />
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-1.5 rounded-full bg-black/35 px-2.5 py-1.5 backdrop-blur">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Xem ảnh ${i + 1}`}
                    onClick={() => setCurrent(i)}
                    className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
