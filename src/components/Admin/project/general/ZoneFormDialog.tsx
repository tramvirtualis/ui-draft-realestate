import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SafeImage from "../../../common/SafeImage";
import useFocusTrap from "../../../common/useFocusTrap";
import { ZONE_STATUSES } from "../../../../data/project/mockAdminProjects";
import type { AdminZone } from "../../../../types/project/adminProject.types";

// Zones: name, description, status; ảnh phân khu chọn riêng bên dưới
const schema = z.object({
  name: z.string().trim().min(1, "Nhập tên phân khu"),
  description: z.string().trim(),
  status: z.string().trim(),
});
type Values = z.infer<typeof schema>;

type Props = {
  zone: AdminZone | null; // null = thêm mới
  onSave: (data: Values & { imageUrl: string | null; imageFile?: File }) => void;
  onClose: () => void;
};

const input = "w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100 aria-[invalid=true]:border-danger";

export default function ZoneFormDialog({ zone, onSave, onClose }: Props) {
  const root = useRef<HTMLFormElement>(null);
  useFocusTrap(root, true, onClose);
  const fileInput = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(zone?.imageUrl ?? null);
  const [imageFile, setImageFile] = useState<File | undefined>(zone?.imageFile);

  const pickImage = (f?: File) => {
    if (!f) return;
    setImage(URL.createObjectURL(f)); // xem trước, file thật gửi lên khi lưu dự án
    setImageFile(f);
  };

  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: zone ? { name: zone.name, description: zone.description, status: zone.status } : { name: "", description: "", status: ZONE_STATUSES[0] },
  });

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-footer/40 px-4 backdrop-blur-sm" onClick={onClose}>
      <form
        ref={root}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="zone-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          // form này nằm trong form dự án (qua portal): chặn submit nổi bọt lên form cha
          e.stopPropagation();
          void handleSubmit((v) => onSave({ ...v, imageUrl: image, imageFile }))(e);
        }}
        className="animate-page-in w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-line p-6">
          <h2 id="zone-title" className="text-xl font-bold text-footer">{zone ? "Chỉnh sửa phân khu" : "Thêm phân khu"}</h2>
        </div>
        <div className="space-y-4 p-6">
          <label className="block">
            <span className="text-sm font-semibold text-footer">Tên phân khu <span className="text-danger">*</span></span>
            <input {...register("name")} aria-invalid={errors.name ? true : undefined} className={`${input} mt-1.5 h-11`} />
            {errors.name && <span role="alert" className="mt-1 block text-xs text-danger">{errors.name.message}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-footer">Trạng thái</span>
            <select {...register("status")} className={`${input} mt-1.5 h-11`}>
              {ZONE_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <div>
            <span className="text-sm font-semibold text-footer">Ảnh phân khu</span>
            {image ? (
              <SafeImage src={image} alt="Ảnh phân khu" className="mt-1.5 h-36 w-full rounded-lg border border-dashed border-primary-300 object-cover" />
            ) : (
              <div className="mt-1.5 flex h-20 items-center justify-center rounded-lg border border-dashed border-primary-200 bg-primary-50/40 text-xs text-muted">Chưa có ảnh</div>
            )}
            <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => pickImage(e.target.files?.[0])} />
            <button type="button" onClick={() => fileInput.current?.click()} className="mt-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-footer transition hover:bg-primary-50">
              {image ? "Thay ảnh" : "Chọn ảnh"}
            </button>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-footer">Mô tả</span>
            <textarea {...register("description")} rows={3} className={`${input} mt-1.5 py-3`} />
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50">Hủy</button>
          <button type="submit" className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95">Lưu phân khu</button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
