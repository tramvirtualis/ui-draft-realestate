import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ZoomIn } from "lucide-react";
import Container from "../Container";
import Reveal from "../../../common/Reveal";
import Lightbox from "../../../common/Lightbox";
import LuxuryHeading from "./LuxuryHeading";
import { optimizedImage } from "../../../../utils/imageUrl";
import type { PolicyImage } from "../../../../types/project/projectOverview.types";

type Props = { name: string; basePath: string; images: PolicyImage[] };

export default function PolicyShowcase({ name, basePath, images }: Props) {
  const [viewing, setViewing] = useState<number | null>(null);
  const view = useMemo(
    () => images.map((p, i) => ({ src: p.src, title: `Chính sách bán hàng ${i + 1}`, date: null })),
    [images],
  );

  return (
    <section className="bg-primary-50/60 py-20 md:py-28" aria-labelledby="chinh-sach-title">
      <Container>
        <LuxuryHeading
          id="chinh-sach"
          eyebrow="Chính sách bán hàng"
          title="Phương án tài chính và ưu đãi"
          desc="Chính sách thanh toán, ưu đãi và hỗ trợ vay hiện hành của dự án."
          action={
            <Link to={`${basePath}/policy`} className="group flex items-center gap-2 text-sm font-semibold text-primary-700">
              Xem chi tiết chính sách <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>
          }
        />
        <h2 id="chinh-sach-title" className="sr-only">Chính sách bán hàng của dự án {name}</h2>

        {images.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-primary-200 bg-white px-5 py-10 text-center text-sm text-body">
            Dự án chưa cập nhật chính sách bán hàng.
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {images.slice(0, 3).map((p, i) => (
              <li key={p.id}>
                <Reveal variant="up" delay={i * 100}>
                  <button
                    type="button"
                    onClick={() => setViewing(i)}
                    aria-label={`Xem chính sách bán hàng ${i + 1}`}
                    className="group relative block w-full overflow-hidden border border-line bg-white shadow-sm outline-none ring-primary-500 transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl focus-visible:ring-4"
                  >
                    <img
                      src={optimizedImage(p.src, 800)}
                      alt={`Chính sách bán hàng ${i + 1} của ${name}`}
                      loading="lazy"
                      decoding="async"
                      className="h-80 w-full object-cover object-top transition duration-700 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-ink-950/0 opacity-0 transition duration-300 group-hover:bg-ink-950/35 group-hover:opacity-100">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary-600 shadow-xl">
                        <ZoomIn size={22} aria-hidden />
                      </span>
                    </span>
                  </button>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </Container>
      {viewing !== null && <Lightbox images={view} index={viewing} onIndexChange={setViewing} onClose={() => setViewing(null)} />}
    </section>
  );
}
