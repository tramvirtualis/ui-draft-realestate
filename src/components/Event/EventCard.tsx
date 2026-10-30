import { Link } from "react-router-dom";
import { MapPin, Users } from "lucide-react";
import EventStatusBadge from "./EventStatusBadge";
import { EVENT_FALLBACK_IMAGE, canRegister, eventCover, eventDateParts, registrationOf } from "./eventDisplay";
import type { Event } from "../../types/event/event.types";

// Một sự kiện dạng hàng ngang kiểu vé: khối ngày bên trái, thông tin + nút ở giữa,
// ảnh bên phải có mép răng cưa và khuyết tròn
export default function EventCard({ event }: { event: Event }) {
  const date = eventDateParts(event.startTime);
  const registration = registrationOf(event);
  const detailPath = `/events/${event.id}`;
  const open = canRegister(event);

  return (
    <article className="group grid gap-4 border-b border-line py-8 first:pt-0 last:border-b-0 md:grid-cols-[84px_1fr_280px] md:items-center md:gap-8">
      {/* Khối ngày (máy tính); điện thoại dùng nhãn ngày nhỏ đặt trên ảnh */}
      <div className="hidden w-[84px] flex-col overflow-hidden text-center shadow-sm ring-1 ring-line md:flex">
        <span className="bg-primary-50 pt-2 text-[10px] font-bold uppercase tracking-wider text-primary-700">{date.month}</span>
        <span className="bg-primary-50 text-3xl font-bold leading-tight text-heading">{date.day}</span>
        <span className="bg-primary-50 pb-2 text-[10px] text-muted">{date.year}</span>
        <span className="bg-ink-900 py-1.5 text-xs font-semibold text-white">{date.time}</span>
      </div>

      {/* Thông tin */}
      <div className="min-w-0">
        <EventStatusBadge status={event.status} />
        <Link to={detailPath}>
          <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-heading transition-colors group-hover:text-primary-700 md:text-2xl">
            {event.title}
          </h3>
        </Link>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-body">
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin size={14} className="shrink-0 text-primary-600" /> <span className="truncate">{event.location}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-primary-600" /> {event.attendeeCount}/{event.maxAttendees}
          </span>
        </p>
        <p className={`mt-1.5 text-xs font-semibold ${registration.className}`}>{registration.text}</p>

        <div className="mt-4 flex items-center gap-5 md:mt-5">
          {open && (
            <Link to={`${detailPath}#dang-ky`} className="flex-1 bg-primary-600 px-5 py-3 text-center text-xs font-semibold text-white transition hover:bg-primary-700 md:flex-none md:py-2.5">
              Đăng ký tham dự
            </Link>
          )}
          <Link to={detailPath} className="shrink-0 text-xs font-medium text-heading underline underline-offset-4 hover:text-primary-700">
            Xem chi tiết
          </Link>
        </div>
      </div>

      {/* Ảnh vé */}
      <Link to={detailPath} className="relative order-first block aspect-[16/9] overflow-hidden md:order-none md:aspect-[16/10]" tabIndex={-1} aria-hidden>
        <img
          src={eventCover(event)}
          alt=""
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.src !== EVENT_FALLBACK_IMAGE) e.currentTarget.src = EVENT_FALLBACK_IMAGE;
          }}
          className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${open ? "" : "grayscale-[60%]"}`}
        />
        <span className="absolute inset-y-0 left-0 hidden w-2 bg-[radial-gradient(circle_at_0_50%,#ffffff_3px,transparent_3.5px)] bg-[length:8px_12px] md:block" />
        <span className="absolute right-0 top-1/2 hidden h-10 w-10 -translate-y-1/2 translate-x-1/2 rounded-full bg-white md:block" />
        {/* Nhãn ngày trên ảnh (điện thoại) */}
        <span className="absolute left-3 top-3 flex overflow-hidden text-center shadow-md md:hidden">
          <span className="flex flex-col justify-center bg-white px-2.5 py-1.5">
            <span className="text-xl font-bold leading-none text-heading">{date.day}</span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-700">{date.month}</span>
          </span>
          <span className="flex items-center bg-ink-900 px-2.5 text-xs font-semibold text-white">{date.time}</span>
        </span>
      </Link>
    </article>
  );
}
