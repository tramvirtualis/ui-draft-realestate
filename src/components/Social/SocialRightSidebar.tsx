import ProjectAdCard from "./ProjectAdCard";
import ContactList from "./sidebar/ContactList";
import SponsoredAds from "./sidebar/SponsoredAds";
import TrendingList from "./sidebar/TrendingList";
import { useSocialAds } from "../../hooks/social/useSocialAds";

// Quảng cáo do admin cài ở /admin/social-ads; vị trí nào chưa cài thì không hiện
export default function SocialRightSidebar() {
  const ads = useSocialAds();

  return (
    <aside className="hidden xl:block">
      <div className="space-y-6">
        <SponsoredAds ads={ads.small} />
        {/* <TrendingList /> */}
        {/* <ContactList /> */}
      </div>

      {/* Cuộn tới đây mới dính (fixed) lại */}
      {ads.large && (
        <div className="sticky top-22 mt-6">
          <ProjectAdCard ad={ads.large} />
        </div>
      )}
    </aside>
  );
}
