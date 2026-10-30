import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SERVICES } from "../../components/Home/homeData";
import { Heading, MONO, P } from "../../components/Home/urbanUi";

/* "Mọi thứ trong một nền tảng" dạng BẢN VẼ MẶT BẰNG căn hộ:
   6 phòng = 6 dịch vụ (tường, cửa mở cung tròn, cửa sổ, nội thất nét mảnh) — mang tính tượng trưng, không ghi thông số.
   Rê chuột / bấm vào phòng nào thì phòng đó tô xanh nhạt; khung bên phải hiện chi tiết. */

type Room = { x: number; y: number; w: number; h: number; name: string };

// Mặt bằng 1000×640, thứ tự trùng SERVICES
const ROOMS: Room[] = [
  { x: 0, y: 0, w: 420, h: 360, name: "Phòng khách" },
  { x: 420, y: 0, w: 280, h: 360, name: "Phòng làm việc" },
  { x: 700, y: 0, w: 300, h: 220, name: "Thư phòng" },
  { x: 700, y: 220, w: 300, h: 420, name: "Thư viện" },
  { x: 0, y: 360, w: 300, h: 280, name: "Phòng ăn" },
  { x: 300, y: 360, w: 400, h: 280, name: "Sảnh & ban công" },
];

// Tường trong (chừa khe cửa)
const WALLS = [
  "M420 0 V260 M420 320 V360",
  "M700 0 V440 M700 500 V640",
  "M0 360 H180 M240 360 H500 M560 360 H700",
  "M700 220 H880 M940 220 H1000",
  "M300 360 V520 M300 580 V640",
];

// Cánh cửa + cung mở
const DOORS = [
  "M420 260 L480 260 A60 60 0 0 1 420 320",
  "M700 440 L760 440 A60 60 0 0 1 700 500",
  "M180 360 L180 420 A60 60 0 0 0 240 360",
  "M500 360 L500 420 A60 60 0 0 0 560 360",
  "M880 220 L880 280 A60 60 0 0 0 940 220",
  "M300 520 L360 520 A60 60 0 0 1 300 580",
  "M600 640 L600 580 A60 60 0 0 1 660 640", // lối vào chính
];

// Cửa sổ trên tường bao [x1, y1, x2, y2]
const WINDOWS = [
  [110, 0, 310, 0],
  [500, 0, 640, 0],
  [780, 0, 940, 0],
  [0, 440, 0, 580],
  [1000, 320, 1000, 520],
];

// Nội thất nét mảnh cho từng phòng
function Furniture() {
  return (
    <g fill="none" stroke={P.black} strokeOpacity="0.28" strokeWidth="1.5">
      {/* Phòng khách: sofa chữ L + bàn trà + thảm */}
      <rect x="170" y="240" width="210" height="60" rx="8" />
      <path d="M170 258 H380" />
      <rect x="320" y="150" width="60" height="90" rx="8" />
      <rect x="200" y="160" width="100" height="56" rx="6" strokeDasharray="4 5" />
      {/* Phòng làm việc: bàn + ghế + kệ */}
      <rect x="545" y="250" width="125" height="55" rx="4" />
      <circle cx="607" cy="325" r="16" />
      <rect x="655" y="140" width="35" height="90" />
      {/* Thư phòng: bàn đơn + ghế */}
      <rect x="920" y="20" width="62" height="60" rx="4" />
      <circle cx="951" cy="100" r="14" />
      {/* Thư viện: 2 kệ sách dọc tường + ghế đọc */}
      <rect x="950" y="300" width="34" height="140" />
      <rect x="950" y="460" width="34" height="140" />
      <path d="M950 330 H984 M950 360 H984 M950 390 H984 M950 490 H984 M950 520 H984 M950 550 H984" />
      <circle cx="860" cy="540" r="34" />
      <circle cx="860" cy="540" r="18" />
      {/* Phòng ăn: bàn + 4 ghế */}
      <rect x="80" y="532" width="150" height="58" rx="8" />
      <circle cx="115" cy="520" r="10" />
      <circle cx="195" cy="520" r="10" />
      <circle cx="115" cy="604" r="10" />
      <circle cx="195" cy="604" r="10" />
      {/* Sảnh & ban công: chậu cây + ghế dài */}
      <circle cx="430" cy="570" r="24" />
      <circle cx="430" cy="570" r="10" />
      <circle cx="485" cy="595" r="14" />
      <rect x="520" y="500" width="150" height="34" rx="6" />
    </g>
  );
}

