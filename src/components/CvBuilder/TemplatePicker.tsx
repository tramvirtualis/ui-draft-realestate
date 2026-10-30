import { Check } from "lucide-react";
import type {
  BuiltinCvTemplateId,
  CvTemplateId,
} from "../../types/job/cv.types";
import type { TemplateOption } from "../../hooks/job/useTemplateOptions";

/** Hình thu nhỏ bố cục của 3 mẫu có sẵn (mẫu từ BE dùng ảnh thumbnail) */
function BuiltinThumb({ id }: { id: BuiltinCvTemplateId }) {
  const bar = "h-1 rounded bg-primary-200";
  if (id === "modern") {
    return (
      <div className="flex h-full gap-1">
        <div className="w-1/3 rounded-sm bg-primary-600" />
        <div className="flex-1 space-y-1 pt-1">
          <div className={bar} />
          <div className={`${bar} w-4/5`} />
          <div className={bar} />
          <div className={`${bar} w-2/3`} />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1 pt-1">
      <div
        className={
          id === "professional"
            ? "h-1.5 rounded bg-primary-600"
            : "h-1 w-1/2 rounded bg-primary-400"
        }
      />
      <div className={bar} />
      <div className={`${bar} w-4/5`} />
      <div className={bar} />
      <div className={`${bar} w-2/3`} />
    </div>
  );
}

function Thumb({ option }: { option: TemplateOption }) {
  if (option.builtin) return <BuiltinThumb id={option.builtin} />;
  if (option.thumbnailUrl) {
    return (
      <img
        src={option.thumbnailUrl}
        alt=""
        loading="lazy"
        className="h-full w-full rounded object-cover object-top"
      />
    );
  }
  // Mẫu chưa có ảnh xem trước
  return (
    <div className="flex h-full items-center justify-center rounded bg-primary-50 text-[10px] font-semibold uppercase text-primary-400">
      CV
    </div>
  );
}

/** Lưới mẫu CV; mẫu đang chọn có viền tím và dấu tích */
export default function TemplatePicker({
  options,
  loading,
  value,
  onChange,
}: {
  options: TemplateOption[];
  loading?: boolean;
  value: CvTemplateId;
  onChange: (id: CvTemplateId) => void;
}) {
  if (loading) {
    return (
      <div
        className="mt-4 grid animate-pulse grid-cols-3 gap-3"
        aria-busy="true"
        aria-label="Đang tải mẫu CV"
      >
        {[0, 1, 2].map((n) => (
          <div key={n} className="h-[5.5rem] rounded-xl bg-primary-50" />
        ))}
      </div>
    );
  }

  return (
    <div
      className="mt-4 grid max-h-72 grid-cols-3 gap-3 overflow-y-auto p-0.5"
      role="radiogroup"
      aria-label="Chọn mẫu CV"
    >
      {options.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={active}
            title={t.description ?? t.label}
            onClick={() => onChange(t.id)}
            className={`relative rounded-xl border-2 bg-white p-2 text-left transition focus-visible:outline-2 focus-visible:outline-primary-600 ${
              active
                ? "border-primary-600"
                : "border-line hover:border-primary-300"
            }`}
          >
            <div className="h-16 overflow-hidden">
              <Thumb option={t} />
            </div>
            <p className="mt-1 truncate text-[11px] font-medium text-heading">
              {t.label}
            </p>
            {active && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-white">
                <Check size={10} strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
