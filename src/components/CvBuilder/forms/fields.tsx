import type { ReactNode } from "react";
import { get, type UseFormReturn } from "react-hook-form";

export const inputClass =
  "h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-heading outline-none transition placeholder:text-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:bg-primary-50/50 disabled:text-muted aria-[invalid=true]:border-danger";

export const textareaClass =
  "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-heading outline-none transition placeholder:text-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-100 aria-[invalid=true]:border-danger";

/** Nhãn + ô nhập + thông báo lỗi. Nhãn bọc quanh input nên được gắn tự động với ô nhập. */
export function Field({
  label,
  required,
  note,
  badge,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  note?: string;
  badge?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block">
        <span className="mb-1.5 flex items-center justify-between gap-2 text-sm font-medium text-heading">
          <span>
            {label}
            {required && <span className="text-danger"> *</span>}
            {note && <span className="ml-2 text-xs font-normal text-muted">{note}</span>}
          </span>
          {badge}
        </span>
        {children}
      </label>
      {error && (
        <p role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** Badge nhỏ cạnh nhãn: "Hợp lệ", "Đã xác thực" */
export function StatusBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
      {children}
    </span>
  );
}

interface RhfFieldProps {
  // biome-ignore lint: form generic theo từng bước
  form: UseFormReturn<any>;
  name: string;
  label: string;
  required?: boolean;
  note?: string;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
  number?: boolean;
  min?: number;
  max?: number;
  disabled?: boolean;
  badge?: ReactNode;
}

/** Ô nhập nối với react-hook-form, tự lấy lỗi theo `name` */
export function RhfField({
  form,
  name,
  label,
  required,
  note,
  type = "text",
  placeholder,
  textarea,
  rows = 3,
  number,
  min,
  max,
  disabled,
  badge,
}: RhfFieldProps) {
  const error = get(form.formState.errors, name)?.message as string | undefined;
  const reg = form.register(name, number ? { valueAsNumber: true } : undefined);
  return (
    <Field label={label} required={required} note={note} error={error} badge={badge}>
      {textarea ? (
        <textarea {...reg} rows={rows} placeholder={placeholder} aria-invalid={!!error} className={textareaClass} />
      ) : (
        <input
          {...reg}
          type={number ? "number" : type}
          min={min}
          max={max}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={inputClass}
        />
      )}
    </Field>
  );
}

/** Thời gian bắt đầu - kết thúc kèm ô "Hiện tại" */
export function PeriodFields({
  // biome-ignore lint: form generic theo từng bước
  form,
  prefix,
}: {
  form: UseFormReturn<any>;
  prefix: string;
}) {
  const current = form.watch(`${prefix}.current`) as boolean;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <RhfField form={form} name={`${prefix}.startDate`} label="Bắt đầu" type="month" required />
      <RhfField form={form} name={`${prefix}.endDate`} label="Kết thúc" type="month" disabled={current} required={!current} />
      <label className="flex items-center gap-2 text-sm text-body sm:col-span-2">
        <input
          type="checkbox"
          {...form.register(`${prefix}.current`)}
          className="h-4 w-4 rounded border-line accent-primary-600"
        />
        Hiện tại (đang làm / đang học)
      </label>
    </div>
  );
}
