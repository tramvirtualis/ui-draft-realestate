import { useEffect, useState } from "react";
import applicationService from "../../services/job/applicationService";
import { getErrorMessage } from "../../api/http";
import { formatDate, formatTime } from "../../utils/formatDate";
import {
  APPLICATION_STATUS_META,
  type ApplicationStatus,
  type ApplicationStatusLog,
} from "../../types/applicationHistory.types";

// Màu chấm theo trạng thái đích
const DOT: Record<ApplicationStatus, string> = {
  PENDING: "bg-primary-500",
  REVIEWING: "bg-blue-500",
  INTERVIEW_SCHEDULED: "bg-amber-500",
  INTERVIEWED: "bg-green-500",
  ACCEPTED: "bg-emerald-500",
  REJECTED: "bg-red-500",
  WITHDRAWN: "bg-gray-400",
};


export default function ApplicationStatusHistory({ applicationId }: { applicationId: number }) {
  const [logs, setLogs] = useState<ApplicationStatusLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    applicationService
      .getMyApplication(applicationId)
      .then((res) => !ignore && setLogs([...(res.statusLogs ?? [])].reverse()))
      .catch((err) => !ignore && setError(getErrorMessage(err)));
    return () => {
      ignore = true;
    };
  }, [applicationId]);

  if (error) return <p className="text-xs text-red-500">{error}</p>;
  if (!logs) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Đang tải lịch sử">
        {[0, 1].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded-xl bg-primary-50" />
        ))}
      </div>
    );
  }
  if (logs.length === 0) return <p className="text-xs text-body">Chưa có cập nhật nào.</p>;

  return (
    <ol className="relative space-y-4 border-l border-line pl-5" aria-label="Lịch sử xử lý hồ sơ">
      {logs.map((log, i) => (
        <li key={log.id} className="relative">
          <span
            aria-hidden
            className={`absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white ${DOT[log.toStatus]}`}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className={`text-sm font-semibold ${i === 0 ? "text-heading" : "text-body"}`}>
              {APPLICATION_STATUS_META[log.toStatus].label}
            </p>
            <time dateTime={log.createdAt} className="text-[11px] text-gray-400">
              {formatTime(log.createdAt)} · {formatDate(log.createdAt)}
            </time>
          </div>
          {log.note && <p className="mt-0.5 text-xs leading-relaxed text-body">{log.note}</p>}
          {log.interviewAt && (
            <p className="mt-1 text-xs font-medium text-amber-700">
              Lịch hẹn: {formatTime(log.interviewAt)} · {formatDate(log.interviewAt)}
              {log.interviewLocation && ` · ${log.interviewLocation}`}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
