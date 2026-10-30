import { MOCK_SOCIAL_TRENDING } from "../../../data/mockSocial";

export default function TrendingList() {
  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-500">Xu hướng</h3>
      <ul className="space-y-2">
        {MOCK_SOCIAL_TRENDING.map((t) => (
          <li key={t.id} className="text-sm">
            <p className="font-medium text-gray-800">{t.tag}</p>
            <p className="text-xs text-gray-500">{t.postCount.toLocaleString("vi-VN")} bài viết</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
