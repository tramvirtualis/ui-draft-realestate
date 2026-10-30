import { Clock, ExternalLink, MapPin, Navigation } from "lucide-react";
import { formatEventTime } from "../../utils/formatDate";
import type { Event } from "../../types/event/event.types";

// Địa điểm tổ chức: bản đồ lớn + khối navy thông tin / chỉ đường đè lên góc bản đồ
export default function EventLocation({ event }: { event: Event }) {
  const query = encodeURIComponent(event.location);
  const mapEmbed = `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

  return (
    <section id="dia-diem" className="scroll-mt-24 bg-white py-16 md:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-heading md:text-4xl">Địa điểm tổ chức</h2>
          <p className="mt-3 text-sm text-body">{event.location}</p>
        </div>

        <div className="relative mt-10">
          <iframe
            title="Bản đồ địa điểm"
            src={mapEmbed}
            className="h-[420px] w-full border border-line"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          <div className="bg-ink-900 p-6 text-white md:absolute md:bottom-6 md:left-6 md:w-[360px] md:shadow-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-300">Địa điểm sự kiện</p>
            <p className="mt-3 text-lg font-semibold leading-snug">{event.location}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li className="flex gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary-300" /> {event.location}
              </li>
              <li className="flex gap-2.5">
                <Clock size={16} className="mt-0.5 shrink-0 text-primary-300" /> {formatEventTime(event.startTime, event.endTime)}
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                <Navigation size={15} /> Chỉ đường
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${query}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-white/25 px-5 py-2.5 text-sm font-medium text-white transition hover:border-primary-300"
              >
                Google Maps <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
