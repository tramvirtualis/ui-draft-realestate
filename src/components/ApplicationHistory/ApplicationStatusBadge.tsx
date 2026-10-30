import {
  APPLICATION_STATUS_META,
  type ApplicationStatus,
} from "../../types/applicationHistory.types";

export default function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = APPLICATION_STATUS_META[status];
  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${meta.badge}`}>{meta.label}</span>
  );
}
