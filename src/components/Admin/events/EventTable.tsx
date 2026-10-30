import { Link } from "react-router-dom";
import {
  ChevronDown,
  Eye,
  ImageOff,
  MapPin,
  MessagesSquare,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatEventTime } from "../../../utils/formatDate";
import {
  EVENT_STATUS_META,
  type Event,
  type EventStatus,
} from "../../../types/event/event.types";

type Props = {
  items: Event[];
  busyId?: number | null;
  onChangeStatus: (event: Event, status: EventStatus) => void;
  onOpenPeople: (event: Event) => void;
  onDelete: (event: Event) => void;
};

const btn =
  "flex h-8 w-8 items-center justify-center rounded-lg transition focus-visible:outline-2 focus-visible:outline-primary-600 active:scale-95";
const TH =
  "px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted";
const STATUSES = Object.keys(EVENT_STATUS_META) as EventStatus[];

export default function EventTable({
  items,
  busyId = null,
  onChangeStatus,
  onOpenPeople,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-primary-50/60">
          <tr>
            <th className={TH}>Sự kiện</th>
            <th className={TH}>Thời gian</th>
            <th className={TH}>Tham gia</th>
            <th className={TH}>Trạng thái</th>
            <th className={TH}>Người tạo</th>
            <th className={TH} />
          </tr>
        </thead>
        <tbody>
          {items.map((e) => {
            const cover = e.images[0]?.imageUrl;
            const meta = EVENT_STATUS_META[e.status];
            const full =
              e.maxAttendees > 0 && e.attendeeCount >= e.maxAttendees;
            return (
              <tr
                key={e.id}
                className="border-t border-line transition hover:bg-primary-50/40"
              >
                <td className="max-w-[360px] px-4 py-3">
                  <div className="flex items-center gap-3">
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className="h-14 w-20 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-300">
                        <ImageOff size={20} />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p
                        className="truncate font-semibold text-footer"
                        title={e.title}
                      >
                        {e.title}
                      </p>
                      {e.location && (
                        <p
                          className="mt-0.5 flex items-center gap-1 truncate text-xs text-body"
                          title={e.location}
                        >
                          <MapPin size={12} className="shrink-0" aria-hidden />{" "}
                          {e.location}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-heading">
                  {formatEventTime(e.startTime, e.endTime)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`font-semibold ${
                      full ? "text-danger" : "text-heading"
                    }`}
                  >
                    {e.attendeeCount}
                  </span>
                  <span className="text-body">
                    {" "}
                    / {e.maxAttendees > 0 ? e.maxAttendees : "∞"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <label className="relative inline-flex items-center">
                    <span
                      className={`pointer-events-none absolute left-3 h-1.5 w-1.5 rounded-full ${meta.dot}`}
                    />
                    <select
                      value={e.status}
                      disabled={busyId === e.id}
                      onChange={(ev) =>
                        onChangeStatus(e, ev.target.value as EventStatus)
                      }
                      aria-label={`Trạng thái của ${e.title}`}
                      className={`appearance-none rounded-full border border-line bg-white py-1 pl-6 pr-7 text-xs font-semibold outline-none transition hover:border-primary-300 focus:border-primary-400 disabled:opacity-50 ${meta.text}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {EVENT_STATUS_META[s].label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      className="pointer-events-none absolute right-2 text-muted"
                    />
                  </label>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-heading">
                  {e.createdBy?.fullName ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`/events/${e.id}`}
                      target="_blank"
                      aria-label={`Xem ${e.title}`}
                      title="Xem trên website"
                      className={`${btn} text-body hover:bg-primary-50`}
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onOpenPeople(e)}
                      aria-label={`Thành viên và bình luận của ${e.title}`}
                      title="Thành viên & bình luận"
                      className={`${btn} text-body hover:bg-primary-50`}
                    >
                      <MessagesSquare size={16} />
                    </button>
                    <Link
                      to={`/admin/events/${e.id}/edit`}
                      aria-label={`Sửa ${e.title}`}
                      title="Sửa"
                      className={`${btn} text-body hover:bg-primary-50`}
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(e)}
                      aria-label={`Xóa ${e.title}`}
                      title="Xóa"
                      className={`${btn} bg-danger/10 text-danger hover:bg-danger/20`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
