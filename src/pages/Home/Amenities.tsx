import {
  Baby, Car, Coffee, Dumbbell, ShieldCheck, ShoppingBag, Trees, Waves, type LucideIcon,
} from "lucide-react";
import { AMENITIES } from "../../components/Home/homeContent";
import { Heading, OrganicDivider, P } from "../../components/Home/urbanUi";

/* ============================================================
   Tiện ích: lưới 8 ô kẻ đen; rê chuột icon nhấc lên + xoay nhẹ, vạch dưới tiêu đề chạy ra, mũi tên hiện
   ============================================================ */
const AMENITY_ICONS: Record<string, LucideIcon> = {
  waves: Waves, trees: Trees, dumbbell: Dumbbell, baby: Baby, shield: ShieldCheck, car: Car, bag: ShoppingBag, coffee: Coffee,
};

export function Amenities() {
  return (
    <section className="relative z-[1]" style={{ background: P.bg }}>
      <OrganicDivider color={P.bg} variant="wave" />
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
      <Heading>Tiện ích chuẩn nghỉ dưỡng</Heading>
      <ul className="mt-14 grid grid-cols-2 border-l border-t md:grid-cols-4" style={{ borderColor: P.black }}>
        {AMENITIES.map((a) => {
          const Icon = AMENITY_ICONS[a.icon];
          return (
            <li
              key={a.title}
              className="group relative overflow-hidden border-b border-r p-6 md:p-8"
              style={{ borderColor: P.black }}
            >
              {/* Xanh nhạt loang tròn từ góc dưới trái, chữ chuyển xanh đậm */}
              <span
                className="pointer-events-none absolute inset-0 transition-[clip-path] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] [clip-path:circle(0%_at_0%_100%)] group-hover:[clip-path:circle(150%_at_0%_100%)]"
                style={{ background: P.mint }}
                aria-hidden
              />
              <div className="relative transition-colors duration-500 group-hover:text-[#a67d12]">
                <span className="flex w-fit transition-transform duration-500 ease-[cubic-bezier(0.3,1.6,0.5,1)] group-hover:-translate-y-1.5 group-hover:-rotate-6">
                  <Icon size={28} strokeWidth={1.5} />
                </span>
                <p className="relative mt-8 w-fit text-lg font-medium uppercase tracking-tight">
                  {a.title}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-current transition-all duration-500 group-hover:w-full" aria-hidden />
                </p>
                <p className="mt-2 text-sm opacity-65">{a.desc}</p>
              </div>
            </li>
          );
        })}
      </ul>
      </div>
    </section>
  );
}
