import { useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import useFocusTrap from "../../../common/useFocusTrap";
import { isYoutubeUrl } from "../../../../utils/videoSource";
import type { VideoInput } from "../../../../services/project/videoService";
import type { VideoDto } from "../../../../types/project/project.types";

type Props = {
  video: VideoDto | null; // null = thêm mới
  submitting: boolean;
  onSubmit: (input: VideoInput) => void;
  onClose: () => void;
};

const field = "w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

// Thêm / sửa video giới thiệu dự án: chỉ dùng link YouTube
export default function VideoFormModal({ video, submitting, onSubmit, onClose }: Props) {
  const root = useRef<HTMLFormElement>(null);
  useFocusTrap(root, true, onClose);

  const [name, setName] = useState(video?.name ?? "");
  const [description, setDescription] = useState(video?.description ?? "");
  const [url, setUrl] = useState(video?.videoUrl ?? "");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Nhập tên video");
    if (!isYoutubeUrl(url)) return setError("Nhập đường dẫn video YouTube (youtube.com hoặc youtu.be)");
    setError("");
    onSubmit({ name, description, videoUrl: url });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-footer/40 px-4 backdrop-blur-sm" onClick={onClose}>
      <form
        ref={root}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-form-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="animate-page-in flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-line p-6">
          <h2 id="video-form-title" className="text-xl font-bold text-footer">{video ? "Chỉnh sửa video" : "Thêm video"}</h2>
        </div>

        <div className="space-y-5 overflow-y-auto p-6">
          <label className="block">
            <span className="text-sm font-semibold text-footer">Tên video <span className="text-danger">*</span></span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} className={`${field} mt-1.5 h-11`} />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-footer">Link YouTube <span className="text-danger">*</span></span>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={`${field} mt-1.5 h-11`} />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-footer">Mô tả</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${field} mt-1.5 py-3`} />
          </label>

          {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50">Hủy</button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60">
            {submitting ? "Đang lưu..." : video ? "Lưu thay đổi" : "Thêm video"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
