import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { GalleryItem } from "./GalleryFlythrough";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, MapPin, Search } from "lucide-react";
import { useSeo } from "../../hooks/useSeo";
import HavenHeader from "../../components/Home/HavenHeader";
import { HERO_IMAGE, HERO_VIDEO, PROJECTS, STATS } from "../../components/Home/homeData";
import { DAY_IN_LIFE, MANIFESTO, STORY, TESTIMONIALS } from "../../components/Home/homeContent";
import Chatbot from "../../components/Home/Chatbot";
import "../../components/Home/home.css";
import { FONT, Heading, MONO, P, useUrbanFonts } from "../../components/Home/urbanUi";
import ServicesFloorPlan from "./ServicesFloorPlan";
import { Amenities } from "./Amenities";
import SkylineFooter from "../../components/Home/SkylineFooter";
import { ADVANTAGES, ScrollJourney } from "./ScrollJourney";
import { useCinematic } from "./useCinematic";
import "./cinematic.css";

/* Trang chủ (/): kể thành 11 cảnh nối nhau
   "từ bản vẽ đến ngôi nhà", mọi chuyển động chạy theo vị trí cuộn (GSAP + ScrollTrigger, xem useCinematic.ts).
   Mỗi cảnh có các móc data-c="…" để timeline điều khiển.
   Không có hiệu ứng (giảm chuyển động) → bố cục tĩnh xếp dọc, đầy đủ nội dung. */

const CREAM = P.bg;
const DIM_ON_DARK = "rgba(250,245,240,0.62)";
const GALLERY_BG = "#0d0d12"; // nền tối, nối liền sau cảnh Dự án

/* ---------- Vạch tiến độ đọc trang trên đỉnh (nghe sự kiện từ useCinematic, không làm render lại trang) ---------- */
function ProgressBar() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onProgress = (e: Event) => {
      if (bar.current) bar.current.style.transform = `scaleX(${(e as CustomEvent<number>).detail})`;
    };
    window.addEventListener("cine:progress", onProgress);
    return () => window.removeEventListener("cine:progress", onProgress);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 motion-reduce:!hidden" aria-hidden>
      <div ref={bar} className="h-full origin-left" style={{ background: P.green, transform: "scaleX(0)" }} />
    </div>
  );
}

/* ---------- Cảnh 1: Mở đầu ---------- */
function HeroScene() {
  return (
    <section data-c="hero" data-scene="0" className="relative isolate h-svh overflow-hidden" style={{ background: CREAM }}>
      <div data-c="hero-frame" className="absolute inset-0 overflow-hidden" style={{ background: P.black }}>
        <video data-c="hero-video" className="absolute inset-0 h-full w-full object-cover" src={HERO_VIDEO} poster={HERO_IMAGE} autoPlay muted loop playsInline preload="metadata" aria-hidden />
        <div data-c="hero-shade" className="absolute inset-0 bg-linear-to-b from-black/55 via-black/15 to-black/70" aria-hidden />
      </div>

      <div className="relative flex h-full flex-col justify-end px-5 pb-10 pt-32 text-[#faf5f0] md:px-10 md:pb-14">
        <p data-c="hero-kicker" className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-[#faf5f0]/80">
          <span className="h-px w-10 bg-[#faf5f0]/70" aria-hidden /> Tầm nhìn 2026
        </p>
        <h1 className="text-[11vw] font-medium uppercase leading-[1.08] tracking-[-0.03em] drop-shadow-[0_4px_30px_rgba(0,0,0,0.35)] lg:text-[5.6vw]">
          <span data-c="hero-l1" className="block">
            Bất động sản
          </span>
          <span data-c="hero-l2" className="block font-light">
            tầm nhìn số
          </span>
        </h1>
        <div data-c="hero-cta" className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#faf5f0]/30 pt-6">
          <Link to="/projects" className="flex items-center gap-2 bg-[#faf5f0] px-6 py-3.5 text-xs font-medium uppercase tracking-wide text-[#101010] transition hover:bg-[#fcf1cc]">
            <Search size={14} /> Tìm dự án
          </Link>
        </div>

        {/* Số liệu: tĩnh nằm dưới tiêu đề; chế độ điện ảnh bay ra 4 góc quanh khung video */}
        <dl className="cine-hero-stats mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} data-c="hero-stat" className="cine-hero-stat">
              <span className="mb-3 block h-[3px] w-8" style={{ background: P.green }} aria-hidden />
              <dd className="text-4xl font-light tracking-tight md:text-5xl">
                <span data-c="hero-count" data-value={s.value}>
                  {s.value.toLocaleString("vi-VN")}
                </span>
                {s.suffix}
              </dd>
              <dt className="mt-2 text-xs uppercase tracking-wide opacity-70">{s.label}</dt>
            </div>
          ))}
        </dl>
        <p data-c="hero-outro" className="cine-hero-outro hidden text-xs uppercase tracking-[0.25em]" style={{ fontFamily: MONO, color: P.muted }}>
          Mọi ngôi nhà bắt đầu từ một tầm nhìn
        </p>
      </div>
    </section>
  );
}

