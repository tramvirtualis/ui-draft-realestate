import { memo, useEffect, useRef } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { Hand } from "lucide-react";
const PLOT = 420; // cạnh khu đất (px)
const SLAB_H = 24; // độ dày đế khu đất (thấy khi xoay nhìn từ dưới lên)
const BASE_ANGLE = -42; // góc xoay ngang ban đầu (độ)
const PITCH = 58; // góc nhìn dọc ban đầu: 0 = từ trên xuống, 90 = ngang tầm mắt, 180 = từ dưới lên
const WHEEL_SPEED = 0.3; // độ xoay / 1px lăn chuột → 1 nấc (~100px) ≈ 30°
const DRAG_SPEED = 0.4; // độ xoay ngang / 1px kéo chuột
const PITCH_SPEED = 0.3; // độ xoay dọc / 1px kéo chuột
const AUTO_SPEED = 10; // tốc độ tự quay sau khi lắp xong (độ / giây)
const AUTO_RESUME = 4000; // người dùng ngừng kéo/lăn bao lâu thì tự quay lại (ms)

// Thời điểm lắp ráp từng phần (ms tính từ lúc vào trang)
const T_BASE = 0; // đế + mặt đất bật lên
const T_ROAD = 650; // trải đường
const T_BUILD = 900; // tòa nhà đầu tiên rơi xuống
const BUILD_GAP = 130; // các tòa rơi cách nhau
const T_WALL = 2000; // tường bắt đầu mọc lên
const WALL_GAP = 70; // các đoạn tường cách nhau
const T_GATE = 2700; // trụ cổng mọc lên
const T_CAP = 3050; // mũ trụ cổng rơi xuống
const T_BEAM = 3250; // xà ngang cổng rơi xuống
const T_LIGHT = 3900; // bật đèn
const T_CAR = 4200; // xe bắt đầu chạy
const T_DONE = 4400; // lắp xong → bắt đầu tự quay, cho phép kéo / lăn chuột

// Tường gạch
const WALL_IN = 20; // tâm tường cách mép khu đất
const WALL_H = 20;
const WALL_T = 6; // độ dày
const PILLAR = 12; // trụ góc
const PILLAR_H = 28;

// Cổng
const GATE_W = 76; // độ rộng lối vào
const GATE_PILLAR = 20; // cạnh trụ cổng
const GATE_H = 62; // chiều cao trụ cổng (chưa tính mũ trụ)

// Đường nội khu + xe
const ROAD_W = 44;
const ROAD_TOP = 222; // đường chạy từ mép khu đất tới sảnh tòa chính
const CAR_W = 14;
const CAR_L = 30;
const CAR_X = PLOT / 2 + ROAD_W / 4 - CAR_W / 2; // chạy làn bên phải
const CAR_START = PLOT - CAR_L - 2; // xuất hiện ngay cổng
const CAR_END = ROAD_TOP + 6; // dừng ngay trước sảnh tòa chính

