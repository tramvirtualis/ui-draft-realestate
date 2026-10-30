import { formatShortDate } from "./applicationHistoryUtils";
import type {
  Application,
  ApplicationStatus,
} from "../../types/applicationHistory.types";

const RANK: Record<ApplicationStatus, number> = {
  PENDING: 0,
  REVIEWING: 1,
  INTERVIEW_SCHEDULED: 2,
  INTERVIEWED: 2,
  ACCEPTED: 3,
  REJECTED: 3,
  WITHDRAWN: 0,
};

// Tiến trình 4 bước: Đã gửi → Xem xét → Phỏng vấn → Kết quả. Bước kết quả đỏ khi không phù hợp.
export default function ApplicationTimeline({ item }: { item: Application }) {
  const rank = RANK[item.status];
  const changedAt = item.statusChangedAt ?? item.updatedAt;
  const isFinal = item.status === "ACCEPTED" || item.status === "REJECTED";

  const steps: {
    label: string;
    done: boolean;
    at?: string | null;
    danger?: boolean;
  }[] = [
    { label: "Đã gửi", done: true, at: item.createdAt },
    {
      label: "Xem xét",
      done: rank >= 1,
      at: item.status === "REVIEWING" ? changedAt : null,
    },
    {
      label: "Phỏng vấn",
      done: rank >= 2 || !!item.interviewAt,
      at: item.interviewAt,
    },
    {
      label:
        item.status === "WITHDRAWN"
          ? "Đã rút"
          : item.status === "REJECTED"
          ? "Không phù hợp"
          : "Kết quả",
      done: isFinal || item.status === "WITHDRAWN",
      at: isFinal || item.status === "WITHDRAWN" ? changedAt : null,
      danger: item.status === "REJECTED" || item.status === "WITHDRAWN",
    },
  ];

  return (
    <ol className="grid grid-cols-4 px-2" aria-label="Tiến trình hồ sơ">
      {steps.map((s, i) => {
        const leftActive = i > 0 && s.done;
        const rightActive = i < steps.length - 1 && steps[i + 1].done;
        return (
          <li
            key={i}
            className="relative flex flex-col items-center pt-0.5 text-center"
          >
            {i > 0 && (
              <span
                aria-hidden
                className={`absolute left-0 top-[5px] h-0.5 w-1/2 ${
                  leftActive ? "bg-primary-600" : "bg-gray-200"
                }`}
              />
            )}
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={`absolute right-0 top-[5px] h-0.5 w-1/2 ${
                  rightActive ? "bg-primary-600" : "bg-gray-200"
                }`}
              />
            )}
            <span
              aria-hidden
              className={`relative z-10 h-2.5 w-2.5 rounded-full ${
                s.done
                  ? s.danger
                    ? "bg-red-500"
                    : "bg-primary-600"
                  : "bg-gray-300"
              }`}
            />
            <span
              className={`mt-2 text-[11px] font-semibold ${
                s.done ? "text-heading" : "text-gray-400"
              }`}
            >
              {s.label}
            </span>
            <span className="text-[10px] text-gray-400">
              {s.at ? formatShortDate(s.at) : "—"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
