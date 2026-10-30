import { CalendarClock, CalendarPlus, Clock, MapPin } from "lucide-react";
import {
  daysUntil,
  downloadInterviewIcs,
  formatTimeOfDay,
  weekdayName,
  type UpcomingInterview,
} from "./applicationHistoryUtils";

// Thẻ nổi bật "Lịch phỏng vấn sắp tới"; trả null nếu không có lịch
export default function UpcomingInterviewCard({
  interview,
}: {
  interview: UpcomingInterview | null;
}) {
  if (!interview) return null;

  const start = new Date(interview.startAt);
  const left = daysUntil(interview.startAt);
  const month = `THÁNG ${start.getMonth() + 1}`;

  return (
    <section
      aria-labelledby="upcoming-title"
      className="rounded-3xl border border-primary-100 bg-primary-50/60 p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white">
            <CalendarClock size={18} aria-hidden />
          </span>
          <div>
            <h2 id="upcoming-title" className="font-semibold text-heading">
              Lịch phỏng vấn sắp tới
            </h2>
            <p className="text-xs text-body">
              {left > 0 ? `Còn ${left} ngày nữa` : "Hôm nay"} · Hãy chuẩn bị
              thật tốt nhé
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-white p-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-line text-center">
            <span className="text-[9px] font-semibold uppercase text-primary-600">
              {month}
            </span>
            <span className="text-2xl font-bold leading-none text-heading">
              {String(start.getDate()).padStart(2, "0")}
            </span>
            <span className="mt-0.5 text-[9px] text-gray-400">
              {weekdayName(interview.startAt)}
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-heading">{interview.jobTitle}</h3>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-body">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-gray-400" aria-hidden />
                {formatTimeOfDay(interview.startAt)} –{" "}
                {formatTimeOfDay(interview.endAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-gray-400" aria-hidden />{" "}
                {interview.location}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-2 md:ml-auto md:w-44 md:flex-col">
          <button
            type="button"
            onClick={() => downloadInterviewIcs(interview)}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-primary-200 bg-white px-4 text-sm font-medium text-primary-700 transition hover:bg-primary-50"
          >
            <CalendarPlus size={15} aria-hidden /> Thêm vào lịch
          </button>
        </div>
      </div>
    </section>
  );
}
