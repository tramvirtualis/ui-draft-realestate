import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight, Baby, Building2, CalendarCheck, Car, Check, Coffee, Compass, Dumbbell, KeyRound, LayoutGrid, MapPin,
  ShieldCheck, ShoppingBag, Trees, Waves, type LucideIcon,
} from "lucide-react";
import { PROJECTS, SERVICES, STATS } from "../../../components/Home/homeData";
import { AMENITIES, DAY_IN_LIFE, MANIFESTO, STORY, TESTIMONIALS } from "../../../components/Home/homeContent";
import { S, SERIF, SoftHeading } from "./softUi";

const WRAP = "relative mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-28";

/* ---------- Bốn ưu điểm: 4 thẻ kính, ảnh tròn, chữ serif ---------- */
const ADVANTAGES = [
  { word: "Minh bạch", desc: "Pháp lý, giá và tiến độ của mọi dự án được công khai và kiểm chứng.", image: DAY_IN_LIFE[0].image },
  { word: "Trực quan", desc: "Tour 360°, mặt bằng tương tác và bảng hàng thời gian thực trên một màn hình.", image: DAY_IN_LIFE[1].image },
  { word: "Kết nối", desc: "Môi giới, nhà đầu tư và người mua gặp nhau trong một cộng đồng chung.", image: DAY_IN_LIFE[2].image },
  { word: "Hiện đại", desc: "Trợ lý AI trả lời 24/7 và giữ chỗ trực tuyến chỉ trong vài phút.", image: DAY_IN_LIFE[4].image },
];

