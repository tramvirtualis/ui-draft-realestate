import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { getNotificationHref, getNotificationMeta } from "./notificationMeta";
import { formatDate, formatTime } from "../../utils/formatDate";
import type { NotificationItem } from "../../types/notification.types";

const viewCls =
  "flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-heading transition hover:bg-primary-50 hover:text-primary-700 after:rounded-xl after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary-500";

/** Một thông báo: icon loại, nhãn, tiêu đề, nội dung, thời gian, chấm chưa đọc và nút "Xem" */
export default function NotificationCard({
  item,
  onView,
}: {
  item: NotificationItem;
  onView: (id: number) => void;
}) {
  const meta = getNotificationMeta(item.notificationTypeId, item.notificationTypeName);
  const Icon = meta.icon;
  const href = getNotificationHref(item);
  const viewLabel = (
    <>
      <Eye size={14} className="text-gray-400" aria-hidden /> Xem
    </>
  );

  return (
    <li
      className={`relative rounded-xl border bg-white p-4 transition hover:shadow-md ${
        item.isRead ? "border-line hover:border-primary-200" : "border-blue-100 hover:border-blue-300"
      }`}
    >
      {item.isRead ? (
        <span className="absolute right-4 top-3.5 rounded-md bg-amber-900/10 px-2 py-0.5 text-[11px] font-medium text-amber-900/70">
          Đã xem
        </span>
      ) : (
        <span
          className="absolute right-4 top-4 h-2 w-2 rounded-full bg-pop-500"
          role="img"
          aria-label="Chưa đọc"
        />
      )}

      <div className="flex gap-3">
        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.iconClass}`}>
          <Icon size={14} aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${meta.badgeClass}`}>
            {item.notificationTypeName}
          </span>

          <p className="mt-2 pr-2 text-sm font-bold text-footer">{item.title}</p>
          <p className="mt-1 whitespace-pre-line pr-2 text-sm leading-relaxed text-body">{item.content}</p>

          {item.image && (
            <img src={item.image} alt="" className="mt-3 max-h-40 w-full rounded-lg object-cover" loading="lazy" />
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            <time dateTime={item.createdAt} className="text-xs text-gray-400">
              {formatTime(item.createdAt)} · {formatDate(item.createdAt)}
            </time>
            {href?.startsWith("/") ? (
              <Link to={href} onClick={() => onView(item.id)} className={viewCls}>
                {viewLabel}
              </Link>
            ) : href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => onView(item.id)} className={viewCls}>
                {viewLabel}
              </a>
            ) : (
              !item.isRead && (
                <button type="button" onClick={() => onView(item.id)} className={viewCls}>
                  {viewLabel}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
