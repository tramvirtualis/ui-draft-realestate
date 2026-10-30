import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import SafeImage from "../../../common/SafeImage";
import useFocusTrap from "../../../common/useFocusTrap";
import type { BuildingDto, BuildingInput } from "../../../../types/project/building.types";
import type { ZoneDto } from "../../../../types/project/project.types";

type Props = {
  building: BuildingDto | null; // null = thêm mới
  zones: ZoneDto[]; // phân khu của dự án
  defaultZoneId: number | null;
  submitting: boolean;
  onSubmit: (input: BuildingInput) => void;
  onClose: () => void;
};

const MAX_FLOORS = 200; // khớp BuildingRequest
const field = "h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

// Thêm / sửa tòa nhà: phân khu chứa tòa, tên tòa, số tầng
export default function BuildingFormModal({ building, zones, defaultZoneId, submitting, onSubmit, onClose }: Props) {
  const root = useRef<HTMLFormElement>(null);
  useFocusTrap(root, true, onClose);

  const [zoneId, setZoneId] = useState<number>(building?.zoneId ?? defaultZoneId ?? zones[0]?.id ?? 0);
  const [name, setName] = useState(building?.name ?? "");
  const [floors, setFloors] = useState(building ? String(building.floors) : "");
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(building?.imageUrl ?? null);
  const [imageFile, setImageFile] = useState<File | undefined>();

  useEffect(() => () => {
    if (image?.startsWith("blob:")) URL.revokeObjectURL(image);
  }, [image]);

  const pickImage = (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Chỉ chọn được file ảnh");
    setError("");
    setImage(URL.createObjectURL(f)); // xem trước, file thật gửi lên khi lưu
    setImageFile(f);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(floors);
    if (!zoneId) return setError("Chọn phân khu của tòa nhà");
    if (!name.trim()) return setError("Nhập tên tòa nhà");
    if (!Number.isInteger(n) || n < 1 || n > MAX_FLOORS) return setError(`Số tầng phải là số nguyên từ 1 đến ${MAX_FLOORS}`);
    setError("");
    onSubmit({ zoneId, name, floors: n, imageFile });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-footer/40 px-4 backdrop-blur-sm" onClick={onClose}>
      <form
        ref={root}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="building-form-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="animate-page-in flex max-h-[92vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-line p-6">
          <h2 id="building-form-title" className="text-xl font-bold text-footer">{building ? `Sửa tòa ${building.name}` : "Thêm tòa nhà"}</h2>
          <p className="mt-1 text-sm text-body">Các trường có dấu * là thông tin bắt buộc.</p>
        </div>

        <div className="space-y-5 overflow-y-auto p-6">
          <label className="block">
            <span className="text-sm font-semibold text-footer">Phân khu <span className="text-danger">*</span></span>
            <select value={zoneId} onChange={(e) => setZoneId(Number(e.target.value))} className={`${field} mt-1.5`}>
              <option value={0}>Chọn phân khu</option>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-footer">Tên tòa nhà <span className="text-danger">*</span></span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} placeholder="Ví dụ: Tòa A1" className={`${field} mt-1.5`} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-footer">Số tầng <span className="text-danger">*</span></span>
            <input type="number" min={1} max={MAX_FLOORS} value={floors} onChange={(e) => setFloors(e.target.value)} placeholder="Ví dụ: 35" className={`${field} mt-1.5`} />
          </label>
          <div>
            <span className="text-sm font-semibold text-footer">Ảnh tòa nhà</span>
            {image ? (
              <SafeImage src={image} alt="Ảnh tòa nhà" className="mt-1.5 h-40 w-full rounded-lg border border-dashed border-primary-300 object-cover" />
            ) : (
              <div className="mt-1.5 flex h-20 items-center justify-center rounded-lg border border-dashed border-primary-200 bg-primary-50/40 text-xs text-muted">Chưa có ảnh</div>
            )}
            <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => { pickImage(e.target.files?.[0]); e.target.value = ""; }} />
            <button type="button" onClick={() => fileInput.current?.click()} className="mt-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-footer transition hover:bg-primary-50">
              {image ? "Thay ảnh" : "Chọn ảnh"}
            </button>
          </div>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50">Hủy</button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60">
            {submitting ? "Đang lưu..." : building ? "Lưu thay đổi" : "Thêm tòa nhà"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