// Màu gạch: [mạch vữa, gạch 1, gạch 2, gạch 3, gạch 4]
// Tông vàng đồng theo màu nhấn của site
const BRICK_COLORS = ["#fcf1cc", "#e0b23a", "#c9991f", "#8c6610", "#f2cd5f"];

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const svgUrl = (svg: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

// Chuỗi animation cho từng kiểu lắp ráp (keyframes nằm trong index.css)
const drop = (delay: number) => `piece-drop 850ms ${delay}ms both`;
const rise = (delay: number) =>
  `piece-rise 550ms cubic-bezier(0.2, 0.9, 0.3, 1.25) ${delay}ms both`;
const pop = (delay: number) =>
  `piece-pop 700ms cubic-bezier(0.2, 0.9, 0.3, 1.2) ${delay}ms both`;
const lightOn = (delay: number) => `light-on 700ms ${delay}ms both`;

/* ======================= Vật liệu ======================= */
// Lưới cửa sổ: cột dọc + vạch sàn ngang (vạch sàn nâu ấm, hợp thân trắng kem)
const windowGrid = (lit: string) =>
  `repeating-linear-gradient(90deg, transparent 0 6px, ${lit} 6px 12px, transparent 12px 18px),
   repeating-linear-gradient(0deg, transparent 0 8px, rgba(74,54,10,0.16) 8px 10px)`;

// 1 ô gạch 28×10: 2 hàng gạch xếp so le, mạch vữa 1px
const [MORTAR, B1, B2, B3, B4] = BRICK_COLORS;
const BRICK = `${svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='28' height='10'>
<rect width='28' height='10' fill='${MORTAR}'/>
<rect x='0' y='0' width='13' height='4' fill='${B1}'/>
<rect x='14' y='0' width='13' height='4' fill='${B2}'/>
<rect x='-7' y='5' width='13' height='4' fill='${B3}'/>
<rect x='7' y='5' width='13' height='4' fill='${B4}'/>
<rect x='21' y='5' width='13' height='4' fill='${B3}'/>
</svg>`)} left bottom / 28px 10px`;

// Mặt đất phía trên (lưới + quầng sáng giữa)
const GROUND =
  "linear-gradient(rgba(248,226,153,0.12) 1px, transparent 1px) 0 0/30px 30px, linear-gradient(90deg, rgba(248,226,153,0.12) 1px, transparent 1px) 0 0/30px 30px, radial-gradient(circle at 50% 50%, #2a241b, #15120e 70%)";

// Mặt dưới đế (thấy khi lật xem từ dưới lên)
const SLAB_BOTTOM = `${svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'>
<text x='210' y='220' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-size='30' font-weight='700' letter-spacing='4' fill='rgba(248,226,153,0.45)'>Đất Việt Group</text>
</svg>`)} center / 100% 100% no-repeat,
  linear-gradient(rgba(248,226,153,0.08) 1px, transparent 1px) 0 0 / 30px 30px,
  linear-gradient(90deg, rgba(248,226,153,0.08) 1px, transparent 1px) 0 0 / 30px 30px,
  radial-gradient(circle, #2a241b, #0d0b09 70%)`;

interface Skin {
  side: string; // nền 4 mặt bên
  top?: string; // nền nóc (bỏ trống = không có nóc)
  bottom?: string; // nền mặt đáy (chỉ đế khu đất cần)
  emissive?: boolean; // tự phát sáng: không bị tối đi khi xoay
  glow?: string; // quầng sáng (box-shadow)
  noShadow?: boolean; // không đổ bóng xuống đất
}

// Tòa nhà vàng làm chủ đạo (hợp nền đen ánh vàng của trang): thân vàng kim, dải cửa sổ trắng kem, nóc trắng kem
const SKINS = {
  tower: {
    side: `${windowGrid(
      "rgba(255,250,236,0.4)",
    )}, linear-gradient(to top, #8c6610, #d4a020)`,
    top: "linear-gradient(135deg, #ffffff, #f3e6c4)",
  },
  accent: {
    side: `${windowGrid(
      "rgba(255,255,255,0.65)",
    )}, linear-gradient(to top, #a67d12, #f2cd5f)`,
    top: "linear-gradient(135deg, #ffffff, #fbf3dc)",
  },
  brick: { side: BRICK, top: "linear-gradient(135deg, #f8fafc, #cbd5e1)" }, // tường gạch + nắp đá
  stone: { side: "linear-gradient(to top, #94a3b8, #e2e8f0)", top: "#f8fafc" },
  slab: {
    side: "repeating-linear-gradient(0deg, transparent 0 7px, rgba(248,226,153,0.07) 7px 8px), linear-gradient(to top, #0d0b09, #2a241b 88%, #f8e299 88%)",
    bottom: SLAB_BOTTOM,
  },
  carBody: {
    side: "linear-gradient(to top, #94a3b8, #f8fafc)",
    top: "#ffffff",
  },
  cabin: { side: "linear-gradient(to top, #0f172a, #475569)", top: "#e2e8f0" },
  tire: { side: "#0b1120", top: "#111827", noShadow: true },
  headlight: {
    side: "#fde047",
    top: "#fef08a",
    emissive: true,
    glow: "0 0 6px 2px rgba(253,224,71,0.8)",
  },
  taillight: {
    side: "#f43f5e",
    top: "#fb7185",
    emissive: true,
    glow: "0 0 5px 1px rgba(244,63,94,0.8)",
  },
} satisfies Record<string, Skin>;

type SkinName = keyof typeof SKINS;

/* ======================= Khối hộp 3D ======================= */
interface FaceProps {
  x: number;
  y: number;
  len: number;
  h: number;
  angle: number;
  z?: number;
  background: string;
  emissive?: boolean;
  glow?: string;
  anim?: string; // animation riêng (vd: bật đèn)
}

/**
 * 1 mặt đứng: chân bắt đầu tại (x, y), chạy theo hướng `angle`
 * (0 = sang phải, 90 = xuống, 180 = sang trái, -90 = lên), dài `len`, cao `h`, nhấc lên `z`.
 * Mặt luôn quay ra ngoài (hướng angle + 90 = --n) → class .face-3d dùng --n để tính sáng/tối.
 */
function Face({
  x,
  y,
  len,
  h,
  angle,
  z = 0,
  background,
  emissive,
  glow,
  anim,
}: FaceProps) {
  return (
    <div
      className={`absolute ${emissive ? "" : "face-3d"} ${
        anim ? "city-anim" : ""
      }`}
      style={
        {
          "--n": `${angle + 90}deg`,
          left: x,
          top: y - h,
          width: len,
          height: h,
          transformOrigin: "0 100%",
          transform: `translateZ(${z}px) rotateZ(${angle}deg) rotateX(-90deg)`,
          backfaceVisibility: "hidden",
          background,
          boxShadow: glow,
          animation: anim,
        } as CSSProperties
      }
    />
  );
}

interface BoxProps {
  x: number; // vị trí trên khu đất
  y: number;
  w: number; // rộng
  d: number; // sâu
  h: number; // cao
  z?: number; // nhấc lên khỏi mặt đất
  skin?: SkinName;
  light?: "ping" | "lamp"; // đèn trên nóc
}

/** Khối hộp = 4 mặt bên (đi vòng quanh chân, quay ra ngoài) + nóc (+ đáy nếu có) */
function Box({ x, y, w, d, h, z = 0, skin = "tower", light }: BoxProps) {
  const s: Skin = SKINS[skin];
  const sides = [
    { x: 0, y: d, len: w, angle: 0 }, // trước
    { x: w, y: d, len: d, angle: -90 }, // phải
    { x: w, y: 0, len: w, angle: 180 }, // sau
    { x: 0, y: 0, len: d, angle: 90 }, // trái
  ];

  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        width: w,
        height: d,
        transformStyle: "preserve-3d",
        transform: `translateZ(${z}px)`,
      }}
    >
      {/* Bóng đổ dưới chân */}
      {z === 0 && !s.noShadow && (
        <div
          className="absolute -inset-3"
          style={{
            background:
              "radial-gradient(closest-side, rgba(0,0,0,0.5), transparent)",
          }}
        />
      )}

      {sides.map((f) => (
        <Face
          key={f.angle}
          {...f}
          h={h}
          background={s.side}
          emissive={s.emissive}
          glow={s.glow}
        />
      ))}

      {s.top && (
        <div
          className="absolute inset-0"
          style={{
            transform: `translateZ(${h}px)`,
            background: s.top,
            boxShadow: s.glow,
          }}
        >
          {light === "ping" && (
            <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-amber-300" />
          )}
          {light === "lamp" && (
            <span
              className="city-anim absolute inset-[4px] rounded-full bg-amber-300 shadow-[0_0_12px_4px_rgba(252,211,77,0.85)]"
              style={{ animation: lightOn(T_LIGHT) }}
            />
          )}
        </div>
      )}

      {s.bottom && (
        <div
          className="absolute inset-0"
          style={{
            transform: "rotateX(180deg)",
            backfaceVisibility: "hidden",
            background: s.bottom,
          }}
        />
      )}
    </div>
  );
}

