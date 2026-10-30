import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SafeImage from "../../../common/SafeImage";
import TagInput from "../../../common/TagInput";
import ZonesManager from "./ZonesManager";
import { BUILDING_TYPE_OPTIONS } from "./buildingType";
import type {
  AdminProject,
  AdminProjectInput,
  AdminZone,
} from "../../../../types/project/adminProject.types";

// Các trường của bảng Projects; loại hình xây dựng chọn ở bước trước, Project_types và Zones quản lý riêng bên dưới
const schema = z.object({
  name: z.string().trim().min(1, "Nhập tên dự án"),
  investor: z.string().trim().min(1, "Nhập chủ đầu tư"),
  location: z.string().trim().min(1, "Nhập địa điểm"),
  consultancy: z.string().trim(),
  developmentModel: z.string().trim(),
  size: z.string().trim(),
  totalInvestment: z.string().trim(),
  ownershipType: z.string().trim(),
});
type Values = z.infer<typeof schema>;

const EMPTY: Values = {
  name: "",
  investor: "",
  location: "",
  consultancy: "",
  developmentModel: "",
  size: "",
  totalInvestment: "",
  ownershipType: "",
};

type Props = {
  initial?: AdminProject;
  buildingType: string; // đã chọn ở bước 1 (tạo) hoặc của dự án (sửa)
  onChangeType?: () => void; // quay lại chọn loại hình; chỉ có khi loại hình chưa được lưu
  submitting: boolean;
  onSubmit: (input: AdminProjectInput) => void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

const input =
  "h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100 aria-[invalid=true]:border-danger";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-footer">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {error && (
        <span role="alert" className="mt-1 block text-xs text-danger">
          {error}
        </span>
      )}
    </label>
  );
}

