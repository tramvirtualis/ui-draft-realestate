import AdLink from "./sidebar/AdLink";
import type { SocialAd } from "../../types/social/socialAd.types";

type Props = { ad: SocialAd };

// Ô quảng cáo nhỏ trong mục "Được tài trợ" (vị trí 1, 2)
export default function AdCard({ ad }: Props) {
  return (
    <AdLink href={ad.linkUrl} className="block overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md">
      <img src={ad.imageUrl} alt={ad.title} loading="lazy" className="h-32 w-full object-cover" />
      <div className="p-3">
        <p className="font-semibold text-gray-800">{ad.title}</p>
      </div>
    </AdLink>
  );
}
