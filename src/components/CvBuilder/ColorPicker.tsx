import { CV_COLORS } from "../../types/job/cv.types";

/** Chip tên màu + các swatch chọn màu chủ đạo */
export default function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const current = CV_COLORS.find((c) => c.value === value) ?? CV_COLORS[0];

  return (
    <div>
      <span className="mb-1 block text-[11px] uppercase text-muted">
        Màu chủ đạo
      </span>
      <div
        className="flex flex-wrap items-center gap-2"
        role="radiogroup"
        aria-label="Màu chủ đạo"
      >
        <span className="whitespace-nowrap rounded-full bg-primary-50 px-2.5 py-1.5 text-[11px] font-medium text-primary-700">
          {current.label}
        </span>
        {CV_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={value === c.value}
            aria-label={c.label}
            onClick={() => onChange(c.value)}
            className={`${
              c.swatch
            } h-5 w-5 shrink-0 rounded-full ring-offset-2 transition focus-visible:outline-2 focus-visible:outline-primary-600 ${
              value === c.value ? "ring-2 ring-primary-600" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
