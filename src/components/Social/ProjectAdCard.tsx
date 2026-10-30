import AdLink from "./sidebar/AdLink";
import type { SocialAd } from "../../types/social/socialAd.types";

type Props = { ad: SocialAd };

// Thẻ quảng cáo lớn (vị trí 3), dính lại khi cuộn trang
export default function ProjectAdCard({ ad }: Props) {
  return (
    <AdLink href={ad.linkUrl} className="block overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md">
      <img src={ad.imageUrl} alt={ad.title} loading="lazy" className="h-72 w-full object-cover" />
      <div className="space-y-2 p-4">
        <span className="text-xs font-semibold uppercase text-gray-400">Được tài trợ</span>
        <p className="text-lg font-bold text-gray-900">{ad.title}</p>
        <span className="mt-2 block rounded-lg bg-primary-600 py-2 text-center text-sm font-medium text-white">
          Xem dự án
        </span>
      </div>
    </AdLink>
  );
}
