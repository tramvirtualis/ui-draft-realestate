import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../common/toastContext";
import {
  EMPLOYMENT_TYPE_LABEL,
  EXPERIENCE_LEVEL_LABEL,
  JOB_STATUS_META,
  LOCATION_LABEL,
  type EmploymentType,
  type ExperienceLevel,
  type Job,
  type JobRequest,
  type JobStatus,
  type JobType,
} from "../../types/job/job.types";

const MILLION = 1_000_000;

interface FormState {
  jobTypeId: string;
  title: string;
  department: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  salaryNegotiable: boolean;
  experience: string;
  experienceLevel: ExperienceLevel | "";
  employmentType: EmploymentType | "";
  quantity: string;
  description: string;
  requirements: string;
  benefits: string;
  deadline: string;
  status: JobStatus;
}

const EMPTY: FormState = {
  jobTypeId: "",
  title: "",
  department: "",
  location: "",
  salaryMin: "",
  salaryMax: "",
  currency: "VND",
  salaryNegotiable: false,
  experience: "",
  experienceLevel: "",
  employmentType: "FULL_TIME",
  quantity: "1",
  description: "",
  requirements: "",
  benefits: "",
  deadline: "",
  status: "DRAFT",
};

const field =
  "mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm font-normal outline-none focus:border-primary-600 disabled:bg-gray-50";
const STATUSES = Object.keys(JOB_STATUS_META) as JobStatus[];

const fromAmount = (v: number | null | undefined, currency: string) =>
  v == null ? "" : String(currency === "VND" ? v / MILLION : v);
const toAmount = (v: string, currency: string) => {
  const n = Number(v.replace(",", "."));
  if (!v.trim() || !Number.isFinite(n)) return null;
  return currency === "VND" ? Math.round(n * MILLION) : n;
};

const fromJob = (j: Job): FormState => {
  const currency = j.currency || "VND";
  return {
    jobTypeId: j.jobType ? String(j.jobType.id) : "",
    title: j.title,
    department: j.department ?? "",
    location: j.location ?? "",
    salaryMin: fromAmount(j.salaryMin, currency),
    salaryMax: fromAmount(j.salaryMax, currency),
    currency,
    salaryNegotiable: j.salaryNegotiable,
    experience: j.experience ?? "",
    experienceLevel: j.experienceLevel ?? "",
    employmentType: j.employmentType ?? "",
    quantity: j.quantity ? String(j.quantity) : "",
    description: j.description ?? "",
    requirements: j.requirements ?? "",
    benefits: j.benefits ?? "",
    deadline: j.deadline ?? "",
    status: j.status,
  };
};

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-heading">
      {label} {required && <span className="text-danger">*</span>}
      {children}
      {hint && (
        <span className="mt-1 block text-xs font-normal text-muted">
          {hint}
        </span>
      )}
    </label>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-line bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-footer">{title}</h2>
      {children}
    </section>
  );
}

type Props = {
  jobTypes: JobType[];
  // Tin đang sửa (null = đăng mới). Đổi giá trị (tải xong) thì form được điền lại
  job: Job | null;
  loading?: boolean;
  saving?: boolean;
  cancelTo: string;
  submitLabel?: string;
  statusHint?: string;
  // Nội dung chèn trên nút lưu (vd cảnh báo phải duyệt lại)
  notice?: ReactNode;
  className?: string;
  onSubmit: (request: JobRequest) => void | Promise<void>;
};

