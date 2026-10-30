import { Sparkles } from "lucide-react";
import Container from "../Container";
import SectionHeading from "../luxury/LuxuryHeading";
import Reveal from "../../../common/Reveal";
import type { AmenityItem } from "../../../../types/project/projectOverview.types";

type Props = { amenities: AmenityItem[] };

// Tiện ích nổi bật: ô đầu tiên lớn hơn khi có từ 5 tiện ích trở lên
const isFeatured = (index: number, total: number) => index === 0 && total >= 5;

function AmenityCard({ item, featured }: { item: AmenityItem; featured: boolean }) {
  return (
    <div
      className={`group relative h-full overflow-hidden border border-white/80 bg-primary-100 shadow-[0_24px_50px_-30px_rgba(10,15,26,0.5)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_40px_70px_-30px_rgba(201,153,31,0.6)] ${
        featured ? "min-h-72 sm:min-h-[22rem] lg:min-h-0" : "min-h-52 sm:min-h-56"
      }`}
    >
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-300 via-primary-100 to-primary-50">
          <Sparkles size={featured ? 56 : 40} className="text-primary-400 transition duration-500 group-hover:rotate-12 group-hover:scale-125" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/20 to-transparent transition duration-500 group-hover:from-primary-800/90" />
      {/* vệt sáng quét ngang khi rê chuột */}
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/20 opacity-0 blur-md transition duration-700 group-hover:left-[130%] group-hover:opacity-100" />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <span className="mb-3 block h-1 w-8 rounded-full bg-primary-300 transition-all duration-500 group-hover:w-16 group-hover:bg-white" />
        <h3
          className={`font-heading font-extrabold uppercase leading-[1.2] tracking-tight text-white drop-shadow-md transition duration-500 group-hover:-translate-y-0.5 ${
            featured ? "text-2xl md:text-3xl" : "text-lg"
          }`}
        >
          {item.name}
        </h3>
      </div>
    </div>
  );
}

export default function AmenitiesSection({ amenities }: Props) {
  return (
    <section className="relative overflow-hidden bg-page py-20 md:py-24">
      {/* họa tiết nền mờ */}
      <span className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary-200/60 blur-3xl" />
      <span className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-primary-300/40 blur-3xl" />

      <Container>
        <div className="relative">
          <SectionHeading
            id="tien-ich"
            eyebrow="Tiện ích"
            title="Hệ tiện ích đáng sống của dự án"
            desc="Không gian nghỉ dưỡng, vui chơi và chăm sóc sức khỏe ngay trong nội khu."
            action={
              amenities.length > 0 ? (
                <span className="rounded-full border border-white/80 bg-white/70 px-4 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-primary-700 backdrop-blur">
                  {amenities.length} tiện ích
                </span>
              ) : undefined
            }
          />

          {amenities.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-primary-200 bg-white/60 px-4 py-10 text-center text-sm text-body">
              Dự án chưa cập nhật tiện ích.
            </p>
          ) : (
            <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {amenities.map((a, i) => {
                const featured = isFeatured(i, amenities.length);
                return (
                  <Reveal
                    key={a.id}
                    variant={i % 2 === 0 ? "up" : "zoom"}
                    delay={(i % 4) * 90}
                    className={featured ? "sm:col-span-2 lg:row-span-2" : ""}
                  >
                    <AmenityCard item={a} featured={featured} />
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
