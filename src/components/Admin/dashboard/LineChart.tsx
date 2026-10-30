import { useEffect, useId, useRef, useState } from "react";
import { CHART } from "./chartColors";

const nf = new Intl.NumberFormat("vi-VN");

export type LineSeries = { name: string; color: string; values: number[] };

type Props = {
  labels: string[];
  series: LineSeries[];
  area?: boolean;
  height?: number;
};

const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw;
  return Array.from(
    { length: Math.ceil(max / step) + 1 },
    (_, i) => Math.round(i * step * 100) / 100
  );
}

function smooth(pts: [number, number][], baseline: number): string {
  if (pts.length === 0) return "";
  const cy = (v: number) => Math.min(v, baseline);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${cy(
      p1[1] + (p2[1] - p0[1]) / 6
    )}, ${p2[0] - (p3[0] - p1[0]) / 6} ${cy(p2[1] - (p3[1] - p1[1]) / 6)}, ${
      p2[0]
    } ${p2[1]}`;
  }
  return d;
}

export default function LineChart({
  labels,
  series,
  area = false,
  height = 260,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hover, setHover] = useState<number | null>(null);
  const gradId = `grad${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setWidth(Math.max(280, e.contentRect.width))
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ticks = niceTicks(Math.max(0, ...series.flatMap((s) => s.values)));
  const top = ticks[ticks.length - 1];
  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left +
    (labels.length <= 1 ? plotW / 2 : (i * plotW) / (labels.length - 1));
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = ((e.clientX - rect.left) / rect.width) * plotW;
    const i = Math.round((rel / plotW) * (labels.length - 1));
    setHover(Math.max(0, Math.min(labels.length - 1, i)));
  };

  // Chỉ hiện ~6 nhãn trục x cho đỡ chật
  const every = Math.ceil(labels.length / 6);
  const tipLeft = hover === null ? 0 : x(hover);

  return (
    <div>
      {series.length > 1 && (
        <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-body">
          {series.map((s) => (
            <li key={s.name} className="flex items-center gap-1.5">
              <span
                className="h-0.5 w-4 rounded-full"
                style={{ background: s.color }}
                aria-hidden
              />{" "}
              {s.name}
            </li>
          ))}
        </ul>
      )}

      <div ref={wrap} className="relative">
        <svg
          width={width}
          height={height}
          className="block"
          role="img"
          aria-label={series
            .map(
              (s) =>
                `${s.name}: ${s.values
                  .map((v, i) => `${labels[i]} ${v}`)
                  .join(", ")}`
            )
            .join("; ")}
        >
          {area && series[0] && (
            <defs>
              <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={series[0].color}
                  stopOpacity={0.22}
                />
                <stop
                  offset="100%"
                  stopColor={series[0].color}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
          )}

          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke={CHART.grid}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y(t) + 3.5}
                textAnchor="end"
                fontSize={11}
                className="fill-muted tabular-nums"
              >
                {nf.format(t)}
              </text>
            </g>
          ))}

          {labels.map((l, i) =>
            i % every === 0 || i === labels.length - 1 ? (
              <text
                key={l}
                x={x(i)}
                y={height - 8}
                textAnchor={
                  i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"
                }
                fontSize={11}
                className="fill-muted"
              >
                {l}
              </text>
            ) : null
          )}

          {series.map((s) => {
            const pts = s.values.map(
              (v, i) => [x(i), y(v)] as [number, number]
            );
            const line = smooth(pts, y(0));
            return (
              <g key={s.name}>
                {area && (
                  <path
                    d={`${line} L ${x(pts.length - 1)} ${y(0)} L ${x(0)} ${y(
                      0
                    )} Z`}
                    fill={`url(#${gradId})`}
                  />
                )}
                <path
                  d={line}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx={pts[pts.length - 1][0]}
                  cy={pts[pts.length - 1][1]}
                  r={4}
                  fill={s.color}
                  stroke="#fff"
                  strokeWidth={2}
                />
              </g>
            );
          })}

          {hover !== null && (
            <g pointerEvents="none">
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1={PAD.top}
                y2={PAD.top + plotH}
                stroke="#94a3b8"
                strokeWidth={1}
              />
              {series.map((s) => (
                <circle
                  key={s.name}
                  cx={x(hover)}
                  cy={y(s.values[hover])}
                  r={5}
                  fill={s.color}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}

          {/* Vùng bắt chuột phủ cả khung vẽ, không cần trỏ trúng đường */}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={plotW}
            height={plotH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute top-2 z-10 min-w-[140px] rounded-xl bg-footer px-3 py-2 text-xs text-white shadow-xl"
            style={{
              left: tipLeft,
              transform:
                tipLeft > width / 2
                  ? "translateX(calc(-100% - 12px))"
                  : "translateX(12px)",
            }}
          >
            <p className="mb-1 font-semibold">{labels[hover]}</p>
            {series.map((s) => (
              <p
                key={s.name}
                className="flex items-center justify-between gap-4"
              >
                <span className="flex items-center gap-1.5 text-white/80">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: s.color }}
                    aria-hidden
                  />
                  {s.name}
                </span>
                <strong className="tabular-nums">
                  {nf.format(s.values[hover])}
                </strong>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
