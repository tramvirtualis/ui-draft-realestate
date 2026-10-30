import { Check } from "lucide-react";
import Container from "../Container";
import SectionHeading from "../SectionHeading";
import type { ProjectOverview } from "../../../../data/project/detail/overview";

type Props = { project: ProjectOverview };

export default function OverviewSection({ project: p }: Props) {
  return (
    <section className="py-16">
      <Container>
        <SectionHeading id="tong-quan" eyebrow="Tổng quan" title="Một biểu tượng sống mới bên dòng sông Sài Gòn" desc={p.overview} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {p.facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-line bg-primary-50/60 p-4 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100/70 text-primary-600">
                <Icon size={16} />
              </span>
              <p className="mt-4 text-xs text-muted">{label}</p>
              <p className="mt-1 text-[15px] font-semibold text-heading">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_460px]">
          <div>
            <h3 className="text-2xl font-semibold text-heading">{p.storyTitle}</h3>
            {p.story.map((t) => (
              <p key={t} className="mt-5 text-[15px] leading-7 text-body">{t}</p>
            ))}
          </div>
          <div className="rounded-3xl border border-primary-200 bg-primary-50/70 p-6">
            <h3 className="text-lg font-semibold text-heading">Điểm nổi bật</h3>
            <ul className="mt-4 space-y-3">
              {p.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-sm text-body">
                  <Check size={15} className="mt-0.5 shrink-0 text-primary-600" /> {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
