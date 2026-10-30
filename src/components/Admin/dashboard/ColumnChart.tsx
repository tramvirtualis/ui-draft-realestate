import { useState } from "react";
import { CHART } from "./chartColors";

const nf = new Intl.NumberFormat("vi-VN");

export type Column = { label: string; value: number };

type Props = { columns: Column[]; unit: string };

const H = 200;

function ticks(max: number): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw;
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step);
}

// Biểu đồ cột một chuỗi: cột mảnh bo đầu, số ở đỉnh cột, lưới mảnh; rê chuột làm nổi cột
export default function ColumnChart({ columns, unit }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const t = ticks(Math.max(...columns.map((c) => c.value)));
  const top = t[t.length - 1];

  return (
    <figure
      role="img"
      aria-label={columns
        .map((c) => `${c.label}: ${c.value} ${unit}`)
        .join(", ")}
      className="flex gap-3 pt-6"
    >
      <div
        className="relative w-8 shrink-0 text-right text-[11px] tabular-nums text-muted"
        style={{ height: H }}
      >
        {t.map((v) => (
          <span
            key={v}
            className="absolute right-0 -translate-y-1/2"
            style={{ top: H - (v / top) * H }}
          >
            {nf.format(v)}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height: H }}>
          {t.map((v) => (
            <div
              key={v}
              className="absolute inset-x-0 h-px"
              style={{ top: H - (v / top) * H, background: CHART.grid }}
              aria-hidden
            />
          ))}
          <div className="absolute inset-0 flex items-end justify-around gap-4 px-2">
            {columns.map((c, i) => (
              <div
                key={c.label}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                className="relative flex h-full w-full max-w-16 cursor-default items-end"
              >
                {/* Số đặt ngay trên đỉnh cột, không chiếm chiều cao của cột */}
                <span
                  className={`absolute inset-x-0 text-center text-sm font-bold tabular-nums transition ${
                    active === null || active === i
                      ? "text-heading"
                      : "text-muted"
                  }`}
                  style={{ bottom: `calc(${(c.value / top) * 100}% + 6px)` }}
                >
                  {nf.format(c.value)}
                </span>
                <div
                  className="w-full rounded-t-md transition-all duration-700 ease-out"
                  style={{
                    height: `${(c.value / top) * 100}%`,
                    minHeight: c.value > 0 ? 4 : 0,
                    background: CHART.primary,
                    opacity: active === null || active === i ? 1 : 0.35,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex justify-around gap-4 px-2 text-center text-xs text-body">
          {columns.map((c) => (
            <span key={c.label} className="w-full max-w-24 leading-tight">
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}
