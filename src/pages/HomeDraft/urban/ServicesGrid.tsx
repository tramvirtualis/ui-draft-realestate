import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SERVICES } from "../../../components/Home/homeData";
import { Heading, P } from "./urbanUi";

/* "Mọi thứ trong một nền tảng": lưới 6 thẻ kính bóng, mỗi thẻ dẫn tới trang thật của mảng đó.
   Rê chuột: thẻ nhấc nhẹ, nền ánh xanh nhạt, nút mũi tên tô xanh tươi */
export default function ServicesGrid() {
  return (
    <section id="dich-vu" className="relative mx-auto max-w-[1440px] scroll-mt-24 px-5 pb-24 pt-16 md:px-10 md:pb-32 md:pt-24">
      <Heading>Mọi thứ trong một nền tảng</Heading>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <Link key={s.no} to={s.path} className="hd-gloss group relative flex flex-col overflow-hidden p-7 transition duration-300 hover:-translate-y-1">
            <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: P.mint }} aria-hidden />
            <div className="relative flex items-start justify-between">
              <span className="text-4xl font-light tabular-nums" style={{ color: P.green }}>
                {s.no}
              </span>
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300 group-hover:border-transparent group-hover:bg-[#2bb673] group-hover:text-white"
                style={{ borderColor: "rgba(16,16,16,0.2)" }}
                aria-hidden
              >
                <ArrowUpRight size={16} />
              </span>
            </div>
            <h3 className="relative mt-10 text-xl font-medium uppercase tracking-tight">{s.title}</h3>
            <p className="relative mt-3 text-sm leading-relaxed" style={{ color: P.muted }}>
              {s.desc}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
