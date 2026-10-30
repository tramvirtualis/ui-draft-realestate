import { getNotificationMeta } from "./notificationMeta";
import type { NotificationTab, NotificationTypeItem } from "../../types/notification.types";

/** Hàng tab dạng viên thuốc (Tất cả + từng loại thông báo), kèm số chưa đọc của từng tab */
export default function NotificationTabs({
  types,
  value,
  unreadOf,
  onChange,
}: {
  types: NotificationTypeItem[];
  value: NotificationTab;
  unreadOf: (tab: NotificationTab) => number;
  onChange: (tab: NotificationTab) => void;
}) {
  const tabs: { id: NotificationTab; label: string }[] = [
    { id: "ALL", label: "Tất cả" },
    ...types.map((t) => ({ id: t.id, label: t.name })),
  ];

  return (
    <div role="tablist" aria-label="Loại thông báo" className="flex gap-2 overflow-x-auto px-5 py-3">
      {tabs.map((t) => {
        const active = value === t.id;
        const Icon = t.id === "ALL" ? null : getNotificationMeta(t.id, t.label).icon;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
              active ? "bg-footer font-semibold text-white" : "bg-gray-50 font-medium text-body hover:bg-primary-50"
            }`}
          >
            {Icon && <Icon size={12} className={active ? "" : "text-gray-400"} aria-hidden />}
            {t.label} ({unreadOf(t.id)})
          </button>
        );
      })}
    </div>
  );
}
