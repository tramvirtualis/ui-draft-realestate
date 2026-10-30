import type { ReactNode } from "react";
import {
  EMPLOYMENT_TYPE_LABEL,
  EXPERIENCE_LEVEL_LABEL,
  LOCATION_LABEL,
  type JobFilter,
  type JobType,
} from "../../types/job/job.types";

const fieldClass =
  "h-11 w-full rounded-xl border border-primary-100 bg-white px-3 text-sm font-medium text-heading outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] text-muted">{label}</span>
      {children}
    </label>
  );
}

/** 4 ô lọc: Loại công việc, Hình thức, Cấp bậc, Khu vực */
export default function JobFilterFields({
  draft,
  jobTypes,
  onChange,
}: {
  draft: JobFilter;
  jobTypes: JobType[];
  onChange: (patch: Partial<JobFilter>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Loại công việc">
        <select
          value={draft.jobTypeId}
          onChange={(e) => onChange({ jobTypeId: e.target.value })}
          className={fieldClass}
        >
          <option value="">Tất cả loại công việc</option>
          {jobTypes.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Hình thức">
        <select
          value={draft.employmentType}
          onChange={(e) =>
            onChange({
              employmentType: e.target.value as JobFilter["employmentType"],
            })
          }
          className={fieldClass}
        >
          <option value="">Tất cả hình thức</option>
          {Object.entries(EMPLOYMENT_TYPE_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Cấp bậc">
        <select
          value={draft.experienceLevel}
          onChange={(e) =>
            onChange({
              experienceLevel: e.target.value as JobFilter["experienceLevel"],
            })
          }
          className={fieldClass}
        >
          <option value="">Tất cả cấp bậc</option>
          {Object.entries(EXPERIENCE_LEVEL_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Khu vực">
        <select
          value={draft.location}
          onChange={(e) => onChange({ location: e.target.value })}
          className={fieldClass}
        >
          <option value="">Tất cả khu vực</option>
          {Object.entries(LOCATION_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
