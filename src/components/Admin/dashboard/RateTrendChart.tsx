import { TREND_MONTHS, TREND_SERIES } from "../../../data/mockInterestRates";

const W = 700;
const H = 250;
const PAD = { top: 12, right: 8, bottom: 28, left: 40 };
const MIN = 5.5;
const MAX = 8;
const TICKS = [8, 7.5, 7, 6.5, 6, 5.5];

const x = (i: number) => PAD.left + (i * (W - PAD.left - PAD.right)) / (TREND_MONTHS.length - 1);
const y = (v: number) => PAD.top + ((MAX - v) / (MAX - MIN)) * (H - PAD.top - PAD.bottom);

// Nối các điểm bằng đường cong mượt (Catmull-Rom → Bezier)
function smoothPath(values: number[]): string {
  const pts = values.map((v, i) => [x(i), y(v)] as const);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const fmtTick = (v: number) => `${v.toFixed(1).replace(".", ",")}%`;

export default function RateTrendChart() {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-footer">Xu hướng lãi suất ưu đãi</h2>
          <p className="mt-1 text-xs text-body">Mức lãi suất thấp nhất theo ngân hàng trong 6 tháng gần đây</p>
        </div>
        <span className="text-xs font-semibold text-primary-600">6 tháng</span>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-body">
        {TREND_SERIES.map((s) => (
          <li key={s.bank} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} /> {s.label}
          </li>
        ))}
      </ul>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" role="img" aria-label="Biểu đồ xu hướng lãi suất 6 tháng">
        {TICKS.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="stroke-line" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t) + 3} textAnchor="end" className="fill-muted" fontSize={10}>
              {fmtTick(t)}
            </text>
          </g>
        ))}
        {TREND_MONTHS.map((m, i) => (
          <text key={m} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === TREND_MONTHS.length - 1 ? "end" : "middle"} className="fill-muted" fontSize={10}>
            {m}
          </text>
        ))}
        {TREND_SERIES.map((s) => (
          <path key={s.bank} d={smoothPath(s.values)} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" />
        ))}
      </svg>
    </section>
  );
}
