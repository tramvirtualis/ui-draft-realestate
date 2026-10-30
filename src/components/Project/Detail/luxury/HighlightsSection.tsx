import { Sparkles, type LucideIcon } from "lucide-react";
import Container from "../Container";
import Reveal from "../../../common/Reveal";
import { useCountUp } from "../../../../hooks/useCountUp";
import LuxuryHeading from "./LuxuryHeading";

export type HighlightStat = { icon: LucideIcon; label: string; value: number };

function StatTile({ stat, index }: { stat: HighlightStat; index: number }) {
  const { ref, value } = useCountUp(stat.value);
  const Icon = stat.icon;
  return (
    <Reveal variant="up" delay={index * 90} className="h-full">
      <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition duration-500 hover:-translate-y-1.5 hover:border-gold-300/50 hover:bg-white/[0.08] md:p-7">
        <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gold-300/10 blur-2xl transition duration-500 group-hover:bg-gold-300/25" aria-hidden />
        <Icon size={26} className="text-gold-300 transition duration-500 group-hover:scale-110" aria-hidden />
        <p className="mt-5 font-heading text-5xl text-white md:text-6xl">
          <span ref={ref as React.RefObject<HTMLSpanElement>}>{value.toLocaleString("vi-VN")}</span>
        </p>
        <p className="mt-2 text-sm text-white/65">{stat.label}</p>
      </div>
    </Reveal>
  );
}

type Props = { stats: HighlightStat[]; amenityNames: string[] };

// Điểm nổi bật: chỉ dùng số liệu và tên tiện ích có thật của dự án
export default function HighlightsSection({ stats, amenityNames }: Props) {
  const visible = stats.filter((s) => s.value > 0);
  if (visible.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-ink-950 py-20 md:py-28" aria-labelledby="diem-noi-bat-title">
      <span className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-gold-300/10 blur-3xl" aria-hidden />
      <span className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-primary-600/20 blur-3xl" aria-hidden />
      <Container>
        <div className="relative">
          <LuxuryHeading id="diem-noi-bat" tone="dark" eyebrow="Điểm nổi bật" title="Những con số làm nên giá trị" />
          <h2 id="diem-noi-bat-title" className="sr-only">Điểm nổi bật của dự án</h2>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {visible.map((s, i) => (
              <li key={s.label}>
                <StatTile stat={s} index={i} />
              </li>
            ))}
          </ul>

          {amenityNames.length > 0 && (
            <Reveal variant="up" delay={200}>
              <div className="mt-8 flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
                <span className="flex items-center gap-2 text-sm font-semibold text-gold-200">
                  <Sparkles size={16} aria-hidden /> Tiện ích nổi bật
                </span>
                {amenityNames.map((n) => (
                  <span key={n} className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/85 transition hover:border-gold-300/60 hover:text-white">
                    {n}
                  </span>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
