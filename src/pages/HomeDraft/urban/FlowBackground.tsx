// Nền lượn sóng chạy dọc suốt trang (như home-draft-3): vài dải lụa mềm và đường mảnh uốn lượn từ trên xuống dưới,
// có vệt sáng chạy chậm dọc đường. Màu lấy từ biến --hd-flow-* (background.css)

const H = 1000; // chiều cao khung vẽ; SVG kéo giãn theo chiều cao trang (nét giữ nguyên độ dày)
const STEPS = 24;

type Pt = { x: number; y: number };

// Các điểm của một đường dọc: x dao động quanh base theo hình sin
const wavePoints = (base: number, amp: number, waves: number, phase: number): Pt[] =>
  Array.from({ length: STEPS + 1 }, (_, i) => ({
    x: base + amp * Math.sin((i / STEPS) * waves * Math.PI * 2 + phase),
    y: (i / STEPS) * H,
  }));

// Nối các điểm bằng đường cong bậc ba (tiếp tuyến dọc tại mỗi điểm nên chỗ nối luôn mượt)
const curveThrough = (pts: Pt[]) =>
  pts
    .slice(1)
    .map((q, i) => {
      const p = pts[i];
      const my = (p.y + q.y) / 2;
      return `C ${p.x} ${my}, ${q.x} ${my}, ${q.x} ${q.y}`;
    })
    .join(" ");

const wave = (base: number, amp: number, waves: number, phase: number) => {
  const pts = wavePoints(base, amp, waves, phase);
  return `M ${pts[0].x} ${pts[0].y} ${curveThrough(pts)}`;
};

// Dải lụa: xuống theo mép trái, lên theo mép phải (lệch pha để dải phồng / thắt)
const ribbon = (base: number, width: number, amp: number, waves: number, phase: number) => {
  const left = wavePoints(base, amp, waves, phase);
  const right = wavePoints(base + width, amp * 0.8, waves, phase + 0.6).reverse();
  return `M ${left[0].x} ${left[0].y} ${curveThrough(left)} L ${right[0].x} ${right[0].y} ${curveThrough(right)} Z`;
};

const LINES = [
  { base: 12, amp: 9, waves: 2.2, phase: 0 },
  { base: 30, amp: 14, waves: 1.6, phase: 1.4 },
  { base: 68, amp: 12, waves: 1.9, phase: 2.6 },
  { base: 86, amp: 8, waves: 2.6, phase: 0.8 },
].map((l) => wave(l.base, l.amp, l.waves, l.phase));

const RIBBONS = [
  ribbon(6, 18, 12, 1.4, 0.3),
  ribbon(62, 22, 14, 1.2, 2.1),
];

export default function FlowBackground() {
  return (
    // -z-10: nằm dưới mọi nội dung (gốc trang có isolation: isolate nên không chìm xuống dưới nền trang)
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <svg className="h-full w-full" viewBox={`0 0 100 ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="hd-flow-ribbon" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--hd-flow-a)" stopOpacity="0" />
            <stop offset="0.5" stopColor="var(--hd-flow-a)" />
            <stop offset="1" stopColor="var(--hd-flow-b)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {RIBBONS.map((d) => (
          <path key={d} d={d} fill="url(#hd-flow-ribbon)" className="hd-flow-ribbon" />
        ))}
        {LINES.map((d, i) => (
          <g key={d}>
            <path d={d} className="hd-flow-line" vectorEffect="non-scaling-stroke" />
            {/* Vệt sáng chạy dọc đường, mỗi đường lệch nhịp */}
            <path d={d} className="hd-flow-spark" pathLength={100} vectorEffect="non-scaling-stroke" style={{ animationDelay: `${i * -5}s` }} />
          </g>
        ))}
      </svg>
    </div>
  );
}
