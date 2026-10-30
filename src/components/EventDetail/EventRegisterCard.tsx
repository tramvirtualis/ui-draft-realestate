import { ArrowRight, CheckCircle2, Info, MapPin, Phone, Users } from "lucide-react";
import { EVENT_STATUS } from "../../types/event/event.types";
import type { Event } from "../../types/event/event.types";
import { eventDateParts, registrationOf } from "../Event/eventDisplay";

interface EventRegisterCardProps {
  event: Event;
  joined: boolean;
  joining: boolean;
  onJoin: () => void;
  onLeave?: () => void;
}

function getButtonState(event: Event, joined: boolean): { text: string; disabled: boolean } {
  if (joined) return { text: "Đã đăng ký · Hủy", disabled: false };
  if (event.status === EVENT_STATUS.CANCELLED) return { text: "Sự kiện đã hủy", disabled: true };
  if (event.status === EVENT_STATUS.COMPLETED) return { text: "Sự kiện đã kết thúc", disabled: true };
  if (event.attendeeCount >= event.maxAttendees) return { text: "Đã hết chỗ", disabled: true };
  return { text: "Đăng ký tham dự", disabled: false };
}

// Thẻ đăng ký dạng vé: cuống navy (khối ngày + giờ) ở trên, đường xé nét đứt,
// thân vé trắng (địa điểm, số chỗ, thanh tiến độ, nút đăng ký)
export default function EventRegisterCard({ event, joined, joining, onJoin, onLeave }: EventRegisterCardProps) {
  const percent = Math.min(100, event.maxAttendees > 0 ? Math.round((event.attendeeCount / event.maxAttendees) * 100) : 0);
  const button = getButtonState(event, joined);
  const start = eventDateParts(event.startTime);
  const end = eventDateParts(event.endTime);
  const registration = registrationOf(event);

  return (
    <div className="space-y-5 lg:sticky lg:top-24">
      <div id="dang-ky" className="scroll-mt-28 shadow-[0_30px_60px_-35px_rgba(15,22,38,0.55)]">
        {/* Cuống vé */}
        <div className="flex items-center gap-5 bg-ink-900 p-6 text-white">
          <div className="flex w-[76px] shrink-0 flex-col overflow-hidden text-center ring-1 ring-white/15">
            <span className="pt-2 text-[10px] font-bold uppercase tracking-wider text-primary-300">{start.month}</span>
            <span className="text-3xl font-bold leading-tight">{start.day}</span>
            <span className="pb-2 text-[10px] text-white/50">{start.year}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Phí tham gia</p>
            <p className="mt-0.5 text-2xl font-bold text-primary-300">Miễn phí</p>
            <p className="mt-1 text-sm text-white/70">
              {start.time} – {end.time}
            </p>
          </div>
        </div>

        {/* Đường xé: chỉ nét đứt mảnh, không khoét tròn */}
        <div className="bg-white px-6">
          <div className="border-t border-dashed border-primary-200" />
        </div>

        {/* Thân vé */}
        <div className="bg-white p-6">
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0 text-primary-600" />
              <span className="text-heading">{event.location}</span>
            </li>
            <li className="flex gap-3">
              <Users size={16} className="mt-0.5 shrink-0 text-primary-600" />
              <span className="text-heading">Tối đa {event.maxAttendees} khách</span>
            </li>
          </ul>

          <div className="mt-5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-heading">
                {event.attendeeCount}/{event.maxAttendees} đã đăng ký
              </span>
              <span className={`font-semibold ${registration.className}`}>{registration.text}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden bg-primary-50">
              <div style={{ width: `${percent}%` }} className="h-full bg-primary-600 transition-all duration-500" />
            </div>
          </div>

          <button
            type="button"
            onClick={joined ? onLeave : onJoin}
            disabled={button.disabled || joining}
            className="mt-6 flex w-full items-center justify-center gap-2 bg-primary-600 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {joining ? "Đang xử lý..." : button.text}
            {joined ? <CheckCircle2 size={16} /> : !button.disabled && <ArrowRight size={16} />}
          </button>

          <p className="mt-4 flex gap-2 text-xs leading-relaxed text-muted">
            <Info size={14} className="mt-0.5 shrink-0 text-primary-600" />
            Đăng ký xong bạn sẽ nhận email xác nhận và nhắc lịch trước sự kiện 1 ngày.
          </p>
        </div>
      </div>

      <div className="border-l-2 border-primary-600 bg-white p-5">
        <p className="font-semibold text-heading">Cần hỗ trợ đăng ký?</p>
        <p className="mt-1 text-xs text-body">Đội ngũ hỗ trợ từ 08:00 đến 21:00 hằng ngày.</p>
        <a href="tel:19008686" className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary-700">
          <Phone size={15} /> 1900 8686
        </a>
      </div>
    </div>
  );
}
