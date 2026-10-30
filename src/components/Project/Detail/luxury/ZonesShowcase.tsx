import { Link } from "react-router-dom";
import { ArrowUpRight, ImageOff } from "lucide-react";
import Container from "../Container";
import Reveal from "../../../common/Reveal";
import LuxuryHeading from "./LuxuryHeading";
import { optimizedImage } from "../../../../utils/imageUrl";
import type { ZoneItem, ZoneTone } from "../../../../types/project/projectOverview.types";

const TONE: Record<ZoneTone, string> = {
  success: "bg-success/90 text-white",
  warning: "bg-warning/90 text-white",
  primary: "bg-primary-600/90 text-white",
};

type Props = { name: string; basePath: string; zones: ZoneItem[] };

export default function ZonesShowcase({ name, basePath, zones }: Props) {
  return (
    <section className="py-20 md:py-28" aria-labelledby="phan-khu-title">
      <Container>
        <LuxuryHeading
          id="phan-khu"
          eyebrow="Phân khu"
          title="Các phân khu của dự án"
          desc="Mỗi phân khu có ngôn ngữ cảnh quan, tình trạng triển khai và sản phẩm riêng."
          action={
            zones.length > 0 ? (
              <Link to={`${basePath}/zones`} className="group flex items-center gap-2 text-sm font-semibold text-primary-700">
                Xem tất cả phân khu <ArrowUpRight size={16} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ) : undefined
          }
        />
        <h2 id="phan-khu-title" className="sr-only">Phân khu của dự án {name}</h2>

        {zones.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-5 py-10 text-center text-sm text-body">
            Dự án chưa có thông tin phân khu.
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {zones.map((z, i) => (
              <li key={z.id}>
                <Reveal variant="up" delay={(i % 3) * 100} className="h-full">
                  <article className="group h-full overflow-hidden border border-line bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-200/60">
                    <div className="relative aspect-[4/3] overflow-hidden bg-primary-100">
                      {z.image ? (
                        <img
                          src={optimizedImage(z.image, 800)}
                          alt={`Phân khu ${z.name}`}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-primary-300">
                          <ImageOff size={36} aria-hidden />
                        </div>
                      )}
                      <span className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent" aria-hidden />
                      {z.status && (
                        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${TONE[z.tone]}`}>
                          {z.status}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-heading text-2xl text-heading">{z.name}</h3>
                      {z.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-body">{z.description}</p>}
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
