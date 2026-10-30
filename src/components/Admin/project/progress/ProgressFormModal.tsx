import { useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import useFocusTrap from "../../../common/useFocusTrap";
import { isYoutubeUrl } from "../../../../utils/videoSource";
import type { ProgressInput } from "../../../../services/project/progressService";
import type { Progress } from "../../../../types/project/progress.types";

type Props = {
  progress: Progress | null; // null = thêm mới
  submitting: boolean;
  onSubmit: (input: ProgressInput, files: File[], removeIds: number[]) => void;
  onClose: () => void;
};

const MAX_IMAGES = 10;
const MAX_SIZE = 10 * 1024 * 1024;
const field = "w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100 aria-[invalid=true]:border-danger";

export default function ProgressFormModal({ progress, submitting, onSubmit, onClose }: Props) {
  const root = useRef<HTMLFormElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  useFocusTrap(root, true, onClose);

  const [title, setTitle] = useState(progress?.title ?? "");
  const [reportDate, setReportDate] = useState(() => progress?.reportDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState(progress?.content ?? "");
  // Link YouTube của giai đoạn (không bắt buộc); xóa trống rồi lưu là gỡ video
  const [videoUrl, setVideoUrl] = useState(progress?.videoUrl ?? "");
  const [removeIds, setRemoveIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<{ file: File; preview: string }[]>([]);
  const [error, setError] = useState("");

  const saved = (progress?.images ?? []).filter((i) => !removeIds.includes(i.id));
  const total = saved.length + newFiles.length;

  const pick = (list: FileList | null) => {
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith("image/") && f.size <= MAX_SIZE);
    const room = MAX_IMAGES - total;
    setNewFiles((cur) => [...cur, ...files.slice(0, Math.max(0, room)).map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    if (files.length > room) setError(`Mỗi báo cáo tối đa ${MAX_IMAGES} ảnh`);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!title.trim()) return setError("Nhập tiêu đề tiến độ");
    if (!reportDate) return setError("Chọn ngày báo cáo");
    if (videoUrl.trim() && !isYoutubeUrl(videoUrl)) return setError("Video chỉ nhận đường dẫn YouTube (youtube.com hoặc youtu.be)");
    setError("");
    onSubmit({ title, content, reportDate, videoUrl }, newFiles.map((n) => n.file), removeIds);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-footer/40 px-4 backdrop-blur-sm" onClick={onClose}>
      <form
        ref={root}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="progress-form-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="animate-page-in flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-line p-6">
          <h2 id="progress-form-title" className="text-xl font-bold text-footer">{progress ? "Chỉnh sửa tiến độ" : "Thêm tiến độ"}</h2>
          <p className="mt-1 text-sm text-body">Các trường có dấu * là thông tin bắt buộc.</p>
        </div>

        <div className="space-y-4 overflow-y-auto p-6">
          <label className="block">
            <span className="text-sm font-semibold text-footer">Tiêu đề <span className="text-danger">*</span></span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} aria-invalid={!title.trim() && !!error ? true : undefined} className={`${field} mt-1.5 h-11`} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-footer">Ngày báo cáo <span className="text-danger">*</span></span>
            <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className={`${field} mt-1.5 h-11`} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-footer">Nội dung</span>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} className={`${field} mt-1.5 py-3`} />
          </label>

          <div>
            <span className="text-sm font-semibold text-footer">Hình ảnh <span className="text-xs font-normal text-muted">({total}/{MAX_IMAGES}, tối đa 10 MB/ảnh)</span></span>
            <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {saved.map((img) => (
                <div key={img.id} className="relative">
                  <img src={img.imageUrl} alt="Ảnh tiến độ" className="aspect-[4/3] w-full rounded-xl object-cover" />
                  <button type="button" onClick={() => setRemoveIds((cur) => [...cur, img.id])} aria-label="Xóa ảnh" className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-danger shadow">
                    <X size={13} />
                  </button>
                </div>
              ))}
              {newFiles.map((n, i) => (
                <div key={n.preview} className="relative">
                  <img src={n.preview} alt="Ảnh mới" className="aspect-[4/3] w-full rounded-xl border border-dashed border-primary-300 object-cover" />
                  <button type="button" onClick={() => setNewFiles((cur) => cur.filter((_, k) => k !== i))} aria-label="Bỏ ảnh" className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-danger shadow">
                    <X size={13} />
                  </button>
                </div>
              ))}
              {total < MAX_IMAGES && (
                <button type="button" onClick={() => picker.current?.click()} className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-primary-300 bg-primary-50/40 text-xs font-semibold text-primary-700 transition hover:bg-primary-50">
                  + Thêm ảnh
                </button>
              )}
            </div>
            <input ref={picker} type="file" accept="image/*" multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = ""; }} />
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-footer">Link video YouTube</span>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className={`${field} mt-1.5 h-11`}
            />
          </label>

          {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50">Hủy</button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60">
            {submitting ? "Đang lưu..." : progress ? "Lưu thay đổi" : "Thêm tiến độ"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
