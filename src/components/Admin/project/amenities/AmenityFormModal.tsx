import { useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { ImagePlus } from "lucide-react";
import useFocusTrap from "../../../common/useFocusTrap";
import type { AmenityDto } from "../../../../types/project/project.types";

type Props = {
  amenity: AmenityDto | null; // null = thêm mới
  submitting: boolean;
  onSubmit: (name: string, image?: File) => void;
  onClose: () => void;
};

const MAX_SIZE = 10 * 1024 * 1024;
const field = "h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

export default function AmenityFormModal({ amenity, submitting, onSubmit, onClose }: Props) {
  const root = useRef<HTMLFormElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  useFocusTrap(root, true, onClose);

  const [name, setName] = useState(amenity?.name ?? "");
  const [file, setFile] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | null>(amenity?.imageUrl ?? null);
  const [error, setError] = useState("");

  const pick = (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/") || f.size > MAX_SIZE) {
      setError("Chỉ nhận ảnh, tối đa 10 MB");
      return;
    }
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Nhập tên tiện ích");
    setError("");
    onSubmit(name, file);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-footer/40 px-4 backdrop-blur-sm" onClick={onClose}>
      <form
        ref={root}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="amenity-form-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="animate-page-in flex max-h-[92vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-line p-6">
          <h2 id="amenity-form-title" className="text-xl font-bold text-footer">{amenity ? "Chỉnh sửa tiện ích" : "Thêm tiện ích"}</h2>
          <p className="mt-1 text-sm text-body">Ví dụ: Hồ bơi vô cực, Công viên ven sông, Phòng gym...</p>
        </div>

        <div className="space-y-5 overflow-y-auto p-6">
          <label className="block">
            <span className="text-sm font-semibold text-footer">Tên tiện ích <span className="text-danger">*</span></span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} className={`${field} mt-1.5`} />
          </label>

          <div>
            <span className="text-sm font-semibold text-footer">Ảnh tiện ích <span className="text-xs font-normal text-muted">(tối đa 10 MB)</span></span>
            <button
              type="button"
              onClick={() => picker.current?.click()}
              className="group relative mt-1.5 flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-primary-300 bg-primary-50/40 transition hover:bg-primary-50"
            >
              {preview ? (
                <>
                  <img src={preview} alt="Ảnh tiện ích" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-footer/40 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    Thay ảnh
                  </span>
                </>
              ) : (
                <span className="flex flex-col items-center gap-2 text-sm font-semibold text-primary-700">
                  <ImagePlus size={26} /> Chọn ảnh từ máy
                </span>
              )}
            </button>
            <input ref={picker} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
          </div>

          {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50">Hủy</button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60">
            {submitting ? "Đang lưu..." : amenity ? "Lưu thay đổi" : "Thêm tiện ích"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
