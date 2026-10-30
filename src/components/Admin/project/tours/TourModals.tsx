import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRightLeft, ImagePlus, Info, X } from "lucide-react";
import AdminModal from "../../AdminModal";
import SafeImage from "../../../common/SafeImage";
import { coverUrl } from "../../../Project/Detail/tour/pannellum";
import type { HotspotType, TourHotspotDto, TourHotspotInput, TourSceneDto, TourSceneInput } from "../../../../types/project/tour.types";

const input =
  "h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";
const MAX_PANORAMA = 40 * 1024 * 1024;
const MAX_POPUP = 10 * 1024 * 1024;

function Field({ label, required = false, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-footer">{label} {required && <span className="text-danger">*</span>}</span>
      <span className="mt-1.5 block">{children}</span>
      {hint && <span className="mt-1 block text-xs text-body">{hint}</span>}
    </label>
  );
}

function Actions({ busy, label, onClose, disabled = false }: { busy: boolean; label: string; onClose: () => void; disabled?: boolean }) {
  return (
    <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
      <button type="button" onClick={onClose} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer hover:bg-primary-50">Hủy</button>
      <button type="submit" disabled={busy || disabled} className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50">
        {busy ? "Đang lưu..." : label}
      </button>
    </div>
  );
}

// Đọc kích thước ảnh ở trình duyệt để báo sớm nếu không phải panorama 2:1
function readSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error("decode"));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

async function checkPanorama(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) return "Chỉ nhận file ảnh (JPG, PNG, WebP).";
  if (file.size > MAX_PANORAMA) return "Ảnh panorama tối đa 40 MB.";
  try {
    const { width, height } = await readSize(file);
    const ratio = width / height;
    if (ratio < 1.9 || ratio > 2.1) return `Ảnh ${width}×${height} không phải panorama 360° (cần tỉ lệ 2:1, ví dụ 6000×3000).`;
    if (width < 2000) return `Ảnh quá nhỏ (${width}px), cần rộng tối thiểu 2000px.`;
    return "";
  } catch {
    return "Không đọc được ảnh, vui lòng chọn file khác.";
  }
}

// ---------------- Tour ----------------

export function TourFormModal({
  initial,
  busy,
  onSubmit,
  onClose,
}: {
  initial?: { title: string; description: string | null } | null;
  busy: boolean;
  onSubmit: (title: string, description: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) onSubmit(title.trim(), description.trim());
  };
  return (
    <AdminModal title={initial ? "Sửa thông tin tour" : "Tạo tour 360°"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="space-y-4 p-6">
          <Field label="Tên tour" required>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} autoFocus placeholder="Ví dụ: Tham quan toàn cảnh dự án" className={input} />
          </Field>
          <Field label="Mô tả">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={2000} className={`${input} h-auto py-2.5`} />
          </Field>
        </div>
        <Actions busy={busy} label={initial ? "Lưu thay đổi" : "Tạo tour"} onClose={onClose} disabled={!title.trim()} />
      </form>
    </AdminModal>
  );
}

// ---------------- Cảnh ----------------

export function SceneFormModal({
  scene,
  scenes,
  defaultParentId,
  busy,
  onSubmit,
  onClose,
}: {
  scene: TourSceneDto | null; // null = thêm mới
  scenes: TourSceneDto[];
  defaultParentId: number | null;
  busy: boolean;
  onSubmit: (input: TourSceneInput, image: File | null) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(scene?.title ?? "");
  const [parentId, setParentId] = useState<number | null>(scene ? scene.parentSceneId : defaultParentId);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  // Không cho chọn chính cảnh này hoặc cảnh con của nó làm cha (tránh vòng lặp)
  const blocked = new Set<number>();
  if (scene) {
    blocked.add(scene.id);
    let grew = true;
    while (grew) {
      grew = false;
      scenes.forEach((s) => {
        if (s.parentSceneId !== null && blocked.has(s.parentSceneId) && !blocked.has(s.id)) {
          blocked.add(s.id);
          grew = true;
        }
      });
    }
  }

  const pick = async (f?: File) => {
    if (!f) return;
    const err = await checkPanorama(f);
    setFileError(err);
    if (err) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || (!scene && !file)) return;
    onSubmit(
      { title: title.trim(), parentSceneId: parentId, initialYaw: scene?.initialYaw, initialPitch: scene?.initialPitch, initialHfov: scene?.initialHfov },
      file,
    );
  };

  return (
    <AdminModal title={scene ? `Sửa cảnh "${scene.title}"` : "Thêm cảnh 360°"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="space-y-4 p-6">
          <Field label="Tên cảnh" required>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} autoFocus placeholder="Ví dụ: Sảnh tòa A" className={input} />
          </Field>
          <Field label="Thuộc cảnh cha" hint="Dùng cho breadcrumb và nút quay lại của khách. Để trống nếu là cảnh gốc (toàn cảnh dự án).">
            <select value={parentId ?? ""} onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)} className={input}>
              <option value="">— Cảnh gốc —</option>
              {scenes.filter((s) => !blocked.has(s.id)).map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </Field>
          <Field
            label={scene ? "Thay ảnh panorama" : "Ảnh panorama"}
            required={!scene}
            hint="Ảnh 360° dạng equirectangular tỉ lệ 2:1 (ví dụ 6000×3000, 8000×4000), JPG/PNG/WebP, tối đa 40 MB."
          >
            <span className="flex flex-wrap items-center gap-3">
              <span className="relative inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary-300 bg-primary-50/40 px-4 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-50">
                <ImagePlus size={16} aria-hidden /> Chọn ảnh
                <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
              </span>
              {file && <span className="truncate text-xs text-body">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</span>}
            </span>
          </Field>
          {fileError && <p role="alert" className="text-sm text-danger">{fileError}</p>}
          {(preview || scene?.imageUrl) && (
            <SafeImage src={preview ?? coverUrl(scene!.imageUrl, 1000)} alt="Xem trước panorama" className="aspect-[2/1] w-full rounded-xl object-cover" />
          )}
        </div>
        <Actions busy={busy} label={scene ? "Lưu cảnh" : "Thêm cảnh"} onClose={onClose} disabled={!title.trim() || (!scene && !file)} />
      </form>
    </AdminModal>
  );
}

