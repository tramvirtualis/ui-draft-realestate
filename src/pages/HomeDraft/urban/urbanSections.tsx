import { useEffect, useRef, useState } from "react";
import {
  Baby, Car, Check, Coffee, Dumbbell, ShieldCheck, ShoppingBag, Trees, Waves, type LucideIcon,
} from "lucide-react";
import { AMENITIES, DAY_IN_LIFE, MANIFESTO, STORY } from "../../../components/Home/homeContent";
import { Block, CUT, Heading, MONO, P } from "./urbanUi";

/* Các phần thêm cho bản nháp Urban: một ngày ở đây,
   câu chuyện kiến trúc, tiện ích, tuyên ngôn thương hiệu */

/* ============================================================
   Một ngày ở đây: danh sách khoảnh khắc (không ghi giờ) bên trái, một ảnh lớn bên phải đổi theo mốc (mờ dần chồng lên nhau).
   Tự chuyển mốc mỗi 4s; rê chuột / bấm vào mốc nào thì xem mốc đó
   ============================================================ */
export function DayInLife() {
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);

  useEffect(() => {
    if (hold) return;
    const t = setInterval(() => setActive((i) => (i + 1) % DAY_IN_LIFE.length), 4000);
    return () => clearInterval(t);
  }, [hold]);

  const d = DAY_IN_LIFE[active];

  return (
    <section className="relative z-[1]">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
      <Heading>Một ngày ở đây</Heading>
      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.15fr]" onMouseLeave={() => setHold(false)}>
        <ol className="border-t" style={{ borderColor: P.black }}>
          {DAY_IN_LIFE.map((item, i) => {
            const on = i === active;
            return (
              <li key={item.time}>
                <button
                  type="button"
                  onMouseEnter={() => {
                    setHold(true);
                    setActive(i);
                  }}
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className="relative flex w-full items-baseline gap-6 border-b py-5 text-left transition"
                  style={{ borderColor: P.lilac }}
                >
                  {/* Thanh tiến trình của mốc đang xem */}
                  {on && !hold && <span key={active} className="absolute -bottom-px left-0 h-px w-full origin-left animate-[grow_4s_linear] h-0.5" style={{ background: P.green }} aria-hidden />}
                  <span
                    className={`text-xl font-medium uppercase tracking-tight transition-all duration-300 md:text-2xl ${on ? "translate-x-2" : ""}`}
                    style={{ color: on ? P.black : "rgba(16,16,16,0.35)" }}
                  >
                    {item.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="relative">
          <Block className="right-0 top-0 h-1/2 w-2.5" />
          <div className="relative aspect-[4/3] overflow-hidden" style={{ clipPath: CUT.leftSlant }}>
            {DAY_IN_LIFE.map((item, i) => (
              <img
                key={item.time}
                src={item.image}
                alt={item.title}
                loading="lazy"
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ${i === active ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
              />
            ))}
          </div>
          <p key={d.time} className="animate-rise-in mt-5 max-w-md text-base leading-relaxed" style={{ color: P.muted }}>
            {d.desc}
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}

/* ============================================================
   Câu chuyện kiến trúc: ảnh lớn + 3 dòng tiêu đề + điểm nổi bật + số liệu
   Ảnh trôi chậm ngược chiều cuộn (parallax nhẹ)
   ============================================================ */
export function StorySplit() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      const r = img.parentElement!.getBoundingClientRect();
      const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight; // -1..1 quanh giữa màn hình
      img.style.transform = `translate3d(0, ${p * -40}px, 0) scale(1.12)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section className="relative z-[1]">
      <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-5 py-24 md:px-10 md:py-32 lg:grid-cols-2">
        <div className="relative">
          <Block className="bottom-0 left-0 h-16 w-16" />
          <Block className="left-0 top-0 h-2 w-1/3" color={P.black} />
          <div className="aspect-[4/5] overflow-hidden" style={{ clipPath: CUT.arrow }}>
            <img ref={imgRef} src={STORY.image} alt="" loading="lazy" className="h-full w-full object-cover will-change-transform" />
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-medium uppercase leading-[1.05] tracking-[-0.02em] md:text-5xl">
            {STORY.lines.map((l, i) => (
              <span key={l} className="block" style={{ color: i === 2 ? P.green : P.black }}>
                {l}
              </span>
            ))}
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed" style={{ color: P.muted }}>
            {STORY.desc}
          </p>
          <ul className="mt-8 space-y-3 border-t-2 pt-6" style={{ borderColor: P.green }}>
            {STORY.points.map((pt) => (
              <li key={pt} className="flex items-start gap-3 text-sm">
                <Check size={16} className="mt-0.5 shrink-0" style={{ color: P.green }} /> {pt}
              </li>
            ))}
          </ul>
          <dl className="mt-10 grid grid-cols-3 gap-4">
            {STORY.stats.map((s) => (
              <div key={s.label}>
                <dd className="text-4xl font-light tracking-tight tabular-nums" style={{ fontFamily: MONO }}>
                  {s.value}
                  <span className="text-xl">{s.suffix}</span>
                </dd>
                <dt className="mt-1 text-xs uppercase tracking-wide" style={{ color: P.muted }}>
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Tiện ích: lưới 8 thẻ kính bóng; rê chuột icon nhấc lên + xoay nhẹ, vạch dưới tiêu đề chạy ra, mũi tên hiện
   ============================================================ */
const AMENITY_ICONS: Record<string, LucideIcon> = {
  waves: Waves, trees: Trees, dumbbell: Dumbbell, baby: Baby, shield: ShieldCheck, car: Car, bag: ShoppingBag, coffee: Coffee,
};

export function Amenities() {
  return (
    <section className="relative z-[1]">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
      <Heading>Tiện ích chuẩn nghỉ dưỡng</Heading>
      <ul className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
        {AMENITIES.map((a) => {
          const Icon = AMENITY_ICONS[a.icon];
          return (
            <li
              key={a.title}
              className="hd-gloss group relative overflow-hidden p-6 md:p-8"
            >
              {/* Xanh nhạt loang tròn từ góc dưới trái, chữ chuyển xanh đậm */}
              <span
                className="pointer-events-none absolute inset-0 transition-[clip-path] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] [clip-path:circle(0%_at_0%_100%)] group-hover:[clip-path:circle(150%_at_0%_100%)]"
                style={{ background: P.mint }}
                aria-hidden
              />
              <div className="relative transition-colors duration-500 group-hover:text-[#0a9150]">
                <span className="flex w-fit transition-transform duration-500 ease-[cubic-bezier(0.3,1.6,0.5,1)] group-hover:-translate-y-1.5 group-hover:-rotate-6">
                  <Icon size={28} strokeWidth={1.5} />
                </span>
                <p className="relative mt-8 w-fit text-lg font-medium uppercase tracking-tight">
                  {a.title}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-current transition-all duration-500 group-hover:w-full" aria-hidden />
                </p>
                <p className="mt-2 text-sm opacity-65">{a.desc}</p>
              </div>
            </li>
          );
        })}
      </ul>
      </div>
    </section>
  );
}

/* ============================================================
   Tuyên ngôn thương hiệu (bố cục như trang chủ chính): dải đen, dấu ngoặc kép ở hai góc,
   ảnh bên trái có khối xanh tươi lệch phía sau, câu tuyên ngôn lớn bên phải (từ có dấu * tô xanh), chữ ký bên dưới
   ============================================================ */
function QuoteMark({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 100 76" className={`absolute w-14 md:w-24 ${flip ? "bottom-8 right-6 rotate-180 md:right-10" : "left-6 top-8 md:left-10"}`} fill="currentColor" aria-hidden>
      <path d="M0 34 L20 0 H42 L30 34 H42 V76 H0 Z" />
      <path d="M58 34 L78 0 H100 L88 34 H100 V76 H58 Z" />
    </svg>
  );
}

export function ManifestoBand() {
  return (
    <section className="relative overflow-hidden" style={{ background: P.black, color: P.bg }}>
      <span style={{ color: P.neon }}>
        <QuoteMark />
        <QuoteMark flip />
      </span>
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 pb-28 pt-32 md:grid-cols-12 md:gap-8 md:px-16 md:py-44">
        <div className="relative mx-auto w-full max-w-sm md:col-span-4 md:max-w-none">
          <span className="absolute -left-16 top-1/3 -bottom-10 right-1/3 md:-bottom-24" style={{ background: P.neon }} aria-hidden />
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <img src={DAY_IN_LIFE[2].image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
        {/* relative z-10: khối xanh lệch phía sau ảnh không được đè lên chữ */}
        <div className="relative z-10 flex flex-col justify-center md:col-span-7 md:col-start-6">
          <p className="text-2xl font-medium leading-[1.25] tracking-[-0.015em] md:text-4xl">
            {MANIFESTO.split(" ").map((w, i) => (
              <span key={i} style={{ color: w.startsWith("*") ? P.neon : undefined }}>
                {w.replace(/\*/g, "")}{" "}
              </span>
            ))}
          </p>
          <div className="mt-10">
            <p className="font-medium">Đội ngũ Hubtech</p>
            <p className="mt-1 text-xs uppercase tracking-widest" style={{ fontFamily: MONO, color: "rgba(246,241,231,0.55)" }}>
              Tuyên ngôn thương hiệu
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