/* ---------- Cảnh 2: Bốn ưu điểm ---------- */
function AdvantagesScene() {
  return (
    <section data-c="adv" data-scene="1" id="gioi-thieu" className="cine-adv mx-auto max-w-[1440px] px-5 py-24 md:px-10" style={{ background: CREAM }}>
      <p className="cine-adv-label text-xs uppercase tracking-[0.2em]" style={{ fontFamily: MONO, color: P.green }}>
        Bốn điều làm nên Hubtech
      </p>
      <div className="cine-adv-stage mt-10 grid gap-14">
        {ADVANTAGES.map((a, i) => (
          <article key={a.word} data-c="adv-item" className="cine-adv-item grid gap-6 border-t pt-6 md:grid-cols-2" style={{ borderColor: "rgba(16,16,16,0.15)" }}>
            <span className="cine-adv-no text-xs tabular-nums" style={{ fontFamily: MONO, color: P.muted }}>
              {String(i + 1).padStart(2, "0")} / {String(ADVANTAGES.length).padStart(2, "0")}
            </span>
            <h3 data-c="adv-word" className="cine-adv-word text-5xl font-semibold uppercase tracking-[-0.05em] md:text-7xl">
              {a.word}
            </h3>
            <div data-c="adv-img" className="cine-adv-img relative aspect-[16/10] overflow-hidden">
              <img src={a.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <p data-c="adv-desc" className="cine-adv-desc text-base leading-relaxed md:text-lg" style={{ color: P.muted }}>
              {a.desc}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- Cảnh 3: Tuyên ngôn (đổi ánh sáng kem → đen) ---------- */
function QuoteMark({ flip = false, c }: { flip?: boolean; c: string }) {
  return (
    <svg data-c={c} viewBox="0 0 100 76" className={`absolute w-14 md:w-24 ${flip ? "bottom-8 right-6 md:right-10" : "left-6 top-8 md:left-10"}`} fill="currentColor" aria-hidden>
      <g style={flip ? { transform: "rotate(180deg)", transformOrigin: "50% 50%" } : undefined}>
        <path d="M0 34 L20 0 H42 L30 34 H42 V76 H0 Z" />
        <path d="M58 34 L78 0 H100 L88 34 H100 V76 H58 Z" />
      </g>
    </svg>
  );
}

function ManifestoScene() {
  const words = MANIFESTO.split(" ");
  return (
    <section data-c="mani" data-scene="2" className="relative overflow-hidden" style={{ background: P.black, color: CREAM }}>
      <QuoteMark c="mani-q1" />
      <QuoteMark c="mani-q2" flip />
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 pb-28 pt-32 md:grid-cols-12 md:gap-8 md:px-16 md:py-44">
        <div className="relative mx-auto w-full max-w-sm md:col-span-4 md:max-w-none">
          <span data-c="mani-block" className="absolute -left-16 top-1/3 -bottom-10 right-1/3 md:-bottom-24" style={{ background: P.green }} aria-hidden />
          <div data-c="mani-imgwrap" className="relative aspect-[4/5] overflow-hidden">
            <img data-c="mani-img" src={DAY_IN_LIFE[2].image} alt="" loading="lazy" className="absolute inset-0 h-full w-full scale-125 object-cover" />
          </div>
        </div>
        {/* relative z-10: khối vàng (absolute, trôi parallax) không được đè lên chữ */}
        <div className="relative z-10 flex flex-col justify-center md:col-span-7 md:col-start-6">
          <p className="text-2xl font-medium leading-[1.25] tracking-[-0.015em] md:text-4xl">
            {words.map((w, i) => (
              <span key={i} data-c="mani-w" style={{ color: w.startsWith("*") ? P.neon : undefined }}>
                {w.replace(/\*/g, "")}{" "}
              </span>
            ))}
          </p>
          <div data-c="mani-sign" className="mt-10">
            <p className="font-medium">Đội ngũ Hubtech</p>
            <p className="mt-1 text-xs uppercase tracking-widest" style={{ fontFamily: MONO, color: "rgba(250,245,240,0.55)" }}>
              Tuyên ngôn thương hiệu
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Cảnh 4: Bản vẽ mặt bằng → zoom vào phòng thành cảnh dự án ---------- */
function BlueprintScene() {
  return (
    <section data-c="bp" data-scene="3" className="cine-bp relative" style={{ background: CREAM }}>
      <div data-c="bp-plan" className="cine-bp-plan w-full">
        <ServicesFloorPlan />
      </div>
      {/* Lớp zoom: ảnh dự án nằm đúng ô "Sảnh & ban công" rồi nở ra tràn màn hình */}
      <div data-c="bp-zoom" className="cine-bp-zoom pointer-events-none absolute inset-0 z-10 overflow-hidden" style={{ background: P.black }} aria-hidden>
        <img data-c="bp-zoom-img" src={PROJECTS[0].image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/30" />
        <p data-c="bp-zoom-title" className="absolute bottom-[10vh] left-[5vw] text-[9vw] font-semibold uppercase leading-[0.9] tracking-[-0.05em] text-[#faf5f0]">
          Dự án tiêu biểu
        </p>
      </div>
    </section>
  );
}

/* ---------- Cảnh 5: Dự án trượt ngang ---------- */
function ProjectsScene() {
  return (
    <section data-c="proj" data-scene="4" id="du-an" className="cine-proj relative overflow-hidden" style={{ background: P.black, color: CREAM }}>
      <div data-c="proj-track" className="cine-proj-track flex flex-col gap-16 pb-24">
        {/* Tấm mở đầu: trùng khung hình cuối của cảnh bản vẽ để nối liền mạch */}
        <div className="cine-proj-intro relative min-h-[70svh] shrink-0 overflow-hidden">
          <img src={PROJECTS[0].image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/30" aria-hidden />
          <p className="absolute bottom-[10vh] left-[5vw] text-[11vw] font-semibold uppercase leading-[0.9] tracking-[-0.05em] lg:text-[9vw]">Dự án tiêu biểu</p>
          <Link to="/projects" className="absolute right-[5vw] top-[14vh] flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
            Tất cả dự án <ArrowRight size={15} />
          </Link>
        </div>

        {PROJECTS.map((p) => (
          <article key={p.code} data-c="proj-panel" className="cine-proj-panel relative shrink-0 px-5 md:px-10">
            <Link to="/projects" data-c="proj-card" className="cine-proj-card group relative block aspect-[4/5] overflow-hidden md:aspect-[16/10]">
              <img data-c="proj-pic" src={p.image} alt={p.name} loading="lazy" className="absolute inset-0 h-full w-full scale-125 object-cover" />
              <span className="absolute left-0 top-6 z-10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#faf5f0]" style={{ background: P.green }}>
                Dự án {p.code}
              </span>
            </Link>
            <h3 data-c="proj-name" className="cine-proj-name mt-6 text-6xl font-semibold uppercase leading-[0.85] tracking-[-0.06em]">
              {p.name}
            </h3>
            <div data-c="proj-info" className="cine-proj-info mt-4">
              <p className="text-xs uppercase tracking-wide" style={{ color: DIM_ON_DARK }}>
                {p.category}
              </p>
              <p className="mt-4 flex items-center gap-1.5 text-xs">
                <MapPin size={13} /> {p.location}
              </p>
              <Link to="/projects" className="group mt-6 inline-flex items-center gap-2 border-b pb-1 text-xs uppercase tracking-wide transition-colors hover:text-[#e8b93a]" style={{ borderColor: "rgba(250,245,240,0.4)" }}>
                Xem dự án <ArrowUpRight size={15} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </article>
        ))}

        <div className="cine-proj-end flex shrink-0 items-center justify-center px-5">
          <Link
            to="/projects"
            data-c="proj-endlink"
            className="group flex aspect-square w-64 flex-col items-center justify-center rounded-full border text-center transition hover:bg-[#faf5f0] hover:text-[#101010] md:w-80"
            style={{ borderColor: "rgba(250,245,240,0.5)" }}
          >
            <span className="text-xs uppercase tracking-widest" style={{ fontFamily: MONO, color: P.neon }}>
              Xem thêm
            </span>
            <span className="mt-3 text-2xl font-semibold uppercase tracking-tight md:text-3xl">Tất cả dự án</span>
            <ArrowRight className="mt-4 transition group-hover:translate-x-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- Cảnh 6: Không gian sống — cú máy 3D xuyên qua phòng tranh (ghim) ----------
   Nối từ nền đen của cảnh Dự án, kết thúc bằng cú lao thẳng vào ảnh phòng khách
   — đúng ảnh mở đầu cảnh "Câu chuyện kiến trúc" — rồi hoà sang nền của cảnh đó. Tiến độ bay do useCinematic điều khiển. */
const GalleryFlythrough = lazy(() => import("./GalleryFlythrough"));
const GALLERY: GalleryItem[] = [
  ...DAY_IN_LIFE.map((d) => ({ src: d.image, label: d.title })),
  ...PROJECTS.flatMap((p) => [
    { src: p.image, label: `Dự án ${p.name}` },
    { src: p.thumb, label: `Nội thất ${p.name}` },
  ]),
  { src: STORY.image, label: "Mỗi căn nhà là một câu chuyện" }, // tấm cuối đường bay
];

function GalleryScene() {
  const reduce = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const caption = useRef<HTMLSpanElement>(null);

  // Giảm chuyển động: không bay, chỉ bày ảnh dạng lưới
  if (reduce) {
    return (
      <section data-scene="6" className="px-5 py-24 md:px-10" style={{ background: GALLERY_BG, color: CREAM }}>
        <h2 className="text-4xl font-medium uppercase tracking-[-0.02em] md:text-6xl">Bước vào những không gian</h2>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {GALLERY.map((g) => (
            <figure key={g.src}>
              <img src={g.src} alt={g.label} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <figcaption className="mt-2 text-xs uppercase tracking-wide opacity-70">{g.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section data-c="gal" data-scene="6" className="relative h-svh overflow-hidden" style={{ background: GALLERY_BG, color: CREAM }}>
      <Suspense fallback={null}>
        <GalleryFlythrough items={GALLERY} captionRef={caption} />
      </Suspense>

      {/* Tựa cảnh: hiện khi cảnh cuộn vào, tan đi khi camera bắt đầu bay */}
      <div data-c="gal-intro" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
        <p className="overflow-hidden text-xs uppercase tracking-[0.3em]" style={{ fontFamily: MONO, color: P.neon }}>
          <span data-c="gal-line" className="block">
            Không gian sống
          </span>
        </p>
        <h2 className="mt-6 text-[12vw] font-medium uppercase leading-[0.95] tracking-[-0.045em] md:text-[7vw]">
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-c="gal-line" className="block">
              Bước vào
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-c="gal-line" className="block font-light" style={{ color: P.neon }}>
              những không gian
            </span>
          </span>
        </h2>
      </div>

      {/* Chú thích tấm ảnh đang lướt qua */}
      <p data-c="gal-cap" className="pointer-events-none absolute bottom-[12vh] left-5 text-xs uppercase tracking-[0.2em] md:left-10" style={{ fontFamily: MONO }}>
        <span style={{ color: P.neon }}>Đang đi qua — </span>
        <span ref={caption} />
      </p>

      {/* Hoà sang nền của cảnh kế tiếp khi camera đã chạm tấm ảnh cuối */}
      <div data-c="gal-fade" className="pointer-events-none absolute inset-0 opacity-0" style={{ background: P.card }} aria-hidden />
    </section>
  );
}

/* ---------- Cảnh 8: Câu chuyện kiến trúc (nhiều lớp chiều sâu) ---------- */
function StoryScene() {
  return (
    <section data-c="story" data-scene="7"className="cine-story relative" style={{ background: P.card }}>
      <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-5 py-28 md:px-10 md:py-40 lg:grid-cols-2">
        <div className="relative">
          <span data-c="st-gold" className="absolute -bottom-6 -left-6 z-10 h-24 w-24" style={{ background: P.green }} aria-hidden />
          <span data-c="st-bar" className="absolute -top-4 left-0 z-10 h-2 w-1/3" style={{ background: P.black }} aria-hidden />
          <div className="relative aspect-[4/5] overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 84% 50%, 100% 100%, 0 100%)" }}>
            <img data-c="st-img" src={STORY.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full scale-125 object-cover" />
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-medium uppercase leading-[1.05] tracking-[-0.02em] md:text-6xl">
            {STORY.lines.map((l, i) => (
              <span key={l} data-c="st-line" className="block" style={{ color: i === 2 ? P.green : P.black }}>
                {l}
              </span>
            ))}
          </h2>
          <p data-c="st-fade" className="mt-6 max-w-lg text-base leading-relaxed" style={{ color: P.muted }}>
            {STORY.desc}
          </p>
          <ul className="mt-8 space-y-3 border-t-2 pt-6" style={{ borderColor: P.green }}>
            {STORY.points.map((pt) => (
              <li key={pt} data-c="st-fade" className="flex items-start gap-3 text-sm">
                <span style={{ color: P.green }}>✦</span> {pt}
              </li>
            ))}
          </ul>
          <dl className="mt-10 grid grid-cols-3 gap-4">
            {STORY.stats.map((s) => (
              <div key={s.label}>
                <dd className="text-4xl font-light tabular-nums tracking-tight" style={{ fontFamily: MONO }}>
                  <span data-c="st-count" data-value={s.value}>
                    {s.value}
                  </span>
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

/* ---------- Cảnh 10: Cảm nhận (thẻ chồng theo chiều sâu) ---------- */
function VoicesScene() {
  return (
      <section data-c="voice" data-scene="10"className="cine-voice relative px-5 py-24 md:px-10" style={{ background: P.blush }}>
        <div className="cine-voice-head">
          <p className="text-xs uppercase tracking-[0.2em]" style={{ fontFamily: MONO, color: P.green }}>
            Cảm nhận
          </p>
          <h2 className="mt-4 text-4xl font-medium uppercase leading-[1.05] tracking-[-0.02em] md:text-6xl">Khách hàng nói gì</h2>
        </div>
        <div className="cine-voice-stage mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <figure key={t.name} data-c="voice-card" className="cine-voice-card p-8 md:p-12" style={{ background: P.bg, boxShadow: "0 40px 80px -40px rgba(16,16,16,0.35)" }}>
              <span className="text-xs tabular-nums" style={{ fontFamily: MONO, color: P.green }}>
                {String(i + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}
              </span>
              <blockquote className="mt-4 text-xl font-light leading-snug tracking-tight md:text-3xl">“{t.quote}”</blockquote>
              <figcaption className="mt-8 flex items-center gap-3 text-sm">
                <span className="h-0.5 w-10" style={{ background: P.green }} />
                <span className="font-medium uppercase">{t.name}</span>
                <span style={{ color: P.muted }}>· {t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
    </section>
  );
}

/* ---------- Cảnh 11: Kết — chữ tách đôi, ngôi nhà về đêm hiện ra ---------- */
function FinaleScene() {
  return (
    <section data-c="fin" data-scene="11"className="cine-fin relative px-5 py-24 md:px-10" style={{ background: CREAM }}>
      <div data-c="fin-lines" className="cine-fin-lines text-center text-[11vw] font-semibold uppercase leading-[1.05] tracking-[-0.03em] md:text-[7vw]">
        <span data-c="fin-l1" className="block">
          Nhà của bạn,
        </span>
        <span data-c="fin-l2" className="block" style={{ color: P.green }}>
          số hoá trọn vẹn.
        </span>
      </div>
      <div data-c="fin-frame" className="cine-fin-frame relative mx-auto mt-12 aspect-[16/9] max-w-4xl overflow-hidden" style={{ background: P.black }}>
        <img data-c="fin-img" src={DAY_IN_LIFE[5].image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div data-c="fin-shade" className="absolute inset-0 bg-black/40" aria-hidden />
      </div>
      <p data-c="fin-welcome" className="cine-fin-welcome mt-10 text-center text-4xl font-light uppercase tracking-[-0.02em] text-[#faf5f0] md:text-7xl">
        <span>
          Chào mừng <span style={{ color: P.neon }}>về nhà.</span>
        </span>
      </p>
    </section>
  );
}

/* ---------- Trang ---------- */
export default function HomePage() {
  useUrbanFonts();
  useSeo({
    title: "Hubtech",
    description: "Nền tảng bất động sản số: dự án, quỹ căn, sự kiện, tin tức và cơ hội nghề nghiệp.",
    canonical: `${window.location.origin}/`,
  });
  const root = useRef<HTMLDivElement>(null);
  useCinematic(root);

  return (
    <div ref={root} className="min-h-svh overflow-x-clip" style={{ background: CREAM, color: P.black, fontFamily: FONT }}>
      <HavenHeader home="/" font={FONT} onDark />

      <HeroScene />
      <AdvantagesScene />
      <ManifestoScene />
      <BlueprintScene />
      <ProjectsScene />
      <GalleryScene />
      <StoryScene />

      {/* Cảnh 9: Tiện ích — dùng lại khối trang chủ, các ô bay vào ráp lưới */}
      <div data-c="amen" data-scene="8">
        <Amenities />
      </div>

      {/* Cảnh 10: Hành trình mua nhà — dùng lại khối ghim có sẵn của trang chủ */}
      <section data-c="journey" data-scene="9" className="pt-24 md:pt-32">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <Heading>Từ màn hình đến chìa khóa</Heading>
        </div>
        <ScrollJourney />
      </section>

      <VoicesScene />
      <FinaleScene />
      <SkylineFooter />

      <ProgressBar />
      <Chatbot variant="urban" />
    </div>
  );
}
