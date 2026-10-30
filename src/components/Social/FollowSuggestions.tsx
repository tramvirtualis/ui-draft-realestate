import Avatar from "../common/Avatar";
import { MOCK_SOCIAL_SUGGESTIONS } from "../../data/mockSocial";

export default function FollowSuggestions() {
  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-500">Gợi ý theo dõi</h3>
      <ul className="space-y-3">
        {MOCK_SOCIAL_SUGGESTIONS.map((u) => (
          <li key={u.id} className="flex items-center gap-2">
            <Avatar src={u.avatarUrl} fullName={u.fullName} className="h-9 w-9" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">{u.fullName}</p>
              <p className="truncate text-xs text-gray-500">{u.role}</p>
            </div>
            <button className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-100">
              Theo dõi
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
