import { Check, Images } from "lucide-react";
import Container from "../Container";
import SectionHeading from "../SectionHeading";
import { outlineBtn } from "../styles";
import type { ProgressStep } from "../../../../data/project/detail/overview";

type Props = { steps: ProgressStep[] };

export default function ProgressSection({ steps }: Props) {
  return (
    <section className="py-16">
      <Container>
        <SectionHeading
          id="tien-do"
          eyebrow="Tiến độ"
          title="Minh bạch từng cột mốc xây dựng"
          desc="Hình ảnh và báo cáo tiến độ được đội ngũ NovaLand Hub xác thực định kỳ hàng tháng."
          action={<button className={outlineBtn}>Xem ảnh công trường <Images size={15} /></button>}
        />
        <div className="relative grid grid-cols-2 gap-y-8 md:grid-cols-5">
          <span className="absolute left-[10%] right-[10%] top-[9px] hidden h-0.5 bg-line md:block" />
          <span className="absolute left-[10%] top-[9px] hidden h-0.5 w-[40%] bg-primary-300 md:block" />
          {steps.map((s) => (
            <div key={s.title} className="relative text-center">
              <span
                className={`relative mx-auto flex h-5 w-5 items-center justify-center rounded-full ${
                  s.state === "done" ? "bg-success text-white" : s.state === "current" ? "bg-primary-600" : "border-2 border-line bg-white"
                }`}
              >
                {s.state === "done" && <Check size={11} strokeWidth={3} />}
                {s.state === "current" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <p className="mt-5 text-[11px] font-semibold text-primary-600">{s.date}</p>
              <p className="mt-2 font-semibold text-heading">{s.title}</p>
              <p className="mt-2 text-xs text-body">{s.desc}</p>
              {s.state === "current" && (
                <span className="mt-3 inline-block rounded-full bg-primary-100 px-3 py-1 text-[11px] font-semibold text-primary-700">Đang triển khai</span>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
