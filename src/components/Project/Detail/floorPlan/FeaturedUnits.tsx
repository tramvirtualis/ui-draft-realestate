import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { STATUS } from "./floorPlanStatus";
import { fmt } from "../inventory/inventoryStatus";
import { UNIT_IMAGE_FALLBACK } from "../../../../data/project/detail/floorPlan";
import type { ProjectUnit } from "../../../../types/project/projectUnits.types";

type Props = {
  featured: ProjectUnit[];
  base: string;
};

// Gợi ý vài căn nổi bật (ưu tiên căn còn trống) dưới mặt bằng / bảng hàng, dẫn sang trang quỹ căn
export default function FeaturedUnits({ featured, base }: Props) {
  return (
    <section className="bg-page-glow py-16 md:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-3 font-heading text-xs font-bold uppercase tracking-[0.16em] text-primary-600">
              <span className="h-px w-10 bg-primary-400/70" aria-hidden /> Gợi ý cho bạn
            </p>
            <h2 className="heading-display mt-3 text-3xl text-heading md:text-4xl">Các căn nổi bật của dự án</h2>
          </div>
          <Link
            to={`${base}/inventory`}
            className="flex items-center gap-2 rounded-full border border-primary-300 bg-white/70 px-6 py-3 font-heading text-xs font-bold uppercase tracking-widest text-primary-700 backdrop-blur transition hover:bg-white"
          >
            Xem toàn bộ quỹ căn <ArrowRight size={15} />
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-primary-200 bg-white/60 px-4 py-8 text-center text-sm text-body">Dự án chưa có căn nào.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {featured.map((f) => {
              const st = STATUS[f.status];
              return (
                <article
                  key={f.id}
                  className="overflow-hidden border border-white/80 bg-white/80 shadow-[0_24px_50px_-30px_rgba(10,15,26,0.45)] backdrop-blur transition duration-300 hover:-translate-y-1"
                >
                  <img src={f.image ?? UNIT_IMAGE_FALLBACK} alt={f.code} className="w-full object-cover" style={{ height: 200 }} />
                  <div className="p-5 pb-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="heading-display text-xl text-heading">{f.code}</h3>
                      <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${st.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} /> {st.label}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-body">
                      {[f.type, f.area ? `${f.area} m²` : null, f.direction || null].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-primary-100 pt-4">
                      <p className="text-xl font-bold text-primary-700">{f.priceBillion ? fmt(f.priceBillion) : "Liên hệ"}</p>
                      <Link to={`${base}/inventory`} className="flex items-center gap-1 font-heading text-[11px] font-bold uppercase tracking-widest text-primary-600">
                        Xem chi tiết <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