/**
 * 1 thành phần lắp ráp: bọc các khối bên trong và chạy animation lắp vào chỗ.
 * squash = 1: không bẹp khi chạm (dùng cho khối nằm trên cao như mũ trụ, xà ngang).
 */
function Piece({
  anim,
  squash = 0.82,
  children,
}: {
  anim: string;
  squash?: number;
  children: ReactNode;
}) {
  return (
    <div
      className="city-anim absolute inset-0"
      style={
        {
          transformStyle: "preserve-3d",
          animation: anim,
          "--squash": squash,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

/* ======================= Tòa nhà (thứ tự = thứ tự rơi xuống) ======================= */
const BUILDINGS: BoxProps[] = [
  // Hàng sau
  { x: 36, y: 36, w: 70, d: 70, h: 120 },
  { x: 130, y: 32, w: 66, d: 78, h: 190 },
  { x: 226, y: 40, w: 64, d: 64, h: 110 },
  { x: 316, y: 36, w: 68, d: 72, h: 150 },
  // Hàng giữa
  { x: 40, y: 152, w: 76, d: 76, h: 90 },
  { x: 300, y: 148, w: 72, d: 84, h: 170 },
  // Hàng trước (chừa đường giữa từ cổng vào)
  { x: 40, y: 300, w: 100, d: 66, h: 64 },
  { x: 250, y: 290, w: 60, d: 60, h: 120 },
  { x: 330, y: 300, w: 54, d: 54, h: 84 },
  // Tòa chính ở giữa — rơi xuống cuối cùng
  { x: 172, y: 146, w: 76, d: 76, h: 260, skin: "accent", light: "ping" },
];

/* ======================= Tường gạch bao quanh + cổng ======================= */
const C0 = WALL_IN; // tâm tường phía trên/trái
const C1 = PLOT - WALL_IN; // tâm tường phía dưới/phải
const HALF_T = WALL_T / 2;
const HALF_P = PILLAR / 2;
const G0 = PLOT / 2 - GATE_W / 2; // 2 mép lối vào
const G1 = PLOT / 2 + GATE_W / 2;
const SPAN = C1 - C0 - PILLAR; // chiều dài tường giữa 2 trụ góc

const corner = (cx: number, cy: number): BoxProps => ({
  x: cx - HALF_P,
  y: cy - HALF_P,
  w: PILLAR,
  d: PILLAR,
  h: PILLAR_H,
  skin: "brick",
});

// Thứ tự = thứ tự mọc lên: đi một vòng quanh khu đất
const WALLS: BoxProps[] = [
  corner(C0, C0),
  {
    x: C0 + HALF_P,
    y: C0 - HALF_T,
    w: SPAN,
    d: WALL_T,
    h: WALL_H,
    skin: "brick",
  }, // sau
  corner(C1, C0),
  {
    x: C1 - HALF_T,
    y: C0 + HALF_P,
    w: WALL_T,
    d: SPAN,
    h: WALL_H,
    skin: "brick",
  }, // phải
  corner(C1, C1),
  {
    x: G1 + GATE_PILLAR,
    y: C1 - HALF_T,
    w: C1 - HALF_P - (G1 + GATE_PILLAR),
    d: WALL_T,
    h: WALL_H,
    skin: "brick",
  }, // trước-phải
  {
    x: C0 + HALF_P,
    y: C1 - HALF_T,
    w: G0 - GATE_PILLAR - (C0 + HALF_P),
    d: WALL_T,
    h: WALL_H,
    skin: "brick",
  }, // trước-trái
  corner(C0, C1),
  {
    x: C0 - HALF_T,
    y: C0 + HALF_P,
    w: WALL_T,
    d: SPAN,
    h: WALL_H,
    skin: "brick",
  }, // trái
];

// Cổng: 2 trụ gạch to + mũ đá có đèn + xà ngang
const GATE_PILLARS: BoxProps[] = [G0 - GATE_PILLAR, G1].map((px) => ({
  x: px,
  y: C1 - GATE_PILLAR / 2,
  w: GATE_PILLAR,
  d: GATE_PILLAR,
  h: GATE_H,
  skin: "brick",
}));
const GATE_CAPS: BoxProps[] = [G0 - GATE_PILLAR, G1].map((px) => ({
  x: px - 3,
  y: C1 - GATE_PILLAR / 2 - 3,
  w: GATE_PILLAR + 6,
  d: GATE_PILLAR + 6,
  h: 6,
  z: GATE_H,
  skin: "stone",
  light: "lamp",
}));
const GATE_BEAM: BoxProps = {
  x: G0,
  y: C1 - 6,
  w: GATE_W,
  d: 12,
  h: 12,
  z: GATE_H - 18,
  skin: "stone",
};

/* ======================= Xe chạy vào khu ======================= */
function Car() {
  return (
    <div
      className="city-anim absolute"
      style={
        {
          left: CAR_X,
          top: CAR_START,
          width: CAR_W,
          height: CAR_L,
          transformStyle: "preserve-3d",
          "--drive": `${CAR_END - CAR_START}px`, // quãng đường chạy (âm = chạy vào trong)
          animation: `car-drive 8s ease-in-out ${T_CAR}ms infinite backwards`,
        } as CSSProperties
      }
    >
      {/* Bóng xe + vệt đèn pha chiếu xuống mặt đường */}
      <div
        className="absolute -inset-1"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,0,0,0.6), transparent)",
        }}
      />
      <div
        className="absolute"
        style={{
          left: -8,
          top: -32,
          width: CAR_W + 16,
          height: 32,
          background:
            "radial-gradient(ellipse 50% 100% at 50% 100%, rgba(253,230,138,0.55), transparent 75%)",
        }}
      />

      <Box x={-1} y={5} w={CAR_W + 2} d={5} h={3} skin="tire" />
      <Box x={-1} y={CAR_L - 10} w={CAR_W + 2} d={5} h={3} skin="tire" />
      <Box x={0} y={0} w={CAR_W} d={CAR_L} h={5} z={3} skin="carBody" />
      <Box x={1.5} y={9} w={CAR_W - 3} d={13} h={4} z={8} skin="cabin" />
      <Box
        x={1.5}
        y={-0.8}
        w={CAR_W - 3}
        d={0.8}
        h={2}
        z={5}
        skin="headlight"
      />
      <Box
        x={1.5}
        y={CAR_L}
        w={CAR_W - 3}
        d={0.8}
        h={2}
        z={5}
        skin="taillight"
      />
    </div>
  );
}