// Tách tên dài thành 2 dòng
function lines(title: string) {
  const words = title.split(" ");
  if (words.length < 3) return [title];
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
}

export default function ServicesFloorPlan() {
  const [active, setActive] = useState(0);
  const s = SERVICES[active];

  return (
    <section id="dich-vu" className="relative mx-auto max-w-[1440px] scroll-mt-24 px-5 pb-24 pt-16 md:px-10 md:pb-32 md:pt-24">
      <Heading>Mọi thứ trong một nền tảng</Heading>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-stretch">
        {/* Bản vẽ mặt bằng */}
        <svg viewBox="-10 -10 1020 660" className="h-auto w-full" role="img" aria-label="Mặt bằng 6 dịch vụ">

          {/* Các phòng (vùng rê chuột) */}
          {ROOMS.map((r, i) => {
            const on = i === active;
            const t = lines(SERVICES[i].title);
            return (
              <g
                key={r.name}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                tabIndex={0}
                className="cursor-pointer outline-none"
              >
                <rect
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  className="transition-[fill] duration-500"
                  style={{ fill: on ? P.mint : P.bg }}
                />
                <text
                  x={r.x + 32}
                  y={r.y + 56}
                  className="pointer-events-none select-none uppercase transition-[fill] duration-500"
                  style={{ fontSize: 28, fontWeight: 600, letterSpacing: "0", fill: on ? P.green : P.black }}
                >
                  <tspan style={{ fontSize: 15, fontWeight: 500 }}>{SERVICES[i].no} </tspan>
                  {t.map((l, k) => (
                    <tspan key={k} x={r.x + 32} dy={k === 0 ? 40 : 40}>
                      {l}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}

          <g className="pointer-events-none">
            <Furniture />

            {/* Tường trong + cửa */}
            <path d={WALLS.join(" ")} stroke={P.black} strokeWidth="7" fill="none" />
            <path d={DOORS.join(" ")} stroke={P.black} strokeWidth="1.5" fill="none" />

            {/* Tường bao (chừa lối vào) */}
            <path d="M600 640 H0 V0 H1000 V640 H660" stroke={P.black} strokeWidth="14" fill="none" strokeLinejoin="miter" />
            {/* Cửa sổ: cắt tường bao + 2 nét mảnh */}
            {WINDOWS.map(([x1, y1, x2, y2], i) => {
              const v = x1 === x2;
              return (
                <g key={i}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={P.bg} strokeWidth="12" />
                  <line x1={v ? x1 - 4 : x1} y1={v ? y1 : y1 - 4} x2={v ? x2 - 4 : x2} y2={v ? y2 : y2 - 4} stroke={P.black} strokeWidth="1.5" />
                  <line x1={v ? x1 + 4 : x1} y1={v ? y1 : y1 + 4} x2={v ? x2 + 4 : x2} y2={v ? y2 : y2 + 4} stroke={P.black} strokeWidth="1.5" />
                </g>
              );
            })}

          </g>
        </svg>

        {/* Khung thông tin kiểu "title block" của bản vẽ */}
        <aside className="flex flex-col border-2 text-sm" style={{ borderColor: P.black }}>
          <div key={active} className="flex-1 animate-rise-in p-5">
            <p className="text-5xl font-light tabular-nums" style={{ color: P.green }}>
              {s.no}
            </p>
            <h3 className="mt-2 text-2xl font-semibold uppercase leading-tight tracking-tight">{s.title}</h3>
            <p className="mt-3 leading-relaxed" style={{ color: P.muted }}>
              {s.desc}
            </p>
          </div>

          <Link
            to={s.path}
            className="group flex items-center justify-between border-t-2 px-5 py-4 font-medium uppercase tracking-wide transition-colors hover:bg-[#fcf1cc] hover:text-[#a67d12]"
            style={{ borderColor: P.black }}
          >
            Mở {s.title}
            <ArrowUpRight size={18} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>

          {/* Danh mục phòng (bấm nhanh) */}
          <ol className="grid grid-cols-3 border-t-2 text-[11px]" style={{ borderColor: P.black, fontFamily: MONO }}>
            {SERVICES.map((sv, i) => (
              <li key={sv.no} className={`${i % 3 ? "border-l" : ""} ${i > 2 ? "border-t" : ""}`} style={{ borderColor: P.black }}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="w-full py-2.5 transition-colors"
                  style={{ background: i === active ? P.green : "transparent", color: i === active ? P.bg : P.black }}
                >
                  {sv.no}
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}
