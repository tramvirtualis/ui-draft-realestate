import Container from "../Container";
import SectionHeading from "../SectionHeading";
import type { ZoneItem } from "../../../../data/project/detail/overview";

const TONE_STYLE: Record<string, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  primary: "bg-primary-100 text-primary-700",
};

type Props = { zones: ZoneItem[] };

export default function ZonesSection({ zones }: Props) {
  return (
    <section className="py-16">
      <Container>
        <SectionHeading id="phan-khu" eyebrow="Phân khu" title="Ba sắc thái sống, một chuẩn mực Aurelia" desc="Mỗi tòa tháp sở hữu ngôn ngữ cảnh quan, tầm nhìn và bộ sưu tập sản phẩm riêng biệt." />
        <div className="grid gap-5 md:grid-cols-3">
          {zones.map((z) => (
            <div key={z.name} className="overflow-hidden border border-line bg-white shadow-sm">
              <img src={z.image} alt={z.name} className="w-full object-cover" style={{ height: 210 }} />
              <div className="flex items-start justify-between gap-3 p-5 pb-10">
                <div>
                  <p className="text-lg font-semibold text-heading">{z.name}</p>
                  <p className="mt-1.5 text-sm text-body">{z.description}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${TONE_STYLE[z.tone]}`}>{z.status}</span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
