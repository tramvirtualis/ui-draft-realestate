import { useState } from "react";

const nf = new Intl.NumberFormat("vi-VN");

export type DonutSegment = { label: string; value: number; color: string };

type Props = {
  segments: DonutSegment[];
  totalLabel: string;
};

const SIZE = 180;
const STROKE = 22;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const GAP = 3;

const percent = (v: number, total: number) =>
  total === 0 ? 0 : Math.round((v / total) * 100);

// Biểu đồ vòng (phần / tổng) + chú thích có tên, số, % — không phân biệt chỉ bằng màu.
// Rê chuột / focus vào phần hoặc dòng chú thích: làm nổi phần đó, giữa vòng hiện số của nó
export default function DonutChart({ segments, totalLabel }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const total = segments.reduce((s, x) => s + x.value, 0);
  const shown = segments.filter((s) => s.value > 0).length;

  let offset = 0;
  const arcs = segments.map((s, i) => {
    const len = total === 0 ? 0 : (s.value / total) * C;
    const arc = {
      i,
      s,
      start: offset,
      len: shown > 1 ? Math.max(len - GAP, 0.5) : len,
    };
    offset += len;
    return arc;
  });

  const current = active === null ? null : segments[active];

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          role="img"
          aria-label={`${segments
            .map((s) => `${s.label} ${s.value}`)
            .join(", ")}; tổng ${total}`}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={STROKE}
          />
          {arcs.map(({ i, s, start, len }) =>
            s.value > 0 ? (
              <circle
                key={s.label}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={active === i ? STROKE + 4 : STROKE}
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-start}
                opacity={active === null || active === i ? 1 : 0.3}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                className="cursor-pointer transition-all duration-200"
              />
            ) : null
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-footer">
            {nf.format(current ? current.value : total)}
          </span>
          <span className="max-w-[110px] text-xs text-body">
            {current
              ? `${current.label} · ${percent(current.value, total)}%`
              : totalLabel}
          </span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-1">
        {segments.map((s, i) => (
          <li key={s.label}>
            <button
              type="button"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition ${
                active === i ? "bg-primary-50" : "hover:bg-slate-50"
              }`}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: s.color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-body">
                {s.label}
              </span>
              <span className="tabular-nums font-semibold text-heading">
                {nf.format(s.value)}
              </span>
              <span className="w-10 text-right tabular-nums text-xs text-muted">
                {percent(s.value, total)}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
