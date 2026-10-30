import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Building2, CalendarCheck, Compass, KeyRound, LayoutGrid, Mail, MapPin, Phone } from "lucide-react";
import { useSeo } from "../../hooks/useSeo";
import HavenHeader from "./urban/HavenHeader";
import { PROJECTS, SERVICES, STATS } from "../../components/Home/homeData";
import { DAY_IN_LIFE, TESTIMONIALS } from "../../components/Home/homeContent";
import { Block, CUT, EdgeTag, FONT, Heading, P, PaintImage, paintText, useUrbanFonts } from "./urban/urbanUi";
import SkylineFooter from "./urban/SkylineFooter";
import UrbanChatbot from "./urban/UrbanChatbot";
import "./urban/chatbot.css";
import "./urban/background.css";
import FlowBackground from "./urban/FlowBackground";
import ServicesGrid from "./urban/ServicesGrid";
import UrbanHero from "./urban/UrbanHero";
import { Amenities, DayInLife, ManifestoBand, StorySplit } from "./urban/urbanSections";

/* Trang chủ nháp (/home-draft-3): bố cục trang chủ "Spaces Urbanistic" (Hubtech) trước khi đổi sang kể chuyện theo cuộn.
   Nền giống home-draft-3 (kem #f6f1e7 có quầng vàng / xanh xám nhạt + lượn sóng dọc trang, thẻ #efe6d6 / #e6dccb), chữ đen #101010, nhấn xanh lá tươi (#146b43, nhạt #d5f5e0),
   font grotesk Inter Tight, tiêu đề IN HOA lớn, lộ trình chữ khổng lồ, đường kẻ đen mảnh. Bảng màu ở urban/urbanUi.tsx. */

const ADVANTAGES = [
  { word: "Minh bạch", desc: "Pháp lý, giá và tiến độ của mọi dự án được công khai và kiểm chứng.", image: DAY_IN_LIFE[0].image },
  { word: "Trực quan", desc: "Tour 360°, mặt bằng tương tác và bảng hàng thời gian thực trên một màn hình.", image: DAY_IN_LIFE[1].image },
  { word: "Kết nối", desc: "Môi giới, nhà đầu tư và người mua gặp nhau trong một cộng đồng chung.", image: DAY_IN_LIFE[2].image },
  { word: "Hiện đại", desc: "Trợ lý AI trả lời 24/7 và giữ chỗ trực tuyến chỉ trong vài phút.", image: DAY_IN_LIFE[4].image },
];

// Lộ trình chạy theo cuộn: các chặng hành trình mua nhà (chữ lớn thay cho số năm) + chi tiết bên dưới
const JOURNEY = [
  {
    word: "Khám phá",
    icon: Compass,
    title: "Tìm đúng nơi để sống",
    desc: "Bắt đầu từ nhịp sống của bạn: nơi làm việc, trường học, thói quen cuối tuần. Bộ lọc theo khu vực, ngân sách và loại hình giúp thu hẹp hàng trăm dự án xuống vài lựa chọn thật sự phù hợp — kèm gợi ý từ chuyên viên.",
    tags: ["Khu vực", "Ngân sách", "Phong cách sống"],
  },
  {
    word: "Trải nghiệm",
    icon: Building2,
    title: "Xem nhà như đang ở đó",
    desc: "Tham quan 360° từng căn, xem view thật từ ban công, đọc hồ sơ pháp lý và tiến độ ngay trên màn hình. Bạn chỉ cần đến dự án khi đã chắc chắn mình thích.",
    tags: ["Tour 360°", "Pháp lý", "Tiến độ"],
  },
  {
    word: "Chọn căn",
    icon: LayoutGrid,
    title: "So sánh trên mặt bằng",
    desc: "Bảng hàng thời gian thực theo tòa, tầng, trục và hướng. So sánh giá, diện tích, chiết khấu của nhiều căn cùng lúc để chọn được căn đẹp nhất trong ngân sách.",
    tags: ["Bảng hàng", "So sánh căn", "Chiết khấu"],
  },
  {
    word: "Giữ chỗ",
    icon: CalendarCheck,
    title: "Khóa căn trong vài phút",
    desc: "Giữ chỗ trực tuyến, nhận xác nhận ngay trên điện thoại. Chuyên viên dự án liên hệ trong 15 phút để hướng dẫn các bước tiếp theo và chính sách thanh toán.",
    tags: ["Trực tuyến", "15 phút", "Xác nhận ngay"],
  },
  {
    word: "Nhận nhà",
    icon: KeyRound,
    title: "Đồng hành đến ngày bàn giao",
    desc: "Ký hợp đồng, theo dõi tiến độ xây dựng qua từng đợt cập nhật hình ảnh và nhận bàn giao căn hộ — một chuyên viên riêng theo bạn suốt chặng đường.",
    tags: ["Hợp đồng", "Tiến độ", "Bàn giao"],
  },
];