// Form tin tuyển dụng dùng chung: trang admin (/admin/jobs) và khu nhà tuyển dụng (/employer/jobs)
export default function JobForm({
  jobTypes,
  job,
  loading = false,
  saving = false,
  cancelTo,
  submitLabel = "Lưu tin",
  statusHint = '"Đang tuyển" mới hiện trên trang tuyển dụng',
  notice,
  className = "space-y-5",
  onSubmit,
}: Props) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() =>
    job ? fromJob(job) : EMPTY
  );

  // Chỉ điền lại khi tải xong / đổi sang tin khác; cập nhật cùng tin (vd vừa duyệt) không xóa phần đang sửa
  const jobId = job?.id;
  useEffect(() => {
    if (job) setForm(fromJob(job));
  }, [jobId]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  // loại đang ẩn vẫn hiện nếu tin đang dùng, để ô chọn không bị trống
  const typeOptions = jobTypes.filter(
    (t) => t.active !== false || String(t.id) === form.jobTypeId
  );
  const vnd = form.currency === "VND";
  const disabled = loading || saving;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = [
      !form.title.trim() && "tiêu đề",
      !form.jobTypeId && "loại công việc",
    ].filter(Boolean);
    if (missing.length) {
      toast.show(`Vui lòng bổ sung: ${missing.join(", ")}`, "error");
      return;
    }
    const salaryMin = form.salaryNegotiable
      ? null
      : toAmount(form.salaryMin, form.currency);
    const salaryMax = form.salaryNegotiable
      ? null
      : toAmount(form.salaryMax, form.currency);
    if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
      toast.show("Lương tối thiểu không được lớn hơn lương tối đa", "error");
      return;
    }
    const quantity = form.quantity.trim()
      ? Math.floor(Number(form.quantity))
      : null;
    if (quantity !== null && !(quantity >= 1)) {
      toast.show("Số lượng tuyển phải từ 1 trở lên", "error");
      return;
    }

    onSubmit({
      jobTypeId: Number(form.jobTypeId),
      title: form.title.trim(),
      department: form.department.trim(),
      location: form.location.trim(),
      salaryMin,
      salaryMax,
      currency: form.currency.trim() || "VND",
      salaryNegotiable: form.salaryNegotiable,
      experience: form.experience.trim(),
      experienceLevel: form.experienceLevel || null,
      employmentType: form.employmentType || null,
      quantity,
      description: form.description.trim(),
      requirements: form.requirements.trim(),
      benefits: form.benefits.trim(),
      deadline: form.deadline || null,
      status: form.status,
    });
  };

  const textHint =
    "Mỗi dòng một ý, hiển thị thành gạch đầu dòng trên trang tuyển dụng";

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-busy={loading}
      className={className}
    >
      <Section title="Thông tin chung">
        <Field label="Tiêu đề vị trí" required>
          <input
            value={form.title}
            maxLength={255}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Vd: Chuyên viên kinh doanh bất động sản"
            className={field}
            disabled={disabled}
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Loại công việc"
            required
            hint={
              jobTypes.length === 0 ? "Chưa có loại công việc nào" : undefined
            }
          >
            <select
              value={form.jobTypeId}
              onChange={(e) => set("jobTypeId", e.target.value)}
              className={field}
              disabled={disabled}
            >
              <option value="">— Chọn loại —</option>
              {typeOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.active === false ? " (đang ẩn)" : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Phòng ban">
            <input
              value={form.department}
              maxLength={100}
              onChange={(e) => set("department", e.target.value)}
              placeholder="Vd: Khối kinh doanh"
              className={field}
              disabled={disabled}
            />
          </Field>
          <Field label="Địa điểm làm việc">
            <input
              value={form.location}
              maxLength={255}
              list="job-locations"
              onChange={(e) => set("location", e.target.value)}
              placeholder="Vd: Hồ Chí Minh"
              className={field}
              disabled={disabled}
            />
            <datalist id="job-locations">
              {Object.keys(LOCATION_LABEL).map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Hình thức">
            <select
              value={form.employmentType}
              onChange={(e) =>
                set("employmentType", e.target.value as EmploymentType | "")
              }
              className={field}
              disabled={disabled}
            >
              <option value="">— Không chọn —</option>
              {(Object.keys(EMPLOYMENT_TYPE_LABEL) as EmploymentType[]).map(
                (t) => (
                  <option key={t} value={t}>
                    {EMPLOYMENT_TYPE_LABEL[t]}
                  </option>
                )
              )}
            </select>
          </Field>
          <Field label="Cấp bậc">
            <select
              value={form.experienceLevel}
              onChange={(e) =>
                set("experienceLevel", e.target.value as ExperienceLevel | "")
              }
              className={field}
              disabled={disabled}
            >
              <option value="">— Không chọn —</option>
              {(Object.keys(EXPERIENCE_LEVEL_LABEL) as ExperienceLevel[]).map(
                (t) => (
                  <option key={t} value={t}>
                    {EXPERIENCE_LEVEL_LABEL[t]}
                  </option>
                )
              )}
            </select>
          </Field>
          <Field label="Kinh nghiệm">
            <input
              value={form.experience}
              maxLength={100}
              onChange={(e) => set("experience", e.target.value)}
              placeholder="Vd: 1–3 năm"
              className={field}
              disabled={disabled}
            />
          </Field>
          <Field label="Số lượng tuyển">
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => set("quantity", e.target.value)}
              className={field}
              disabled={disabled}
            />
          </Field>
        </div>
      </Section>

      <Section title="Mức lương">
        <label className="flex items-center gap-2 text-sm text-heading">
          <input
            type="checkbox"
            checked={form.salaryNegotiable}
            onChange={(e) => set("salaryNegotiable", e.target.checked)}
            className="h-4 w-4 accent-primary-600"
            disabled={disabled}
          />
          Lương thỏa thuận (không hiện mức lương)
        </label>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_10rem]">
          <Field
            label={`Tối thiểu${vnd ? " (triệu đồng)" : ""}`}
            hint={vnd ? "Vd: 15 = 15.000.000đ/tháng" : undefined}
          >
            <input
              inputMode="decimal"
              value={form.salaryMin}
              onChange={(e) => set("salaryMin", e.target.value)}
              className={field}
              disabled={disabled || form.salaryNegotiable}
            />
          </Field>
          <Field label={`Tối đa${vnd ? " (triệu đồng)" : ""}`}>
            <input
              inputMode="decimal"
              value={form.salaryMax}
              onChange={(e) => set("salaryMax", e.target.value)}
              className={field}
              disabled={disabled || form.salaryNegotiable}
            />
          </Field>
          <Field label="Đơn vị tiền">
            <select
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
              className={field}
              disabled={disabled || form.salaryNegotiable}
            >
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Nội dung tin">
        <Field label="Mô tả công việc" hint={textHint}>
          <textarea
            value={form.description}
            rows={6}
            onChange={(e) => set("description", e.target.value)}
            className={field}
            disabled={disabled}
          />
        </Field>
        <Field label="Yêu cầu ứng viên" hint={textHint}>
          <textarea
            value={form.requirements}
            rows={6}
            onChange={(e) => set("requirements", e.target.value)}
            className={field}
            disabled={disabled}
          />
        </Field>
        <Field label="Quyền lợi" hint={textHint}>
          <textarea
            value={form.benefits}
            rows={6}
            onChange={(e) => set("benefits", e.target.value)}
            className={field}
            disabled={disabled}
          />
        </Field>
      </Section>

      <Section title="Đăng tin">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Hạn nộp hồ sơ" hint="Bỏ trống nếu không giới hạn">
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => set("deadline", e.target.value)}
              className={field}
              disabled={disabled}
            />
          </Field>
          <Field label="Trạng thái" hint={statusHint}>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as JobStatus)}
              className={field}
              disabled={disabled}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {JOB_STATUS_META[s].label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {notice}

      <div className="flex justify-end gap-3">
        <Link
          to={cancelTo}
          className="rounded-lg border border-line bg-white px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50"
        >
          Hủy
        </Link>
        <button
          disabled={disabled}
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
