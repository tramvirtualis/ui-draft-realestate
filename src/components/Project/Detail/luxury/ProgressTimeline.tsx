import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import Container from "../Container";
import Reveal from "../../../common/Reveal";
import LuxuryHeading from "./LuxuryHeading";
import type { ProgressStep } from "../../../../types/project/projectOverview.types";

type Props = { name: string; basePath: string; steps: ProgressStep[] };

const STATE_LABEL: Record<ProgressStep["state"], string> = {
  done: "Hoàn thành",
  current: "Đang triển khai",
  todo: "Sắp tới",
};

export default function ProgressTimeline({ name, basePath, steps }: Props) {
  return (
    <section className="py-20 md:py-28" aria-labelledby="tien-do-title">
      <Container>
        <LuxuryHeading
          id="tien-do"
          eyebrow="Tiến độ"
          title="Minh bạch từng cột mốc xây dựng"
          action={
            <Link to={`${basePath}/progress`} className="group flex items-center gap-2 text-sm font-semibold text-primary-700">
              Xem hình ảnh công trường <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>
          }
        />
        <h2 id="tien-do-title" className="sr-only">Tiến độ xây dựng dự án {name}</h2>

        {steps.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-5 py-10 text-center text-sm text-body">
            Dự án chưa có báo cáo tiến độ.
          </p>
        ) : (
          <ol className="relative mx-auto max-w-4xl space-y-8 before:absolute before:bottom-2 before:left-5 before:top-2 before:w-px before:bg-gradient-to-b before:from-gold-300 before:via-primary-200 before:to-transparent md:before:left-1/2">
            {steps.map((s, i) => {
              const left = i % 2 === 0;
              return (
                <li key={s.id} className="relative pl-14 md:grid md:grid-cols-2 md:gap-14 md:pl-0">
                  <span
                    className={`absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-lg md:left-1/2 md:-translate-x-1/2 ${
                      s.state === "done" ? "bg-success text-white" : s.state === "current" ? "bg-gold-300 text-gold-950" : "bg-white text-muted ring-1 ring-line"
                    }`}
                    aria-hidden
                  >
                    {s.state === "done" ? <Check size={18} /> : s.state === "current" ? <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gold-950" /> : <span className="h-2 w-2 rounded-full bg-line" />}
                  </span>
                  <Reveal variant={left ? "left" : "right"} delay={60} className={left ? "md:col-start-1 md:text-right" : "md:col-start-2"}>
                    <article className="rounded-3xl border border-line bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-100">
                      <p className={`flex flex-wrap items-center gap-2 text-xs font-semibold ${left ? "md:justify-end" : ""}`}>
                        {s.date && <time className="text-primary-600">{s.date}</time>}
                        <span className={`rounded-full px-2.5 py-0.5 ${s.state === "done" ? "bg-success/10 text-success" : s.state === "current" ? "bg-gold-200/70 text-gold-950" : "bg-line text-body"}`}>
                          {STATE_LABEL[s.state]}
                        </span>
                      </p>
                      <h3 className="mt-3 font-heading text-xl text-heading">{s.title}</h3>
                      {s.desc && <p className="mt-2 line-clamp-3 text-sm leading-6 text-body">{s.desc}</p>}
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        )}
      </Container>
    </section>
  );
}
