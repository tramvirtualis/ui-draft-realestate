import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useFocusTrap from "../../../common/useFocusTrap";
import {
  DIRECTIONS,
  PROPERTY_STATUS,
} from "../../../../data/project/mockProperties";
import { formatPrice } from "./propertyFormat";
import { propertyTypeApiService } from "../../../../services/project/projectService";
import type {
  Property,
  PropertyCatalog,
  PropertyImageChanges,
  PropertyInput,
} from "../../../../types/project/property.types";

const optionalNumber = (label: string, max?: number) => {
  const base = z
    .number({ error: `${label} phải là số` })
    .min(0, `${label} không được âm`);
  return (
    max === undefined ? base : base.max(max, `${label} tối đa ${max}`)
  ).nullable();
};
const optionalUrl = z
  .string()
  .trim()
  .max(500, "Tối đa 500 ký tự")
  .refine(
    (v) => v === "" || /^https?:\/\//i.test(v),
    "Đường dẫn phải bắt đầu bằng http:// hoặc https://"
  );
// Ô số để trống → null
const nullableNumber = {
  valueAsNumber: false,
  setValueAs: (v: unknown) =>
    v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v),
} as const;

const HANDOVER = ["Thô", "Hoàn thiện cơ bản", "Hoàn thiện", "Full nội thất"];
const INVENTORY = ["Sơ cấp", "Thứ cấp"];

const schema = z.object({
  projectId: z.number({ error: "Chọn dự án" }).int().positive("Chọn dự án"),
  zoneId: z.number({ error: "Chọn phân khu" }).int().positive("Chọn phân khu"),
  propertyCode: z.string().trim().min(1, "Nhập mã căn"),
  area: z
    .number({ error: "Diện tích phải là số" })
    .positive("Diện tích phải lớn hơn 0"),
  price: z
    .number({ error: "Giá bán phải là số" })
    .positive("Giá bán phải lớn hơn 0"),
  direction: z.string().min(1, "Chọn hướng"),
  // Tòa nhà, tầng và số phòng ngủ: bắt buộc với căn cao tầng (kiểm tra theo dự án ở superRefine), căn thấp tầng không có
  buildingId: z.number().nullable(),
  axis: z.string().trim().max(20, "Tối đa 20 ký tự"),
  floor: z
    .number({ error: "Tầng phải là số" })
    .int("Tầng phải là số nguyên")
    .min(1, "Tầng tối thiểu là 1")
    .nullable(),
  bedrooms: z
    .number({ error: "Số phòng ngủ phải là số" })
    .int("Số phòng ngủ phải là số nguyên")
    .min(0, "Số phòng ngủ không được âm")
    .max(20, "Tối đa 20 phòng ngủ")
    .nullable(),
  status: z.enum(["available", "holding", "sold", "closed"]),
  type: z
    .string()
    .trim()
    .min(1, "Nhập hoặc chọn loại hình")
    .max(100, "Tối đa 100 ký tự"),
  constructionArea: optionalNumber("Diện tích xây dựng"),
  prepaymentDiscountRate: optionalNumber("Chiết khấu", 100),
  loanPrice: optionalNumber("Giá vay"),
  pricingSheet: optionalUrl,
  layoutUrl: optionalUrl,
  salesPolicyEffectiveDate: z.string(),
  salesPolicySummaryUrl: optionalUrl,
  salesPolicyDetailUrl: optionalUrl,
  gift: z.string().trim().max(500, "Tối đa 500 ký tự"),
  handoverStandard: z.string().trim().max(100, "Tối đa 100 ký tự"),
  propertyInventoryType: z.string().trim().max(100, "Tối đa 100 ký tự"),
});
type Values = z.infer<typeof schema>;

type Props = {
  property: Property | null; // null = thêm mới
  catalog: PropertyCatalog;
  defaultProjectId: number | null;
  defaultZoneId: number | null;
  defaultBuildingId?: number | null; // thêm căn từ trang tòa nhà: chọn sẵn tòa
  lockProject?: boolean; // dự án cố định (đang xem quỹ căn của dự án)
  submitting: boolean;
  onSubmit: (input: PropertyInput, images: PropertyImageChanges) => void;
  onClose: () => void;
};

