import { Check } from "lucide-react";
import Container from "../Container";
import SectionHeading from "../SectionHeading";
import type { PolicyPlan } from "../../../../data/project/detail/overview";

type Props = { plans: PolicyPlan[] };

export default function PolicySection({ plans }: Props) {
  return (
    <section className="bg-primary-50/70 py-16">
      <Container>
        <SectionHeading
          id="chinh-sach"
          eyebrow="Chính sách bán hàng"
          title="Phương án tài chính linh hoạt cho từng kế hoạch"
          desc="Chính sách áp dụng cho đợt mở bán tháng 10/2026, số lượng ưu đãi có giới hạn."
          action={<span className="rounded-full bg-pop-50 px-3 py-1.5 text-xs font-semibold text-pop-600">Hiệu lực đến 31/10/2026</span>}
        />
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((c) => (
            <div
              key={c.title}
              className={`rounded-3xl p-6 shadow-sm ${
                c.featured ? "bg-gradient-to-b from-primary-700 to-footer text-white" : "border border-line bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${c.featured ? "text-white" : "text-heading"}`}>{c.title}</h3>
                {c.featured && <span className="rounded-full bg-pop-500 px-3 py-1 text-[11px] font-semibold text-white">Ưu đãi tốt nhất</span>}
              </div>
              <p className={`mt-5 text-4xl font-bold ${c.featured ? "text-primary-200" : "text-primary-600"}`}>{c.big}</p>
              <p className={`mt-3 text-sm ${c.featured ? "text-primary-200" : "text-body"}`}>{c.desc}</p>
              <ul className="mt-4 space-y-2.5">
                {c.items.map((it) => (
                  <li key={it} className={`flex items-center gap-3 text-sm ${c.featured ? "text-white" : "text-body"}`}>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full ${c.featured ? "bg-white/15" : "bg-primary-100"}`}>
                      <Check size={13} className={c.featured ? "text-white" : "text-primary-600"} />
                    </span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
