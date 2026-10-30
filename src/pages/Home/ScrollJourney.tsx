import { useEffect, useRef, useState } from "react";
import { Building2, CalendarCheck, Compass, KeyRound, LayoutGrid } from "lucide-react";
import { DAY_IN_LIFE } from "../../components/Home/homeContent";
import { P } from "../../components/Home/urbanUi";

export const ADVANTAGES = [
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
export function ScrollJourney() {
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
      // Màn hẹp: chặng đang xem nằm giữa khung (chữ lớn gần bằng bề ngang, đặt lệch trái sẽ bị cắt); màn rộng: ở 40%
      setShift(view.clientWidth * (view.clientWidth < 768 ? 0.5 : 0.4) - c);
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
                  className="whitespace-nowrap text-[12vw] font-semibold uppercase leading-none tracking-[-0.04em] transition-colors duration-500 md:text-[10vw]"
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
                <Icon size={34} strokeWidth={1.5} className="text-[#fcf1cc]" />
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