const input =
  "h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100 aria-[invalid=true]:border-danger";

function Field({
  label,
  error,
  hint,
  optional = false,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-footer">
        {label} {!optional && <span className="text-danger">*</span>}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {hint && !error && (
        <span className="mt-1 block text-xs text-body">{hint}</span>
      )}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-danger">
          {error}
        </span>
      )}
    </label>
  );
}

export default function PropertyFormModal({
  property,
  catalog,
  defaultProjectId,
  defaultZoneId,
  defaultBuildingId = null,
  lockProject = false,
  submitting,
  onSubmit,
  onClose,
}: Props) {
  const root = useRef<HTMLFormElement>(null);
  useFocusTrap(root, true, onClose);

  // Ảnh: đã lưu (có thể đánh dấu xóa) + ảnh mới chọn từ máy
  const picker = useRef<HTMLInputElement>(null);
  const [removeIds, setRemoveIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<{ file: File; preview: string }[]>(
    []
  );
  const savedImages = (property?.imageItems ?? []).filter(
    (i) => !removeIds.includes(i.id)
  );

  const pickFiles = (list: FileList | null) => {
    const files = Array.from(list ?? []).filter(
      (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024
    );
    setNewFiles((cur) => [
      ...cur,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  };

  const zoneOf = (id: number | null) => catalog.zones.find((z) => z.id === id);
  const initialZone = zoneOf(property?.zoneId ?? defaultZoneId);

  // Dự án cao tầng: căn bắt buộc thuộc một tòa, có tầng (không vượt số tầng của tòa), trục và số phòng ngủ
  const highRiseIds = useMemo(
    () => new Set(catalog.projects.filter((p) => p.highRise).map((p) => p.id)),
    [catalog]
  );
  const resolver = useMemo(
    () =>
      zodResolver(
        schema.superRefine((v, ctx) => {
          if (!highRiseIds.has(v.projectId)) return;
          const building = catalog.buildings.find((b) => b.id === v.buildingId);
          if (!building)
            ctx.addIssue({
              code: "custom",
              path: ["buildingId"],
              message: "Chọn tòa nhà",
            });
          if (v.floor === null)
            ctx.addIssue({
              code: "custom",
              path: ["floor"],
              message: "Nhập tầng của căn",
            });
          else if (building && v.floor > building.floors) {
            ctx.addIssue({
              code: "custom",
              path: ["floor"],
              message: `Tòa ${building.name} chỉ có ${building.floors} tầng`,
            });
          }
          if (!v.axis)
            ctx.addIssue({
              code: "custom",
              path: ["axis"],
              message: "Nhập trục của căn",
            });
          if (v.bedrooms === null)
            ctx.addIssue({
              code: "custom",
              path: ["bedrooms"],
              message: "Nhập số phòng ngủ",
            });
        })
      ),
    [highRiseIds, catalog.buildings]
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver,
    defaultValues: property
      ? {
          projectId: initialZone?.projectId ?? 0,
          zoneId: property.zoneId,
          buildingId: property.buildingId,
          axis: property.axis ?? "",
          propertyCode: property.propertyCode,
          area: property.area,
          price: property.price,
          direction: property.direction,
          floor: property.floor,
          bedrooms: property.bedrooms,
          status: property.status,
          type: property.type,
          constructionArea: property.constructionArea,
          prepaymentDiscountRate: property.prepaymentDiscountRate,
          loanPrice: property.loanPrice,
          pricingSheet: property.pricingSheet,
          layoutUrl: property.layoutUrl,
          salesPolicyEffectiveDate: property.salesPolicyEffectiveDate,
          salesPolicySummaryUrl: property.salesPolicySummaryUrl,
          salesPolicyDetailUrl: property.salesPolicyDetailUrl,
          gift: property.gift,
          handoverStandard: property.handoverStandard,
          propertyInventoryType: property.propertyInventoryType,
        }
      : {
          projectId: initialZone?.projectId ?? defaultProjectId ?? 0,
          zoneId: initialZone?.id ?? 0,
          buildingId: defaultBuildingId,
          axis: "",
          propertyCode: "",
          area: undefined,
          price: undefined,
          direction: "",
          floor: null,
          bedrooms: null,
          status: "available",
          type: "",
          constructionArea: null,
          prepaymentDiscountRate: null,
          loanPrice: null,
          pricingSheet: "",
          layoutUrl: "",
          salesPolicyEffectiveDate: "",
          salesPolicySummaryUrl: "",
          salesPolicyDetailUrl: "",
          gift: "",
          handoverStandard: "",
          propertyInventoryType: "",
        },
  });

  const projectId = useWatch({ control, name: "projectId" });
  const zoneId = useWatch({ control, name: "zoneId" });
  const buildingId = useWatch({ control, name: "buildingId" });
  const price = useWatch({ control, name: "price" });
  const loanPrice = useWatch({ control, name: "loanPrice" });

  // Loại hình gợi ý theo dự án đang chọn
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    propertyTypeApiService
      .getByProject(projectId)
      .then((list) => !cancelled && setTypeOptions(list))
      .catch(() => !cancelled && setTypeOptions([]));
    return () => {
      cancelled = true;
    };
  }, [projectId]);
  // Phân khu phải thuộc dự án đang chọn
  const zones = catalog.zones.filter((z) => z.projectId === projectId);
  const highRise = highRiseIds.has(projectId);
  const zoneHint =
    zones.length > 0 || !projectId
      ? undefined
      : "Dự án này chưa có phân khu. Thêm phân khu ở tab Thông tin của dự án trước khi thêm căn.";
  // Tòa nhà phải thuộc phân khu đang chọn (dự án cao tầng)
  const buildings = catalog.buildings.filter((b) => b.zoneId === zoneId);
  const building = buildings.find((b) => b.id === buildingId);
  const e = (k: keyof Values) => errors[k]?.message;
  const bad = (k: keyof Values) => (errors[k] ? true : undefined);
  const num = { valueAsNumber: true } as const;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-footer/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        ref={root}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="property-form-title"
        tabIndex={-1}
        onClick={(ev) => ev.stopPropagation()}
        onSubmit={handleSubmit(({ projectId: _p, ...rest }) =>
          // Căn thấp tầng không có tòa nhà / tầng / trục / số phòng ngủ
          onSubmit(
            highRise
              ? rest
              : {
                  ...rest,
                  buildingId: null,
                  floor: null,
                  axis: null,
                  bedrooms: null,
                },
            { add: newFiles.map((n) => n.file), removeIds }
          )
        )}
        className="animate-page-in flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-line p-6">
          <h2
            id="property-form-title"
            className="text-xl font-bold text-footer"
          >
            {property
              ? `Chỉnh sửa căn ${property.propertyCode}`
              : "Thêm quỹ căn"}
          </h2>
          <p className="mt-1 text-sm text-body">
            Các trường có dấu * là thông tin bắt buộc.
          </p>
        </div>

        <div className="grid gap-x-6 gap-y-4 overflow-y-auto p-6 sm:grid-cols-2">
          {lockProject ? (
            <div>
              <span className="text-sm font-semibold text-footer">Dự án</span>
              <p className="mt-1.5 flex h-11 items-center rounded-xl bg-primary-50/60 px-4 text-sm font-semibold text-footer">
                {catalog.projects.find((p) => p.id === projectId)?.name}
              </p>
              <input type="hidden" {...register("projectId", num)} />
            </div>
          ) : (
            <Field label="Dự án" error={e("projectId")}>
              <select
                {...register("projectId", {
                  ...num,
                  onChange: () => {
                    setValue("zoneId", 0);
                    setValue("buildingId", null);
                  },
                })}
                aria-invalid={bad("projectId")}
                className={input}
              >
                <option value={0}>Chọn dự án</option>
                {catalog.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Phân khu" error={e("zoneId")} hint={zoneHint}>
            <select
              {...register("zoneId", {
                ...num,
                onChange: () => setValue("buildingId", null),
              })}
              aria-invalid={bad("zoneId")}
              disabled={!projectId}
              className={input}
            >
              <option value={0}>
                {zones.length === 0 && projectId
                  ? "Dự án chưa có phân khu"
                  : "Chọn phân khu"}
              </option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </Field>
          {highRise && (
            <Field
              label="Tòa nhà"
              error={e("buildingId")}
              hint={
                zoneId && buildings.length === 0
                  ? "Phân khu này chưa có tòa nhà. Thêm tòa ở mục Tòa nhà của dự án trước."
                  : undefined
              }
            >
              <select
                {...register("buildingId", {
                  setValueAs: (v: unknown) =>
                    v === "" || v == null || Number(v) === 0 ? null : Number(v),
                })}
                aria-invalid={bad("buildingId")}
                disabled={!zoneId}
                className={input}
              >
                <option value="">
                  {zoneId ? "Chọn tòa nhà" : "Chọn phân khu trước"}
                </option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.floors} tầng)
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Mã căn" error={e("propertyCode")}>
            <input
              {...register("propertyCode")}
              aria-invalid={bad("propertyCode")}
              placeholder="Ví dụ: A1-1208"
              className={input}
            />
          </Field>
          <Field label="Trạng thái" error={e("status")}>
            <select {...register("status")} className={input}>
              {Object.entries(PROPERTY_STATUS).map(([k, s]) => (
                <option key={k} value={k}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Diện tích (m²)" error={e("area")}>
            <input
              type="number"
              step="any"
              {...register("area", num)}
              aria-invalid={bad("area")}
              className={input}
            />
          </Field>
          <Field
            label="Giá bán (VNĐ)"
            error={e("price")}
            hint={price > 0 ? `≈ ${formatPrice(price)}` : undefined}
          >
            <input
              type="number"
              step="any"
              {...register("price", num)}
              aria-invalid={bad("price")}
              className={input}
            />
          </Field>
          <Field label="Hướng" error={e("direction")}>
            <select
              {...register("direction")}
              aria-invalid={bad("direction")}
              className={input}
            >
              <option value="">Chọn hướng</option>
              {DIRECTIONS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          {highRise && (
            <>
              <Field
                label="Tầng"
                error={e("floor")}
                hint={building ? `Từ 1 đến ${building.floors}` : undefined}
              >
                <input
                  type="number"
                  min={1}
                  max={building?.floors}
                  {...register("floor", nullableNumber)}
                  aria-invalid={bad("floor")}
                  className={input}
                />
              </Field>
              <Field
                label="Trục"
                error={e("axis")}
                hint="Vị trí căn trên mỗi tầng, vd 01, 08"
              >
                <input
                  {...register("axis")}
                  maxLength={20}
                  aria-invalid={bad("axis")}
                  placeholder="Ví dụ: 08"
                  className={input}
                />
              </Field>
              <Field label="Số phòng ngủ" error={e("bedrooms")}>
                <input
                  type="number"
                  {...register("bedrooms", nullableNumber)}
                  aria-invalid={bad("bedrooms")}
                  placeholder="0 = Studio"
                  className={input}
                />
              </Field>
            </>
          )}
          <Field
            label="Loại hình"
            error={e("type")}
            hint="Chọn loại hình đã có của dự án hoặc nhập loại hình mới"
          >
            <input
              {...register("type")}
              list="property-type-options"
              aria-invalid={bad("type")}
              placeholder="Ví dụ: Biệt thự, Liền kề..."
              className={input}
            />
            <datalist id="property-type-options">
              {typeOptions.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </Field>
          <Field
            label="Diện tích xây dựng (m²)"
            optional
            error={e("constructionArea")}
          >
            <input
              type="number"
              step="any"
              {...register("constructionArea", nullableNumber)}
              aria-invalid={bad("constructionArea")}
              className={input}
            />
          </Field>
          <Field
            label="Chiết khấu thanh toán sớm (%)"
            optional
            error={e("prepaymentDiscountRate")}
          >
            <input
              type="number"
              step="any"
              {...register("prepaymentDiscountRate", nullableNumber)}
              aria-invalid={bad("prepaymentDiscountRate")}
              className={input}
            />
          </Field>
          <Field
            label="Giá vay (VNĐ)"
            optional
            error={e("loanPrice")}
            hint={
              loanPrice != null && loanPrice > 0
                ? `≈ ${formatPrice(loanPrice)}`
                : undefined
            }
          >
            <input
              type="number"
              step="any"
              {...register("loanPrice", nullableNumber)}
              aria-invalid={bad("loanPrice")}
              className={input}
            />
          </Field>
          <Field
            label="Tiêu chuẩn bàn giao"
            optional
            error={e("handoverStandard")}
          >
            <input
              {...register("handoverStandard")}
              list="handover-options"
              placeholder="Ví dụ: Thô"
              className={input}
            />
            <datalist id="handover-options">
              {HANDOVER.map((h) => (
                <option key={h} value={h} />
              ))}
            </datalist>
          </Field>
          <Field label="Quỹ căn" optional error={e("propertyInventoryType")}>
            <select {...register("propertyInventoryType")} className={input}>
              <option value="">Chưa phân loại</option>
              {INVENTORY.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Ngày áp dụng chính sách bán hàng"
            optional
            error={e("salesPolicyEffectiveDate")}
          >
            <input
              type="date"
              {...register("salesPolicyEffectiveDate")}
              className={input}
            />
          </Field>
          <Field label="Quà tặng" optional error={e("gift")}>
            <input
              {...register("gift")}
              placeholder="Ví dụ: Tặng gói nội thất 500 triệu"
              className={input}
            />
          </Field>

          <Field
            label="Phiếu tính giá (đường dẫn)"
            optional
            error={e("pricingSheet")}
          >
            <input
              {...register("pricingSheet")}
              aria-invalid={bad("pricingSheet")}
              placeholder="https://..."
              className={input}
            />
          </Field>
          <Field label="Layout (đường dẫn)" optional error={e("layoutUrl")}>
            <input
              {...register("layoutUrl")}
              aria-invalid={bad("layoutUrl")}
              placeholder="https://..."
              className={input}
            />
          </Field>
          <Field
            label="Tóm tắt chính sách (đường dẫn)"
            optional
            error={e("salesPolicySummaryUrl")}
          >
            <input
              {...register("salesPolicySummaryUrl")}
              aria-invalid={bad("salesPolicySummaryUrl")}
              placeholder="https://..."
              className={input}
            />
          </Field>
          <Field
            label="Chi tiết chính sách (đường dẫn)"
            optional
            error={e("salesPolicyDetailUrl")}
          >
            <input
              {...register("salesPolicyDetailUrl")}
              aria-invalid={bad("salesPolicyDetailUrl")}
              placeholder="https://..."
              className={input}
            />
          </Field>

          <div className="sm:col-span-2">
            <span className="text-sm font-semibold text-footer">
              Hình ảnh căn{" "}
              <span className="text-xs font-normal text-muted">
                (tối đa 10 MB/ảnh)
              </span>
            </span>
            <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {savedImages.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.imageUrl}
                    alt="Ảnh căn"
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setRemoveIds((cur) => [...cur, img.id])}
                    aria-label="Xóa ảnh"
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-danger shadow"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              {newFiles.map((n, i) => (
                <div key={n.preview} className="relative">
                  <img
                    src={n.preview}
                    alt="Ảnh mới"
                    className="aspect-[4/3] w-full rounded-xl border border-dashed border-primary-300 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setNewFiles((cur) => cur.filter((_, k) => k !== i))
                    }
                    aria-label="Bỏ ảnh"
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-danger shadow"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => picker.current?.click()}
                className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-primary-300 bg-primary-50/40 text-xs font-semibold text-primary-700 transition hover:bg-primary-50"
              >
                + Thêm ảnh
              </button>
            </div>
            <input
              ref={picker}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(ev) => {
                pickFiles(ev.target.files);
                ev.target.value = "";
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
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
              : property
              ? "Lưu thay đổi"
              : "Thêm căn"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
