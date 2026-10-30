import Avatar from "../../common/Avatar";
import { MOCK_SOCIAL_CONTACTS } from "../../../data/mockSocial";

export default function ContactList() {
  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-500">Người liên hệ</h3>
      <ul className="space-y-2">
        {MOCK_SOCIAL_CONTACTS.map((u) => (
          <li key={u.id} className="flex items-center gap-2 text-sm">
            <Avatar src={u.avatarUrl} fullName={u.fullName} className="h-8 w-8" />
            {u.fullName}
          </li>
        ))}
      </ul>
    </section>
  );
}
