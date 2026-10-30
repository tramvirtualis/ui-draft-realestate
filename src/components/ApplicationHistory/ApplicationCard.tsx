import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  FileText,
  History,
  MapPin,
  MessageSquareWarning,
} from "lucide-react";
import ApplicationStatusBadge from "./ApplicationStatusBadge";
import ApplicationTimeline from "./ApplicationTimeline";
import ApplicationMenu from "./ApplicationMenu";
import ApplicationStatusHistory from "./ApplicationStatusHistory";
import { canWithdraw, jobTitleOf, latestNote } from "./applicationHistoryUtils";
import { formatDate, formatTime } from "../../utils/formatDate";
import type { Application } from "../../types/applicationHistory.types";

// Một hồ sơ đã nộp: thông tin vị trí, trạng thái, tiến trình và các thao tác
export default function ApplicationCard({
  item,
  onWithdraw,
}: {
  item: Application;
  onWithdraw: (id: number) => void;
}) {
  const withdrawable = canWithdraw(item.status);
  const title = jobTitleOf(item);
  const note = item.status === "REJECTED" ? latestNote(item) : null;
  const [showHistory, setShowHistory] = useState(false);
  // lịch hẹn còn ý nghĩa khi đơn chưa bị từ chối / rút
  const showInterview =
    !!item.interviewAt &&
    item.status !== "REJECTED" &&
    item.status !== "WITHDRAWN";

  return (
    <article className="relative rounded-3xl border border-line bg-white p-4 shadow-sm transition hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100 md:p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"
        >
          <Briefcase size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-heading md:text-lg">
            {item.job ? (
              <Link
                to={`/jobs/${item.job.id}`}
                className="hover:text-primary-600 after:rounded-3xl after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary-500"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
          {item.job?.location && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-body">
              <MapPin size={13} className="text-gray-400" aria-hidden />{" "}
              {item.job.location}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ApplicationStatusBadge status={item.status} />
          <ApplicationMenu
            jobTitle={title}
            onWithdraw={withdrawable ? () => onWithdraw(item.id) : undefined}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-primary-50/50 px-3 py-2 text-xs text-body">
        <span className="flex items-center gap-1.5">
          <CalendarDays size={13} className="text-gray-400" aria-hidden /> Ứng
          tuyển ngày {formatDate(item.createdAt)}
        </span>
        {item.cvFileName && (
          <span className="flex items-center gap-1.5">
            <FileText size={13} className="text-gray-400" aria-hidden /> CV:{" "}
            {item.cvFileName}
          </span>
        )}
      </div>

      <div className="mt-4">
        <ApplicationTimeline item={item} />
      </div>

      {showInterview && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50/60 px-3 py-2.5 text-xs">
          <CalendarClock
            size={16}
            className="mt-0.5 shrink-0 text-green-600"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="font-semibold text-heading">
              Lịch phỏng vấn: {formatTime(item.interviewAt!)} ·{" "}
              {formatDate(item.interviewAt!)}
            </p>
            {item.interviewLocation && (
              <p className="mt-0.5 text-body">{item.interviewLocation}</p>
            )}
          </div>
        </div>
      )}

      {note && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs text-red-500">
          <MessageSquareWarning
            size={14}
            className="mt-0.5 shrink-0"
            aria-hidden
          />
          <span>
            <strong className="font-semibold">Phản hồi:</strong> {note}
          </span>
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <div className="flex flex-wrap items-center gap-5 text-sm text-body">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            aria-expanded={showHistory}
            aria-controls={`history-${item.id}`}
            className="relative z-10 flex items-center gap-2 hover:text-primary-600"
          >
            <History size={14} aria-hidden /> Lịch sử xử lý
            <ChevronDown
              size={14}
              className={`transition ${showHistory ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
          {item.cvUrl && (
            <a
              href={item.cvUrl}
              target="_blank"
              rel="noreferrer"
              className="relative z-10 flex items-center gap-2 hover:text-primary-600"
            >
              <FileText size={14} aria-hidden /> Xem CV
            </a>
          )}
        </div>
        {withdrawable ? (
          <button
            type="button"
            onClick={() => onWithdraw(item.id)}
            className="relative z-10 rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-500"
          >
            Rút hồ sơ
          </button>
        ) : (
          <span className="text-[11px] text-gray-400">
            Cập nhật {formatDate(item.updatedAt)}
          </span>
        )}
      </div>
      {showHistory && (
        <div
          id={`history-${item.id}`}
          className="relative z-10 mt-4 rounded-2xl bg-primary-50/40 p-4"
        >
          <ApplicationStatusHistory applicationId={item.id} />
        </div>
      )}
    </article>
  );
}