// Cuộn trang qua khối cao nhiều màn hình: khung bên trong dính (sticky), dãy chữ lớn trượt ngang theo tiến độ cuộn,
// ngôi sao chạy dọc đường kẻ trên, chặng ở giữa tô đặc (các chặng khác chỉ viền), nội dung chi tiết đổi theo
function ScrollJourney() {
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
      // Tâm của chặng hiện tại nội suy giữa 2 chặng liền kề → dãy chữ trượt mượt, chặng đang xem nằm ở 1/3 khung
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
    <div ref={wrapRef} id="lo-trinh" className="relative" style={{ height: `${n * 70 + 60}vh` }}>
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
          <p className="text-xs uppercase tracking-wide" style={{ color: P.muted }}>
            Hành trình mua nhà · {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </p>

          {/* Đường kẻ trên + ngôi sao chạy theo tiến độ cuộn */}
          <div className="relative mt-6 h-px" style={{ background: P.green }}>
            <svg
              viewBox="0 0 40 40"
              className="absolute top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${progress * 100}%` }}
              aria-hidden
            >
              <path d="M20 0 C21 15 25 19 40 20 C25 21 21 25 20 40 C19 25 15 21 0 20 C15 19 19 15 20 0 Z" fill={P.green} />
            </svg>
          </div>

          {/* Dãy chữ lớn trượt ngang */}
          <div ref={viewRef} className="relative overflow-hidden py-8 md:py-12">
            <div ref={trackRef} className="flex w-max items-center gap-[8vw] will-change-transform" style={{ transform: `translate3d(${shift}px,0,0)` }}>
              {JOURNEY.map((j, i) => (
                <span
                  key={j.word}
                  className="whitespace-nowrap text-[18vw] font-semibold uppercase leading-none tracking-[-0.04em] transition-colors duration-500 md:text-[10vw]"
                  // Chặng chưa xem: chữ đặc màu nhạt (không dùng viền chữ — font tiếng Việt ghép nét chồng nhau nên viền bị lộ đường nối)
                  style={{ color: i === active ? P.black : P.lilac }}
                >
                  {j.word}
                </span>
              ))}
            </div>
          </div>

          <div className="h-px" style={{ background: P.black }} />

          {/* Chi tiết chặng đang xem */}
          <div key={step.word} className="animate-rise-in mt-10 grid gap-8 md:grid-cols-[1fr_2fr]">
            <div>
              <span className="flex h-20 w-20 items-center justify-center" style={{ background: P.green }}>
                <Icon size={34} strokeWidth={1.5} className="text-[#d5f5e0]" />
              </span>
              <h3 className="mt-5 max-w-[14ch] text-xl font-semibold uppercase leading-tight tracking-tight md:text-2xl">{step.title}</h3>
            </div>
            <div>
              <p className="max-w-3xl text-base leading-relaxed md:text-lg">{step.desc}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {step.tags.map((t) => (
                  <span key={t} className="flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm" style={{ borderColor: P.green }}>
                    <span aria-hidden style={{ color: P.green }}>✦</span> {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UrbanDraftPage() {
  useUrbanFonts();
  useSeo({
    title: "Hubtech",
    description: "Nền tảng bất động sản số: dự án, quỹ căn, sự kiện, tin tức và cơ hội nghề nghiệp.",
    canonical: `${window.location.origin}/`,
  });

  const [quote, setQuote] = useState(0);
  const [quoteHold, setQuoteHold] = useState(false);

  // Cảm nhận khách hàng tự chuyển mỗi 6s; rê chuột vào thì dừng. Đổi quote (kể cả bấm tay) thì đếm lại từ đầu
  useEffect(() => {
    if (quoteHold) return;
    const t = setTimeout(() => setQuote((q) => (q + 1) % TESTIMONIALS.length), 6000);
    return () => clearTimeout(t);
  }, [quote, quoteHold]);

  return (
    <div className="hd-page-bg relative min-h-svh overflow-x-clip" style={{ color: P.black, fontFamily: FONT }}>
      <FlowBackground />
      <HavenHeader home="/" font={FONT} onDark />

      <UrbanHero />

      <section className="mx-auto max-w-[1440px] px-5 md:px-10">
        {/* Số liệu */}
        <dl className="grid grid-cols-2 border-b md:grid-cols-4" style={{ borderColor: P.black }}>
          {STATS.map((s) => (
            <div key={s.label} className="border-l py-8 pl-5 first:border-l-0 first:pl-0 md:pl-8" style={{ borderColor: P.lilac }}>
              <span className="mb-4 block h-[3px] w-8" style={{ background: P.green }} aria-hidden />
              <dd className="text-4xl font-light tracking-tight md:text-5xl">
                {s.value.toLocaleString("vi-VN")}
                {s.suffix}
              </dd>
              <dt className="mt-2 text-xs uppercase tracking-wide" style={{ color: P.muted }}>
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      {/* ================= 4 thẻ ưu điểm nền vàng ================= */}
      <section id="gioi-thieu" className="mx-auto grid max-w-[1440px] scroll-mt-24 gap-4 px-5 py-24 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
        {ADVANTAGES.map((a) => (
          <article key={a.word} className="hd-gloss group relative flex flex-col overflow-hidden p-5 transition hover:-translate-y-1">
            <Block className="left-0 top-0 h-1.5 w-12 transition-all duration-500 group-hover:w-full" />
            <div className="flex items-center gap-4">
              <img src={a.image} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover grayscale transition duration-500 group-hover:grayscale-0" />
              <h3 className="text-xl font-medium uppercase tracking-tight">{a.word}</h3>
            </div>
            <p className="mt-5 text-sm leading-relaxed" style={{ color: P.muted }}>
              {a.desc}
            </p>
          </article>
        ))}
      </section>

      {/* ================= Tuyên ngôn thương hiệu ================= */}
      <ManifestoBand />

      {/* ================= Dịch vụ: lưới 6 thẻ kính bóng ================= */}
      <ServicesGrid />

      {/* ================= Dự án tiêu biểu (kiểu "activity" của mẫu) ================= */}
      <section id="du-an" className="relative z-[1] scroll-mt-24 py-24 md:py-32">
        <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
          <Heading
            aside={
              <Link to="/projects" className="group flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                Tất cả dự án <ArrowRight size={15} className="transition group-hover:translate-x-1" />
              </Link>
            }
          >
            Dự án tiêu biểu
          </Heading>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {PROJECTS.map((p, i) => (
              <Link key={p.code} to="/projects" className="group block">
                <div className="relative">
                  <div className="overflow-hidden rounded-3xl shadow-[0_24px_60px_-30px_rgba(90,60,20,0.45)]">
                    <PaintImage src={p.image} alt={p.name} className="aspect-[4/5]" />
                  </div>
                                    <EdgeTag>Dự án {p.code}</EdgeTag>
                </div>
                <p className="mt-5 text-xs uppercase tracking-wide" style={{ color: P.muted }}>
                  {p.category}
                </p>
                <h3 className={`mt-2 flex items-center justify-between text-2xl font-medium uppercase tracking-tight ${paintText}`}>
                  {p.name} <ArrowUpRight size={20} strokeWidth={1.5} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: P.muted }}>
                  {p.desc}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-xs">
                  <MapPin size={13} /> {p.location}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Một ngày ở đây · Câu chuyện kiến trúc · Tiện ích ================= */}
      <DayInLife />
      <StorySplit />
      <Amenities />

      {/* ================= Hành trình mua nhà: lộ trình chạy theo cuộn trang ================= */}
      <section className="pt-24 md:pt-32">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <Heading>Từ màn hình đến chìa khóa</Heading>
        </div>
        <ScrollJourney />
      </section>

      {/* ================= Cảm nhận khách hàng ================= */}
      <section
        className="relative z-[1] py-24 md:py-32"
        onMouseEnter={() => setQuoteHold(true)}
        onMouseLeave={() => setQuoteHold(false)}
      >
        <Block className="right-0 top-0 h-full w-2" />
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 md:grid-cols-[1fr_2fr] md:px-10">
          <div>
            <h2 className="text-4xl font-medium uppercase leading-[1.05] tracking-[-0.02em] md:text-5xl">Khách hàng nói gì</h2>
            {/* Điều hướng: vạch chọn (vùng bấm cao) + nút trước / sau + số thứ tự */}
            <div className="mt-8 flex gap-2">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setQuote(i)}
                  aria-label={`Cảm nhận ${i + 1}`}
                  aria-current={i === quote}
                  className="group relative z-10 cursor-pointer py-3"
                >
                  <span className="relative block h-1 w-10 overflow-hidden transition-colors group-hover:bg-[#146b43]/40" style={{ background: "rgba(16,16,16,0.2)" }}>
                    {/* Vạch đang xem chạy đầy theo thời gian tự chuyển (dừng thì đầy sẵn) */}
                    {i === quote && (
                      <span
                        key={`${quote}-${quoteHold}`}
                        className={`absolute inset-0 origin-left ${quoteHold ? "" : "animate-[grow_6s_linear]"}`}
                        style={{ background: P.green }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative z-10 mt-4 flex items-center gap-3">
              {(
                [
                  [-1, ArrowRight, "Cảm nhận trước", "rotate-180"],
                  [1, ArrowRight, "Cảm nhận sau", ""],
                ] as const
              ).map(([step, Icon, label, cls]) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setQuote((q) => (q + step + TESTIMONIALS.length) % TESTIMONIALS.length)}
                  aria-label={label}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border transition-colors hover:border-[#146b43] hover:bg-[#146b43] hover:text-[#f6f1e7]"
                  style={{ borderColor: P.black }}
                >
                  <Icon size={16} className={cls} />
                </button>
              ))}
              <span className="ml-2 text-sm tabular-nums" style={{ color: P.muted }}>
                {String(quote + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}
              </span>
            </div>
          </div>
          <figure key={quote} className="hd-gloss animate-rise-in p-8 md:p-10">
            <blockquote className="text-2xl font-light leading-snug tracking-tight md:text-4xl">“{TESTIMONIALS[quote].quote}”</blockquote>
            <figcaption className="mt-8 flex items-center gap-3 text-sm">
              <span className="h-0.5 w-10" style={{ background: P.green }} />
              <span className="font-medium uppercase">{TESTIMONIALS[quote].name}</span>
              <span style={{ color: P.muted }}>· {TESTIMONIALS[quote].role}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ================= Chân trang: đường chân trời Sài Gòn ================= */}
      <SkylineFooter />
      <UrbanChatbot />
    </div>
  );
}