/* ======================= Khu đô thị 3D ======================= */
/**
 * Vào trang: từng phần lắp ráp lần lượt → lắp xong thì tự quay chậm.
 * Kéo chuột để xoay 3D (ngang + dọc), lăn chuột để xoay, nhấp đúp để về góc ban đầu.
 */
function Auth3DScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const plate = plateRef.current;
    const spin = spinRef.current;
    if (!scene || !plate || !spin) return;

    // Người dùng bật "giảm chuyển động": hiện sẵn, không lắp ráp, không tự quay
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const goal = { yaw: 0, pitch: PITCH }; // góc cần tới
    const view = { yaw: 0, pitch: PITCH }; // góc đang hiển thị
    let drag: { x: number; y: number; t: number; v: number } | null = null; // đang kéo
    let ready = reduceMotion; // đã lắp xong chưa (chưa xong thì chưa cho kéo / lăn)
    let autoSpin = false; // đã bật tự quay chưa
    let spinSpeed = 0; // tốc độ tự quay hiện tại (độ/giây), tăng giảm mượt
    let lastInput = -Infinity; // lần cuối người dùng tương tác (ms)
    let visible = true; // khu đô thị có đang hiện trên màn hình không
    let raf = 0;
    let last = 0;
    let resumeTimer = 0;

    // Ghi thẳng vào DOM, không setState → React không render lại mỗi khung hình
    const render = () => {
      const yaw = BASE_ANGLE + view.yaw;
      plate.style.transform = `rotateX(${view.pitch}deg)`;
      spin.style.transform = `rotateZ(${yaw}deg)`;
      spin.style.setProperty("--rz", `${yaw}deg`); // dùng để tính sáng/tối các mặt
    };

    const tick = (now: number) => {
      if (!visible) {
        raf = 0; // khuất màn hình / đang ẩn trên mobile → dừng hẳn
        last = 0;
        return;
      }
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;

      // Tự quay: chỉ khi đã lắp xong và người dùng ngừng tương tác đủ lâu
      const wantSpin = autoSpin && !drag && now - lastInput > AUTO_RESUME;
      spinSpeed +=
        ((wantSpin ? AUTO_SPEED : 0) - spinSpeed) * (1 - Math.exp(-dt * 2));
      if (!wantSpin && spinSpeed < 0.05) spinSpeed = 0;
      goal.yaw += spinSpeed * dt;

      // Đang kéo thì bám sát tay, thả ra thì trôi chậm dần tới đích
      const k = 1 - Math.exp(-dt * (drag ? 18 : 7));
      view.yaw += (goal.yaw - view.yaw) * k;
      view.pitch += (goal.pitch - view.pitch) * k;

      const settled =
        !drag &&
        spinSpeed === 0 &&
        Math.abs(goal.yaw - view.yaw) < 0.05 &&
        Math.abs(goal.pitch - view.pitch) < 0.05;
      if (settled) {
        view.yaw = goal.yaw;
        view.pitch = goal.pitch;
      }
      render();

      if (settled) {
        raf = 0; // đứng yên → dừng hẳn, không chạy nền
        last = 0;
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    const wake = () => {
      if (!raf && visible) raf = requestAnimationFrame(tick);
    };

    // Mỗi lần người dùng kéo / lăn: tạm dừng tự quay, ẩn gợi ý, hẹn giờ quay lại
    const onUserInput = () => {
      lastInput = performance.now();
      if (hintRef.current) hintRef.current.style.opacity = "0";
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(wake, AUTO_RESUME + 50);
      wake();
    };

    /* Lăn chuột ở bất kỳ đâu trên trang → xoay ngang */
    const onWheel = (e: WheelEvent) => {
      if (!ready) return;
      // Chuẩn hóa về px: Firefox có thể trả theo dòng (deltaMode 1) hoặc theo trang (2)
      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const px =
        e.deltaMode === 1 ? raw * 33 : e.deltaMode === 2 ? raw * 800 : raw;
      goal.yaw += clamp(px, -200, 200) * WHEEL_SPEED;
      onUserInput();
    };

    /* Kéo chuột: ngang → xoay vòng, dọc → lật lên/xuống (từ trên nhìn xuống tới dưới nhìn lên) */
    const onDown = (e: PointerEvent) => {
      if (!ready || e.button !== 0) return; // chỉ chuột trái / ngón tay
      drag = { x: e.clientX, y: e.clientY, t: e.timeStamp, v: 0 };
      scene.setPointerCapture(e.pointerId); // kéo ra ngoài khung vẫn xoay tiếp
      scene.style.cursor = "grabbing";
      onUserInput();
    };

    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      const dt = Math.max(1, e.timeStamp - drag.t);
      drag.v = drag.v * 0.6 + (dx / dt) * 0.4; // vận tốc ngang (px/ms), làm mượt
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.t = e.timeStamp;

      goal.yaw -= dx * DRAG_SPEED; // kéo sang phải → mặt trước chạy sang phải
      goal.pitch = clamp(goal.pitch - dy * PITCH_SPEED, 0, 180);
    };

    const onUp = (e: PointerEvent) => {
      if (!drag) return;
      // Thả tay khi còn đang vuốt nhanh → quay tiếp một đoạn rồi chậm dần
      if (e.timeStamp - drag.t < 100)
        goal.yaw -= clamp(drag.v * 250 * DRAG_SPEED, -120, 120);
      drag = null;
      if (scene.hasPointerCapture(e.pointerId))
        scene.releasePointerCapture(e.pointerId);
      scene.style.cursor = "";
      onUserInput();
    };

    /* Nhấp đúp → về góc nhìn ban đầu (quay đường ngắn nhất) */
    const onDoubleClick = () => {
      if (!ready) return;
      goal.yaw = Math.round(view.yaw / 360) * 360;
      goal.pitch = PITCH;
      onUserInput();
    };

    // Lắp xong → cho phép tương tác, hiện gợi ý, bắt đầu tự quay
    const readyTimer = window.setTimeout(
      () => {
        ready = true;
        autoSpin = !reduceMotion;
        if (hintRef.current) hintRef.current.style.opacity = "1";
        wake();
      },
      reduceMotion ? 0 : T_DONE,
    );

    // Chỉ chạy khi khu đô thị đang hiện trên màn hình (mobile đang ẩn thì không chạy)
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    observer.observe(scene);

    window.addEventListener("wheel", onWheel, { passive: true }); // passive: không chặn cuộn trang
    scene.addEventListener("pointerdown", onDown);
    scene.addEventListener("pointermove", onMove);
    scene.addEventListener("pointerup", onUp);
    scene.addEventListener("pointercancel", onUp);
    scene.addEventListener("dblclick", onDoubleClick);
    return () => {
      window.clearTimeout(readyTimer);
      window.clearTimeout(resumeTimer);
      observer.disconnect();
      window.removeEventListener("wheel", onWheel);
      scene.removeEventListener("pointerdown", onDown);
      scene.removeEventListener("pointermove", onMove);
      scene.removeEventListener("pointerup", onUp);
      scene.removeEventListener("pointercancel", onUp);
      scene.removeEventListener("dblclick", onDoubleClick);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Rê chuột → nghiêng nhẹ cả khối
  const handleHover = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = clamp(((e.clientY - r.top) / r.height - 0.5) * -8, -4, 4);
    const y = clamp(((e.clientX - r.left) / r.width - 0.5) * 10, -5, 5);
    if (tiltRef.current)
      tiltRef.current.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;
  };

  const resetHover = () => {
    if (tiltRef.current)
      tiltRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div
      ref={sceneRef}
      onMouseMove={handleHover}
      onMouseLeave={resetHover}
      className="relative mt-6 flex h-[520px] w-full cursor-grab select-none items-center justify-center [@media(max-height:860px)]:mt-2 [@media(max-height:860px)]:h-[400px] [@media(max-height:720px)]:h-[320px]"
      style={{ perspective: "1800px", touchAction: "pan-y" }}
    >
      {/* Thu nhỏ khu đô thị trên màn hình laptop thấp */}
      <div
        className="[@media(max-height:860px)]:scale-[0.78] [@media(max-height:720px)]:scale-[0.62]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Lớp nghiêng theo chuột */}
        <div
          ref={tiltRef}
          aria-hidden
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 400ms ease-out",
          }}
        >
          {/* Lật lên/xuống (kéo dọc) */}
          <div
            ref={plateRef}
            className="relative"
            style={{
              width: PLOT,
              height: PLOT,
              transformStyle: "preserve-3d",
              transform: `rotateX(${PITCH}deg)`,
            }}
          >
            {/* Xoay vòng (tự quay / kéo ngang / lăn chuột) */}
            <div
              ref={spinRef}
              className="absolute inset-0"
              style={
                {
                  transformStyle: "preserve-3d",
                  transform: `rotateZ(${BASE_ANGLE}deg)`,
                  "--rz": `${BASE_ANGLE}deg`,
                } as CSSProperties
              }
            >
              {/* 1. Đế khu đất + mặt đất bật lên */}
              <Piece anim={pop(T_BASE)}>
                <Box
                  x={0}
                  y={0}
                  w={PLOT}
                  d={PLOT}
                  h={SLAB_H}
                  z={-SLAB_H}
                  skin="slab"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: GROUND,
                    boxShadow: "0 0 0 1px rgba(248,226,153,0.35)",
                  }}
                />
              </Piece>

              {/* 2. Trải đường nội khu từ cổng vào sảnh tòa chính */}
              <div
                className="city-anim absolute"
                style={{
                  left: PLOT / 2 - ROAD_W / 2,
                  top: ROAD_TOP,
                  width: ROAD_W,
                  height: PLOT - ROAD_TOP,
                  transformOrigin: "50% 100%",
                  animation: `piece-pave 600ms ease-out ${T_ROAD}ms both`,
                  background:
                    "repeating-linear-gradient(180deg, rgba(255,255,255,0.6) 0 8px, transparent 8px 16px) 50% 0 / 2px 100% no-repeat, linear-gradient(rgba(148,163,184,0.2), rgba(148,163,184,0.38))",
                }}
              />

              {/* 3. Từng tòa nhà rơi xuống (tòa chính cuối cùng, chậm hơn 1 nhịp) */}
              {BUILDINGS.map((b, i) => (
                <Piece
                  key={`b${i}`}
                  anim={drop(
                    T_BUILD + i * BUILD_GAP + (b.skin === "accent" ? 250 : 0),
                  )}
                >
                  <Box {...b} />
                </Piece>
              ))}

              {/* 4. Tường gạch mọc lên, đi một vòng quanh khu đất */}
              {WALLS.map((b, i) => (
                <Piece key={`w${i}`} anim={rise(T_WALL + i * WALL_GAP)}>
                  <Box {...b} />
                </Piece>
              ))}

              {/* 5. Cổng: trụ mọc lên → mũ trụ rơi xuống → xà ngang rơi vào giữa */}
              {GATE_PILLARS.map((b, i) => (
                <Piece key={`gp${i}`} anim={rise(T_GATE + i * 60)}>
                  <Box {...b} />
                </Piece>
              ))}
              {GATE_CAPS.map((b, i) => (
                <Piece key={`gc${i}`} anim={drop(T_CAP + i * 60)} squash={1}>
                  <Box {...b} />
                </Piece>
              ))}
              <Piece anim={drop(T_BEAM)} squash={1}>
                <Box {...GATE_BEAM} />
              </Piece>

              {/* 6. Bật đèn: dải LED trên xà cổng + sảnh tòa chính */}
              <Face
                x={G0 + 4}
                y={C1 + 6.4}
                len={GATE_W - 8}
                h={3}
                z={GATE_H - 13.5}
                angle={0}
                emissive
                glow="0 0 8px 2px rgba(252,211,77,0.7)"
                background="linear-gradient(90deg, #fbbf24, #fef3c7 50%, #fbbf24)"
                anim={lightOn(T_LIGHT + 300)}
              />
              <Face
                x={CAR_X - 7}
                y={ROAD_TOP + 0.6}
                len={CAR_W + 14}
                h={18}
                angle={0}
                emissive
                glow="0 0 14px 4px rgba(251,191,36,0.55)"
                background="linear-gradient(to top, #fde68a, #f59e0b 70%, #92400e)"
                anim={lightOn(T_LIGHT)}
              />

              {/* 7. Xe bắt đầu chạy vào */}
              <Car />
            </div>
          </div>
        </div>
      </div>

      {/* Gợi ý — hiện khi lắp xong, mờ đi sau lần tương tác đầu tiên */}
      <div
        ref={hintRef}
        className="pointer-events-none absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 opacity-0 backdrop-blur transition-opacity duration-700"
      >
        <Hand size={14} /> Kéo chuột để xoay 3D · Nhấp đúp để về góc cũ
      </div>
    </div>
  );
}

// memo: trang Login gõ phím (setState) không làm render lại khu đô thị
export default memo(Auth3DScene);
