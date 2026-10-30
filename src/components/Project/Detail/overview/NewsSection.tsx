import { ArrowRight } from "lucide-react";
import Container from "../Container";
import SectionHeading from "../SectionHeading";
import { outlineBtn } from "../styles";
import type { NewsItem } from "../../../../data/project/detail/overview";

type Props = { news: NewsItem[] };

export default function NewsSection({ news }: Props) {
  return (
    <section className="py-16">
      <Container>
        <SectionHeading
          id="tin-tuc"
          eyebrow="Tin tức"
          title="Cập nhật mới quanh dự án và Thủ Thiêm"
          desc="Theo dõi hạ tầng, thị trường và góc nhìn chuyên gia có liên quan trực tiếp đến quyết định của bạn."
          action={<button className={outlineBtn}>Xem tất cả tin tức <ArrowRight size={15} /></button>}
        />
        <div className="grid gap-5 md:grid-cols-3">
          {news.map((n) => (
            <article key={n.title} className="overflow-hidden border border-line bg-white shadow-sm">
              <img src={n.image} alt={n.title} className="w-full object-cover" style={{ height: 220 }} />
              <div className="p-5 pb-8">
                <p className="text-[11px] font-semibold uppercase text-primary-600">{n.category}</p>
                <p className="mt-2 text-lg font-semibold leading-snug text-heading">{n.title}</p>
                <p className="mt-3 text-xs text-muted">{n.meta}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
