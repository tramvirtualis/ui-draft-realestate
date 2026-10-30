import AdCard from "../AdCard";
import type { SocialAd } from "../../../types/social/socialAd.types";

// Mục "Được tài trợ": các ô quảng cáo nhỏ; chưa cài quảng cáo nào thì ẩn cả mục
export default function SponsoredAds({ ads }: { ads: SocialAd[] }) {
  if (ads.length === 0) return null;
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted"><span className="h-px w-6 bg-primary-400" aria-hidden />Được tài trợ</h3>
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </section>
  );
}