// ---------------- Điểm nóng ----------------

export function HotspotFormModal({
  hotspot,
  coords,
  scenes,
  currentSceneId,
  busy,
  onSubmit,
  onClose,
}: {
  hotspot: TourHotspotDto | null; // null = thêm mới tại coords
  coords: { yaw: number; pitch: number };
  scenes: TourSceneDto[];
  currentSceneId: number;
  busy: boolean;
  onSubmit: (input: TourHotspotInput, image: File | null) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<HotspotType>(hotspot?.type ?? "SCENE");
  const [title, setTitle] = useState(hotspot?.title ?? "");
  const [targetId, setTargetId] = useState<number | null>(hotspot?.targetSceneId ?? null);
  const [description, setDescription] = useState(hotspot?.description ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [fileError, setFileError] = useState("");
  const targets = scenes.filter((s) => s.id !== currentSceneId);

  const pick = (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/") || f.size > MAX_POPUP) {
      setFileError("Ảnh popup phải là file ảnh, tối đa 10 MB.");
      return;
    }
    setFileError("");
    setFile(f);
    setRemoveImage(false);
  };

  const valid = title.trim() && (type === "INFO" || targetId !== null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit(
      { type, title: title.trim(), yaw: coords.yaw, pitch: coords.pitch, targetSceneId: type === "SCENE" ? targetId : null, description: type === "INFO" ? description.trim() : "", removeImage },
      type === "INFO" ? file : null,
    );
  };

  const typeBtn = (t: HotspotType, label: string, icon: ReactNode) => (
    <button
      type="button"
      aria-pressed={type === t}
      onClick={() => setType(t)}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${type === t ? "border-primary-600 bg-primary-50 text-primary-700" : "border-line text-body hover:bg-primary-50/50"}`}
    >
      {icon} {label}
    </button>
  );

  return (
    <AdminModal title={hotspot ? "Sửa điểm" : "Thêm điểm trên ảnh 360°"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="space-y-4 p-6">
          <p className="rounded-lg bg-primary-50/60 px-3 py-2 text-xs text-body">
            Toạ độ: yaw <b className="tabular-nums">{coords.yaw.toFixed(2)}°</b> · pitch <b className="tabular-nums">{coords.pitch.toFixed(2)}°</b>
          </p>
          <div className="flex gap-2">
            {typeBtn("SCENE", "Chuyển cảnh", <ArrowRightLeft size={15} aria-hidden />)}
            {typeBtn("INFO", "Popup thông tin", <Info size={15} aria-hidden />)}
          </div>
          <Field label="Tên điểm" required>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} autoFocus placeholder={type === "SCENE" ? "Ví dụ: Vào phân khu A" : "Ví dụ: Hồ bơi tràn bờ"} className={input} />
          </Field>
          {type === "SCENE" ? (
            <Field label="Cảnh đích" required hint={targets.length === 0 ? "Tour chưa có cảnh khác: hãy thêm cảnh con trước rồi liên kết." : undefined}>
              <select value={targetId ?? ""} onChange={(e) => setTargetId(e.target.value ? Number(e.target.value) : null)} className={input}>
                <option value="">— Chọn cảnh —</option>
                {targets.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </Field>
          ) : (
            <>
              <Field label="Nội dung popup">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={5000} className={`${input} h-auto py-2.5`} />
              </Field>
              <Field label="Ảnh popup" hint="Tối đa 10 MB.">
                <span className="flex flex-wrap items-center gap-3">
                  <span className="relative inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary-300 bg-primary-50/40 px-4 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-50">
                    <ImagePlus size={16} aria-hidden /> {file || (hotspot?.imageUrl && !removeImage) ? "Đổi ảnh" : "Chọn ảnh"}
                    <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
                  </span>
                  {file && <span className="truncate text-xs text-body">{file.name}</span>}
                  {!file && hotspot?.imageUrl && !removeImage && (
                    <button type="button" onClick={() => setRemoveImage(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-danger hover:underline">
                      <X size={12} /> Bỏ ảnh hiện tại
                    </button>
                  )}
                </span>
              </Field>
              {fileError && <p role="alert" className="text-sm text-danger">{fileError}</p>}
            </>
          )}
        </div>
        <Actions busy={busy} label={hotspot ? "Lưu điểm" : "Thêm điểm"} onClose={onClose} disabled={!valid} />
      </form>
    </AdminModal>
  );
}
