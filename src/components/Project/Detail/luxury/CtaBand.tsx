import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import Container from "../Container";
import Reveal from "../../../common/Reveal";

type Props = { name: string; basePath: string };

// CTA chốt cuối trang: khối tím nhạt có quầng sáng, dẫn tới quỹ căn và tài liệu
export default function CtaBand({ name, basePath }: Props) {
  return (
    <section className="bg-page py-16 md:py-20" aria-labelledby="cta-title">
      <Container>
        <Reveal variant="zoom">
          <div className="relative isolate overflow-hidden rounded-[2.5rem] border border-primary-200 bg-primary-100 px-6 py-14 text-center md:px-16 md:py-20">
            <span className="pointer-events-none absolute -left-20 -top-20 -z-10 h-72 w-72 rounded-full bg-white/70 blur-3xl" aria-hidden />
            <span className="pointer-events-none absolute -bottom-24 -right-16 -z-10 h-80 w-80 rounded-full bg-primary-300/40 blur-3xl" aria-hidden />
            <p className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-primary-600">Sẵn sàng sở hữu</p>
            <h2 id="cta-title" className="heading-display mx-auto mt-5 max-w-3xl text-3xl text-heading md:text-5xl">
              Chọn căn phù hợp tại <span className="text-primary-600">{name}</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-body">
              Xem quỹ căn đang mở bán, tham khảo chính sách thanh toán và tải tài liệu dự án để có quyết định chắc chắn.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                to={`${basePath}/inventory`}
                className="btn-gloss group flex items-center gap-2 rounded-full px-8 py-4 font-heading text-xs font-bold uppercase tracking-widest text-white transition hover:-translate-y-0.5 active:scale-95"
              >
                Xem quỹ căn <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </Link>
              <Link
                to={`${basePath}/documents`}
                className="flex items-center gap-2 rounded-full border border-primary-300 bg-white px-8 py-4 font-heading text-xs font-bold uppercase tracking-widest text-primary-700 transition hover:bg-primary-50 active:scale-95"
              >
                <FileText size={16} aria-hidden /> Tải tài liệu
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