// Form dùng chung cho Tạo và Sửa dự án
export default function ProjectForm({
  initial,
  buildingType,
  onChangeType,
  submitting,
  onSubmit,
  onCancel,
  onDirtyChange,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: initial ? { ...EMPTY, ...initial } : EMPTY,
  });
  const [zones, setZones] = useState<AdminZone[]>(initial?.zones ?? []);
  const [banks, setBanks] = useState<string[]>(initial?.banks ?? []);
  // Loại hình sản phẩm được tạo từ các căn của dự án nên chỉ hiển thị, không chỉnh ở đây
  const types = initial?.types ?? [];
  const [image, setImage] = useState<string | null>(
    initial?.overviewImage ?? null
  );
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [touched, setTouched] = useState(false); // đã đổi ảnh, ngân hàng hoặc phân khu
  const file = useRef<HTMLInputElement>(null);
  const typeOption = BUILDING_TYPE_OPTIONS.find(
    (o) => o.value === buildingType
  );
  const TypeIcon = typeOption?.icon;

  const dirty = isDirty || touched;
  // Báo cho trang cha để hiện banner "Có thay đổi chưa lưu"
  useEffect(() => onDirtyChange?.(dirty), [dirty, onDirtyChange]);

  const err = (k: keyof Values) => errors[k]?.message;
  const invalid = (k: keyof Values) => (errors[k] ? true : undefined);

  const pickImage = (f?: File) => {
    if (!f) return;
    // Xem trước bằng đường dẫn tạm; file thật được gửi lên khi lưu
    setImage(URL.createObjectURL(f));
    setImageFile(f);
    setTouched(true);
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit((v) =>
        onSubmit({
          ...v,
          buildingType,
          overviewImage: image,
          types,
          zones,
          banks,
          imageFile,
        })
      )}
    >
      <section className="rounded-2xl border border-line bg-white shadow-sm">
        <div className="border-b border-line p-6">
          <h2 className="text-xl font-bold text-footer">Thông tin dự án</h2>
          <p className="mt-1 text-sm text-body">
            Các trường có dấu * là thông tin bắt buộc.
          </p>
        </div>

        <div className="grid gap-x-8 gap-y-5 p-6 md:grid-cols-2">
          <Field label="Tên dự án" required error={err("name")}>
            <input
              {...register("name")}
              aria-invalid={invalid("name")}
              className={input}
            />
          </Field>
          <Field label="Chủ đầu tư" required error={err("investor")}>
            <input
              {...register("investor")}
              aria-invalid={invalid("investor")}
              className={input}
            />
          </Field>
          <Field label="Địa điểm" required error={err("location")}>
            <input
              {...register("location")}
              aria-invalid={invalid("location")}
              placeholder="Ví dụ: Thủ Thiêm, TP.HCM"
              className={input}
            />
          </Field>
          <div>
            <span className="text-sm font-semibold text-footer">
              Loại hình xây dựng
            </span>
            <div className="mt-1.5 flex h-11 items-center gap-2 rounded-xl bg-primary-50/60 px-4">
              {TypeIcon && (
                <TypeIcon size={16} className="text-primary-600" aria-hidden />
              )}
              <span className="text-sm font-semibold text-footer">
                {buildingType}
              </span>
              {onChangeType ? (
                <button
                  type="button"
                  onClick={onChangeType}
                  className="ml-auto text-xs font-semibold text-primary-600 hover:underline"
                >
                  Đổi
                </button>
              ) : (
                <span className="ml-auto text-xs text-muted">
                  Không đổi được sau khi tạo
                </span>
              )}
            </div>
          </div>
          <Field label="Đơn vị tư vấn">
            <input {...register("consultancy")} className={input} />
          </Field>
          <Field label="Mô hình phát triển">
            <input {...register("developmentModel")} className={input} />
          </Field>
          <Field label="Quy mô">
            <input
              {...register("size")}
              placeholder="Ví dụ: 18,6 (ha)"
              className={input}
            />
          </Field>
          <Field label="Tổng vốn đầu tư">
            <input
              {...register("totalInvestment")}
              placeholder="Ví dụ: 25000 (tỷ VNĐ)"
              className={input}
            />
          </Field>
          <Field label="Hình thức sở hữu">
            <input
              {...register("ownershipType")}
              placeholder="Ví dụ: Sở hữu lâu dài"
              className={input}
            />
          </Field>
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-primary-600">
              Loại hình sản phẩm
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {types.map((t) => (
              <span
                key={t}
                className="rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700"
              >
                {t}
              </span>
            ))}
            {types.length === 0 && (
              <span className="text-sm text-muted">Chưa có loại hình nào</span>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-xs font-semibold text-primary-600">
              Ngân hàng hỗ trợ vay
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="mt-3">
            <TagInput
              value={banks}
              onChange={(next) => {
                setBanks(next);
                setTouched(true);
              }}
              label="ngân hàng"
              placeholder="Gõ tên ngân hàng rồi nhấn Enter, ví dụ: BIDV"
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-xs font-semibold text-primary-600">
              Hình ảnh dự án
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <p className="mt-3 text-sm font-semibold text-footer">
            Ảnh tổng quan
          </p>
          {image ? (
            <SafeImage
              src={image}
              alt="Ảnh tổng quan dự án"
              className="mt-2 h-16 w-full rounded-lg border border-dashed border-primary-300 object-cover md:h-40"
            />
          ) : (
            <div className="mt-2 flex h-16 items-center justify-center rounded-lg border border-dashed border-primary-200 bg-primary-50/40 text-xs text-muted">
              Chưa có ảnh
            </div>
          )}
          <input
            ref={file}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => pickImage(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => file.current?.click()}
            className="mt-3 rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50"
          >
            {image ? "Thay ảnh" : "Chọn ảnh"}
          </button>
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
          >
            {submitting
              ? "Đang lưu..."
              : initial
              ? "Lưu thay đổi"
              : "Tạo dự án"}
          </button>
        </div>
      </section>

      <ZonesManager
        zones={zones}
        projectId={initial?.id}
        onChange={(z, persisted) => {
          setZones(z);
          if (!persisted) setTouched(true); // đã lưu thẳng lên server thì không tính là thay đổi chưa lưu
        }}
      />
    </form>
  );
}
