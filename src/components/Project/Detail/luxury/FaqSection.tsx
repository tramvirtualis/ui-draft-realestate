import { useState } from "react";
import { Plus } from "lucide-react";
import Container from "../Container";
import Reveal from "../../../common/Reveal";
import LuxuryHeading from "./LuxuryHeading";
import type { FaqItem } from "../../../../types/project/projectOverview.types";

type Props = { name: string; faqs: FaqItem[] };

// Câu hỏi thường gặp lấy từ bảng questions của dự án; không có dữ liệu thì không hiển thị
export default function FaqSection({ name, faqs }: Props) {
  const [open, setOpen] = useState<number | null>(faqs[0]?.id ?? null);
  if (faqs.length === 0) return null;

  return (
    <section className="bg-page-glow py-20 md:py-28" aria-labelledby="faq-title">
      <Container>
        <div className="mx-auto max-w-3xl">
          <LuxuryHeading id="faq" eyebrow="Câu hỏi thường gặp" title="Giải đáp nhanh về dự án" />
          <h2 id="faq-title" className="sr-only">Câu hỏi thường gặp về dự án {name}</h2>
          <ul className="space-y-3">
            {faqs.map((f, i) => {
              const expanded = open === f.id;
              return (
                <li key={f.id}>
                  <Reveal variant="up" delay={i * 50}>
                    <div
                      className={`overflow-hidden rounded-2xl border backdrop-blur transition duration-300 ${
                        expanded
                          ? "border-primary-300 bg-white/90 shadow-[0_24px_50px_-30px_rgba(201,153,31,0.55)]"
                          : "border-white/80 bg-white/65 hover:bg-white/80"
                      }`}
                    >
                      <h3>
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={`faq-panel-${f.id}`}
                          id={`faq-button-${f.id}`}
                          onClick={() => setOpen(expanded ? null : f.id)}
                          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-heading outline-none ring-primary-500 focus-visible:ring-4"
                        >
                          {f.question}
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition duration-300 ${
                              expanded ? "btn-gloss rotate-45 text-white" : "bg-primary-100 text-primary-600"
                            }`}
                          >
                            <Plus size={16} aria-hidden />
                          </span>
                        </button>
                      </h3>
                      <div
                        id={`faq-panel-${f.id}`}
                        role="region"
                        aria-labelledby={`faq-button-${f.id}`}
                        className={`grid transition-all duration-300 ease-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                      >
                        <div className="overflow-hidden">
                          <p className="px-6 pb-6 text-[15px] leading-7 text-body">{f.answer}</p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
