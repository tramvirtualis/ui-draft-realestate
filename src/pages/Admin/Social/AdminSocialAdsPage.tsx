import { useCallback, useEffect, useState } from "react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import SocialAdSlotCard from "../../../components/Admin/socialAds/SocialAdSlotCard";
import { adminSocialAdService } from "../../../services/social/socialAdService";
import { SOCIAL_AD_SLOTS, type SocialAd } from "../../../types/social/socialAd.types";

type Load = { status: "loading" } | { status: "error" } | { status: "ready"; ads: SocialAd[] };

// Quản lý 3 vị trí quảng cáo ở cột phải trang Cộng đồng (/admin/social-ads)
export default function AdminSocialAdsPage() {
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    adminSocialAdService
      .list()
      .then((ads) => !cancelled && setLoad({ status: "ready", ads }))
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [reload]);

  // Một vị trí vừa lưu / gỡ xong: cập nhật tại chỗ, không tải lại cả trang
  const updateSlot = useCallback((slot: number, ad: SocialAd | null) => {
    setLoad((cur) =>
      cur.status !== "ready" ? cur : { status: "ready", ads: [...cur.ads.filter((a) => a.slot !== slot), ...(ad ? [ad] : [])] },
    );
  }, []);

  return (
    <>
      <AdminPageHeader
        breadcrumb={[{ label: "Tổng quan", to: "/admin/dashboard" }, { label: "Cộng đồng" }, { label: "Quảng cáo cộng đồng" }]}
        title="Quảng cáo cộng đồng"
        desc="Cài ảnh, tên dự án và link cho 3 vị trí quảng cáo ở cột phải trang Cộng đồng. Vị trí nào chưa cài thì không hiện."
      />

      <div className="-mt-16 space-y-5 px-4 pb-10 md:px-8">
        {load.status === "loading" ? (
          <div className="animate-pulse space-y-5" aria-busy="true" aria-label="Đang tải quảng cáo">
            {SOCIAL_AD_SLOTS.map((s) => (
              <div key={s.slot} className="h-72 rounded-2xl bg-primary-50" />
            ))}
          </div>
        ) : load.status === "error" ? (
          <div role="alert" className="rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-sm">
            <p className="font-semibold text-heading">Không tải được danh sách quảng cáo</p>
            <button
              onClick={() => {
                setLoad({ status: "loading" });
                setReload((n) => n + 1);
              }}
              className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95"
            >
              Thử lại
            </button>
          </div>
        ) : (
          SOCIAL_AD_SLOTS.map((meta) => {
            const ad = load.ads.find((a) => a.slot === meta.slot) ?? null;
            // key theo lần lưu gần nhất: lưu / gỡ xong thì form nạp lại đúng dữ liệu mới
            return <SocialAdSlotCard key={`${meta.slot}-${ad?.id ?? "empty"}-${ad?.updatedAt ?? ""}`} meta={meta} ad={ad} onChange={updateSlot} />;
          })
        )}
      </div>
    </>
  );
}
