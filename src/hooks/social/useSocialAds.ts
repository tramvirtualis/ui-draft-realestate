import { useEffect, useMemo, useState } from "react";
import { socialAdService } from "../../services/social/socialAdService";
import type { SocialAd } from "../../types/social/socialAd.types";

// Quảng cáo cột phải trang Cộng đồng: 2 ô nhỏ (vị trí 1, 2) + 1 thẻ lớn (vị trí 3); lỗi thì coi như chưa có quảng cáo
export function useSocialAds() {
  const [ads, setAds] = useState<SocialAd[]>([]);

  useEffect(() => {
    let cancelled = false;
    socialAdService
      .list()
      .then((list) => !cancelled && setAds(list))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(
    () => ({
      small: ads.filter((a) => a.slot === 1 || a.slot === 2).sort((a, b) => a.slot - b.slot),
      large: ads.find((a) => a.slot === 3) ?? null,
    }),
    [ads],
  );
}
