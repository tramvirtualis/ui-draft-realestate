import { CHART } from "./chartColors";

const nf = new Intl.NumberFormat("vi-VN");

type Props = {
  value: number;
  total: number;
  label: string;
  restLabel: string;
};

const W = 220;
const STROKE = 18;
const R = (W - STROKE) / 2;
const HALF = Math.PI * R;

export default function GaugeMeter({ value, total, label, restLabel }: Props) {
  const ratio = total === 0 ? 0 : Math.min(1, value / total);
  const pct = Math.round(ratio * 100);
  const path = `M ${STROKE / 2} ${R + STROKE / 2} A ${R} ${R} 0 0 1 ${
    W - STROKE / 2
  } ${R + STROKE / 2}`;

  return (
    <figure className="flex flex-col items-center">
      <div className="relative" style={{ width: W, height: R + STROKE }}>
        <svg
          viewBox={`0 0 ${W} ${R + STROKE}`}
          className="overflow-visible"
          role="img"
          aria-label={`${pct}% ${label}: ${value} / ${total}`}
        >
          <path
            d={path}
            fill="none"
            stroke={CHART.track}
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          {ratio > 0 && (
            <path
              d={path}
              fill="none"
              stroke={CHART.primary}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${HALF * ratio} ${HALF}`}
              className="transition-[stroke-dasharray] duration-700 ease-out"
            />
          )}
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <p className="text-4xl font-bold text-footer">{pct}%</p>
          <p className="text-xs text-body">{label}</p>
        </div>
      </div>
      <figcaption className="mt-4 flex w-full justify-between gap-3 text-xs">
        <span className="flex items-center gap-1.5 text-body">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: CHART.primary }}
            aria-hidden
          />
          {label}{" "}
          <strong className="tabular-nums text-heading">
            {nf.format(value)}
          </strong>
        </span>
        <span className="flex items-center gap-1.5 text-body">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: CHART.track }}
            aria-hidden
          />
          {restLabel}{" "}
          <strong className="tabular-nums text-heading">
            {nf.format(Math.max(0, total - value))}
          </strong>
        </span>
      </figcaption>
    </figure>
  );
}
