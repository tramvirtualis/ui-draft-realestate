// Mặt bằng tầng điển hình (placeholder SVG, thay bằng ảnh mặt bằng thật)
export default function FloorPlanSvg() {
  const zones = [
    {
      d: "M 60 60 L 280 60 L 280 240 L 160 240 L 60 160 Z",
      fill: "var(--color-primary-100)",
    },
    { d: "M 280 60 L 500 60 L 500 160 L 400 240 L 280 240 Z", fill: "#dcfce7" },
    { d: "M 500 60 L 640 160 L 600 260 L 500 260 Z", fill: "#fee2e2" },
    { d: "M 60 240 L 160 240 L 280 360 L 160 480 L 60 360 Z", fill: "#fef3c7" },
    {
      d: "M 600 260 L 640 360 L 520 480 L 400 400 L 500 260 Z",
      fill: "#e0e7ff",
    },
    {
      d: "M 160 480 L 280 360 L 400 400 L 520 480 L 400 560 L 260 560 Z",
      fill: "#dcfce7",
    },
  ];
  return (
    <svg viewBox="0 0 700 620" className="h-full w-full">
      <ellipse
        cx="350"
        cy="310"
        rx="290"
        ry="285"
        fill="white"
        stroke="var(--color-line)"
        strokeWidth="6"
      />
      <clipPath id="plan-clip">
        <ellipse cx="350" cy="310" rx="280" ry="275" />
      </clipPath>
      <g clipPath="url(#plan-clip)">
        {zones.map((z, i) => (
          <path
            key={i}
            d={z.d}
            fill={z.fill}
            stroke="var(--color-heading)"
            strokeWidth="5"
            transform="translate(0 0)"
          />
        ))}
      </g>
      <rect
        x="240"
        y="190"
        width="220"
        height="240"
        fill="white"
        stroke="var(--color-heading)"
        strokeWidth="6"
      />
      <rect
        x="270"
        y="220"
        width="60"
        height="70"
        fill="none"
        stroke="var(--color-heading)"
        strokeWidth="4"
      />
      <rect
        x="370"
        y="220"
        width="60"
        height="70"
        fill="none"
        stroke="var(--color-heading)"
        strokeWidth="4"
      />
      <rect
        x="270"
        y="330"
        width="160"
        height="70"
        fill="none"
        stroke="var(--color-heading)"
        strokeWidth="4"
      />
      <text
        x="350"
        y="318"
        textAnchor="middle"
        fontSize="13"
        fill="var(--color-body)"
      >
        LOBBY
      </text>
    </svg>
  );
}
