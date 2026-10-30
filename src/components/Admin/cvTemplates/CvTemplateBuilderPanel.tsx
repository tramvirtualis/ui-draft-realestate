import type { ReactNode } from "react";
import CvTemplateLayoutCanvas from "./CvTemplateLayoutCanvas";
import type { BuilderOptions } from "./templateBuilder";

function Group({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-heading">{label}</legend>
      {hint && <p className="text-xs text-body">{hint}</p>}
      <div className="mt-2">{children}</div>
    </fieldset>
  );
}
function Choice<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={`rounded-lg border px-3 py-1.5 text-sm transition disabled:opacity-60 ${
            value === o.value
              ? "border-primary-600 bg-primary-50 font-semibold text-primary-700"
              : "border-line text-body hover:border-primary-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Chế độ "Thiết kế nhanh": dựng cột, kéo thả và chỉnh từng thành phần, chọn kiểu chung — không cần viết code */
export default function CvTemplateBuilderPanel({
  value,
  onChange,
  color,
  disabled,
}: {
  value: BuilderOptions;
  onChange: (v: BuilderOptions) => void;
  /** Màu chủ đạo đang chọn, để bảng dựng mẫu trông giống CV thật */
  color: string;
  disabled?: boolean;
}) {
  const set = <K extends keyof BuilderOptions>(key: K, v: BuilderOptions[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="space-y-6">
      <Group
        label="Cột & thành phần"
        hint="Kéo thả thẻ để đổi vị trí, dùng “+ Thêm thành phần” ở mỗi cột để thêm (kể cả mục tùy chỉnh do admin tự viết nội dung), ✕ để bỏ, ✎ để đổi tiêu đề và kiểu hiển thị. CV dài hơn một trang thì tự sang trang mới. Thứ tự thẻ là thứ tự mặc định khi ứng viên chọn mẫu; mục ứng viên không điền sẽ tự ẩn."
      >
        <CvTemplateLayoutCanvas
          value={value}
          onChange={onChange}
          color={color}
          disabled={disabled}
        />
      </Group>

      <div className="grid gap-6 sm:grid-cols-2">
        <Group label="Kiểu tiêu đề mục">
          <Choice
            value={value.heading}
            disabled={disabled}
            onChange={(v) => set("heading", v)}
            options={[
              { value: "underline", label: "Gạch chân" },
              { value: "bar", label: "Nền màu" },
              { value: "left-border", label: "Vạch bên trái" },
              { value: "plain", label: "Chữ màu" },
            ]}
          />
        </Group>
        <Group label="Căn tên & ảnh">
          <Choice
            value={value.align}
            disabled={disabled}
            onChange={(v) => set("align", v)}
            options={[
              { value: "center", label: "Giữa" },
              { value: "left", label: "Trái" },
            ]}
          />
        </Group>
        <Group label="Khoảng cách">
          <Choice
            value={value.density}
            disabled={disabled}
            onChange={(v) => set("density", v)}
            options={[
              { value: "compact", label: "Gọn" },
              { value: "normal", label: "Vừa" },
              { value: "airy", label: "Thoáng" },
            ]}
          />
        </Group>
      </div>
    </div>
  );
}