export function SoftAdvantages() {
  return (
    <section id="gioi-thieu" className={`${WRAP} scroll-mt-24`}>
      <SoftHeading eyebrow="Giới thiệu" title="Bốn điều làm nên" accent="Hubtech" />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ADVANTAGES.map((a) => (
          <article key={a.word} className="hd-gloss group p-6 transition duration-300 hover:-translate-y-1">
            <img src={a.image} alt="" loading="lazy" className="h-16 w-16 rounded-full object-cover ring-4 ring-white" />
            <h3 className="mt-6 text-2xl font-medium transition-colors group-hover:text-[#146b43]" style={{ fontFamily: SERIF }}>
              {a.word}
            </h3>
            <p className="mt-3 text-sm leading-7" style={{ color: S.muted }}>
              {a.desc}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

// Cặp dấu ngoặc kép lớn trang trí: mở ở góc trên trái, đóng ở góc dưới phải của thẻ
function QuoteMarks({ size = "text-7xl md:text-8xl" }: { size?: string }) {
  return (
    <>
      <span className={`pointer-events-none absolute left-6 top-4 leading-none md:left-10 md:top-6 ${size}`} style={{ fontFamily: SERIF, color: S.fresh }} aria-hidden>
        “
      </span>
      <span className={`pointer-events-none absolute bottom-0 right-6 leading-[0.6] md:right-10 ${size}`} style={{ fontFamily: SERIF, color: S.fresh }} aria-hidden>
        ”
      </span>
    </>
  );
}

/* ---------- Tuyên ngôn: thẻ kính lớn, câu serif căn giữa giữa cặp ngoặc kép ---------- */
export function SoftManifesto() {
  return (
    <section className="relative mx-auto max-w-5xl px-5 md:px-10">
      <figure className="hd-gloss relative px-10 py-16 text-center md:px-20 md:py-20">
        <QuoteMarks />
        <blockquote className="text-2xl leading-[1.5] md:text-4xl" style={{ fontFamily: SERIF, color: S.ink }}>
          {MANIFESTO.split(" ").map((w, i) => (
            <span key={i} className={w.startsWith("*") ? "italic" : undefined} style={{ color: w.startsWith("*") ? S.accent : undefined }}>
              {w.replace(/\*/g, "")}{" "}
            </span>
          ))}
        </blockquote>
        <figcaption className="mt-8 text-xs uppercase tracking-[0.3em]" style={{ color: S.muted }}>
          Đội ngũ Hubtech · Tuyên ngôn thương hiệu
        </figcaption>
      </figure>
    </section>
  );
}

/* ---------- Dịch vụ: 6 thẻ kính, số serif, nút mũi tên tròn ---------- */
export function SoftServices() {
  return (
    <section id="dich-vu" className={`${WRAP} scroll-mt-24`}>
      <SoftHeading eyebrow="Dịch vụ" title="Mọi thứ bạn cần" accent="trong một nền tảng" />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <Link key={s.no} to={s.path} className="hd-gloss group relative overflow-hidden p-7 transition duration-300 hover:-translate-y-1">
            <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: S.tint }} aria-hidden />
            <div className="relative flex items-start justify-between">
              <span className="text-4xl italic" style={{ fontFamily: SERIF, color: S.accent }}>
                {s.no}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors duration-300 group-hover:bg-[#2bb673] group-hover:text-white" aria-hidden>
                <ArrowUpRight size={16} />
              </span>
            </div>
            <h3 className="relative mt-10 text-2xl font-medium" style={{ fontFamily: SERIF }}>
              {s.title}
            </h3>
            <p className="relative mt-3 text-sm leading-7" style={{ color: S.muted }}>
              {s.desc}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------- Dự án: 3 thẻ ảnh bo tròn, nhãn viên thuốc ---------- */
export function SoftProjects() {
  return (
    <section id="du-an" className={`${WRAP} scroll-mt-24`}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SoftHeading eyebrow="Dự án" title="Dự án" accent="tiêu biểu" />
        <Link to="/projects" className="hd-gloss flex items-center gap-2 !rounded-full px-5 py-3 text-sm font-semibold transition hover:text-[#146b43]">
          Tất cả dự án <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {PROJECTS.map((p) => (
          <Link key={p.code} to="/projects" className="group block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgba(90,60,20,0.45)]">
              <img src={p.image} alt={p.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute left-4 top-4 rounded-full bg-white/85 px-4 py-1.5 text-xs font-semibold backdrop-blur" style={{ color: S.accent }}>
                Dự án {p.code}
              </span>
            </div>
            <p className="mt-5 text-xs uppercase tracking-wider" style={{ color: S.muted }}>
              {p.category}
            </p>
            <h3 className="mt-2 flex items-center justify-between text-3xl font-medium transition-colors group-hover:text-[#146b43]" style={{ fontFamily: SERIF }}>
              {p.name} <ArrowUpRight size={20} strokeWidth={1.5} />
            </h3>
            <p className="mt-2 text-sm leading-7" style={{ color: S.muted }}>
              {p.desc}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-xs">
              <MapPin size={13} /> {p.location}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------- Số liệu: một thẻ kính dưới banner ---------- */
export function SoftStats() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 pt-12 md:px-10">
      <dl className="hd-gloss grid grid-cols-2 gap-6 p-6 md:grid-cols-4 md:p-8">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <dd className="text-4xl font-medium" style={{ fontFamily: SERIF }}>
              {s.value.toLocaleString("vi-VN")}
              <span style={{ color: S.accent }}>{s.suffix}</span>
            </dd>
            <dt className="mt-1 text-xs uppercase tracking-wider" style={{ color: S.muted }}>
              {s.label}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ---------- Một ngày ở đây (bố cục như home-draft-3, làm mềm): danh sách khoảnh khắc bên trái trong một thẻ kính,
   mục đang xem tô nền xanh nhạt bo tròn; ảnh lớn bo góc bên phải đổi theo mốc (mờ dần chồng lên nhau).
   Tự chuyển mốc mỗi 4s; rê chuột / bấm vào mốc nào thì xem mốc đó ---------- */
export function SoftDayInLife() {
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);

  useEffect(() => {
    if (hold) return;
    const t = setInterval(() => setActive((i) => (i + 1) % DAY_IN_LIFE.length), 4000);
    return () => clearInterval(t);
  }, [hold]);

  const d = DAY_IN_LIFE[active];

  return (
    <section className={WRAP}>
      <SoftHeading eyebrow="Không gian sống" title="Một ngày" accent="ở đây" />
      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.15fr]" onMouseLeave={() => setHold(false)}>
        <ol className="hd-gloss space-y-1 p-3">
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
                  className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left transition-colors duration-300"
                  style={{ background: on ? S.tint : "transparent" }}
                >
                  <span className="text-xl md:text-2xl" style={{ fontFamily: SERIF, color: on ? S.accent : "rgba(22,27,44,0.45)" }}>
                    {item.title}
                  </span>
                  <span className="text-xs font-semibold tabular-nums" style={{ color: on ? S.accent : S.muted }}>
                    {item.time}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgba(90,60,20,0.45)]">
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
          <p key={d.time} className="animate-rise-in mt-5 max-w-md leading-8" style={{ color: S.muted }}>
            {d.desc}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Câu chuyện kiến trúc: ảnh bo tròn + chữ serif, điểm nổi bật, số liệu ---------- */
export function SoftStory() {
  return (
    <section className={`${WRAP} grid items-center gap-12 lg:grid-cols-2`}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-[0_30px_70px_-30px_rgba(90,60,20,0.5)]">
        <img src={STORY.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div>
        <SoftHeading eyebrow="Câu chuyện kiến trúc" title={`${STORY.lines[0]} ${STORY.lines[1]}`} accent={STORY.lines[2]} />
        <p className="mt-6 max-w-lg leading-8" style={{ color: S.muted }}>
          {STORY.desc}
        </p>
        <ul className="mt-8 space-y-3">
          {STORY.points.map((pt) => (
            <li key={pt} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ background: S.fresh }}>
                <Check size={12} strokeWidth={3} />
              </span>
              {pt}
            </li>
          ))}
        </ul>
        <dl className="hd-gloss mt-10 grid grid-cols-3 gap-4 p-6">
          {STORY.stats.map((s) => (
            <div key={s.label}>
              <dd className="text-3xl font-medium" style={{ fontFamily: SERIF }}>
                {s.value}
                <span className="text-lg" style={{ color: S.accent }}>
                  {s.suffix}
                </span>
              </dd>
              <dt className="mt-1 text-xs uppercase tracking-wide" style={{ color: S.muted }}>
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ---------- Tiện ích: 8 thẻ kính, icon trong ô tròn xanh nhạt ---------- */
const AMENITY_ICONS: Record<(typeof AMENITIES)[number]["icon"], LucideIcon> = {
  waves: Waves, trees: Trees, dumbbell: Dumbbell, baby: Baby, shield: ShieldCheck, car: Car, bag: ShoppingBag, coffee: Coffee,
};

export function SoftAmenities() {
  return (
    <section className={WRAP}>
      <SoftHeading eyebrow="Tiện ích" title="Tiện ích" accent="chuẩn nghỉ dưỡng" />
      <ul className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
        {AMENITIES.map((a) => {
          const Icon = AMENITY_ICONS[a.icon];
          return (
            <li key={a.title} className="hd-gloss group p-6 transition duration-300 hover:-translate-y-1">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300 group-hover:bg-[#2bb673] group-hover:text-white" style={{ background: S.tint, color: S.accent }}>
                <Icon size={22} strokeWidth={1.6} />
              </span>
              <p className="mt-6 text-lg font-medium" style={{ fontFamily: SERIF }}>
                {a.title}
              </p>
              <p className="mt-1 text-sm" style={{ color: S.muted }}>
                {a.desc}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------- Hành trình mua nhà: 5 chặng ---------- */
const JOURNEY = [
  { word: "Khám phá", icon: Compass, title: "Tìm đúng nơi để sống", desc: "Bộ lọc theo khu vực, ngân sách và loại hình giúp thu hẹp hàng trăm dự án xuống vài lựa chọn thật sự phù hợp — kèm gợi ý từ chuyên viên.", tags: ["Khu vực", "Ngân sách", "Phong cách sống"] },
  { word: "Trải nghiệm", icon: Building2, title: "Xem nhà như đang ở đó", desc: "Tham quan 360° từng căn, xem view thật từ ban công, đọc hồ sơ pháp lý và tiến độ ngay trên màn hình.", tags: ["Tour 360°", "Pháp lý", "Tiến độ"] },
  { word: "Chọn căn", icon: LayoutGrid, title: "So sánh trên mặt bằng", desc: "Bảng hàng thời gian thực theo tòa, tầng, trục và hướng. So sánh giá, diện tích, chiết khấu của nhiều căn cùng lúc.", tags: ["Bảng hàng", "So sánh căn", "Chiết khấu"] },
  { word: "Giữ chỗ", icon: CalendarCheck, title: "Khóa căn trong vài phút", desc: "Giữ chỗ trực tuyến, nhận xác nhận ngay trên điện thoại. Chuyên viên dự án liên hệ trong 15 phút.", tags: ["Trực tuyến", "15 phút", "Xác nhận ngay"] },
  { word: "Nhận nhà", icon: KeyRound, title: "Đồng hành đến ngày bàn giao", desc: "Ký hợp đồng, theo dõi tiến độ xây dựng qua từng đợt cập nhật hình ảnh và nhận bàn giao căn hộ.", tags: ["Hợp đồng", "Tiến độ", "Bàn giao"] },
];

/* Bố cục như home-draft-3: khối cao nhiều màn hình, khung bên trong dính (sticky); cuộn tới đâu dãy chữ lớn trượt ngang tới đó,
   ngôi sao chạy dọc đường kẻ, chặng đang xem chữ đậm (các chặng khác nhạt), thẻ chi tiết bên dưới đổi theo.
   Làm mềm: chữ serif chữ thường, đường kẻ bo tròn vàng nâu có phần đã đi tô đậm, ngôi sao trong vòng tròn kính, chi tiết trong thẻ kính */
export function SoftJourney() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [shift, setShift] = useState(0);
  const n = JOURNEY.length;
  const active = Math.round(progress * (n - 1));

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const wrap = wrapRef.current;
      const view = viewRef.current;
      const track = trackRef.current;
      if (!wrap || !view || !track) return;
      const rect = wrap.getBoundingClientRect();
      const total = wrap.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      // Tâm của chặng hiện tại nội suy giữa 2 chặng liền kề → dãy chữ trượt mượt, chặng đang xem nằm ở 40% khung
      const f = p * (n - 1);
      const i = Math.floor(f);
      const t = f - i;
      const items = track.children as HTMLCollectionOf<HTMLElement>;
      const center = (el?: HTMLElement) => (el ? el.offsetLeft + el.offsetWidth / 2 : 0);
      const c = items[i + 1] ? center(items[i]) * (1 - t) + center(items[i + 1]) * t : center(items[i]);
      setProgress(p);
      setShift(view.clientWidth * 0.4 - c);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [n]);

  const step = JOURNEY[active];
  const Icon = step.icon;

  return (
    <section id="hanh-trinh" className="scroll-mt-24 pt-24 md:pt-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SoftHeading eyebrow="Hành trình mua nhà" title="Từ màn hình" accent="đến chìa khóa" />
      </div>
      <div ref={wrapRef} className="relative" style={{ height: `${n * 70 + 60}vh` }}>
        <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
          <div className="mx-auto w-full max-w-7xl px-5 md:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: S.muted }}>
              Chặng {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </p>

            {/* Đường kẻ bo tròn vàng nâu: phần đã đi tô đậm, ngôi sao trong vòng kính chạy theo tiến độ cuộn */}
            <div className="relative mt-8 h-1.5 rounded-full" style={{ background: S.bronzeTint }}>
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${progress * 100}%`, background: S.bronze }} />
              <span
                className="hd-gloss absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center !rounded-full"
                style={{ left: `${progress * 100}%` }}
                aria-hidden
              >
                <svg viewBox="0 0 40 40" className="h-5 w-5">
                  <path d="M20 0 C21 15 25 19 40 20 C25 21 21 25 20 40 C19 25 15 21 0 20 C15 19 19 15 20 0 Z" fill={S.bronze} />
                </svg>
              </span>
            </div>

            {/* Dãy chữ lớn trượt ngang */}
            <div ref={viewRef} className="relative overflow-hidden py-8 md:py-10">
              <div ref={trackRef} className="flex w-max items-center gap-[7vw] will-change-transform" style={{ transform: `translate3d(${shift}px,0,0)` }}>
                {JOURNEY.map((j, i) => (
                  <span
                    key={j.word}
                    className={`whitespace-nowrap text-[16vw] leading-[1.2] transition-colors duration-500 md:text-[9vw] ${i === active ? "" : "italic"}`}
                    style={{ fontFamily: SERIF, color: i === active ? S.ink : "rgba(22,27,44,0.14)" }}
                  >
                    {j.word}
                  </span>
                ))}
              </div>
            </div>

            {/* Chi tiết chặng đang xem */}
            <div key={step.word} className="hd-gloss grid animate-rise-in gap-6 p-7 md:grid-cols-[auto_1fr] md:p-9">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: S.tint, color: S.accent }}>
                <Icon size={28} strokeWidth={1.6} />
              </span>
              <div>
                <h3 className="text-3xl font-medium" style={{ fontFamily: SERIF }}>
                  {step.title}
                </h3>
                <p className="mt-3 max-w-3xl leading-8" style={{ color: S.muted }}>
                  {step.desc}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {step.tags.map((t) => (
                    <li key={t} className="rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: S.tint, color: S.accent }}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Cảm nhận khách hàng: 3 thẻ kính, trích dẫn serif ---------- */
export function SoftTestimonials() {
  return (
    <section className={WRAP}>
      <SoftHeading eyebrow="Cảm nhận" title="Khách hàng" accent="nói gì" />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="hd-gloss relative flex flex-col p-8 pt-16">
            <QuoteMarks size="text-6xl" />
            <blockquote className="flex-1 text-xl leading-relaxed" style={{ fontFamily: SERIF }}>
              {t.quote}
            </blockquote>
            <figcaption className="mt-8 text-sm">
              <span className="font-semibold">{t.name}</span>
              <span style={{ color: S.muted }}> · {t.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
