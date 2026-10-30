import { useEffect, useRef } from "react";
import { Film, ImagePlus, Trash2, Undo2, X } from "lucide-react";
import { POST_MAX_IMAGES, POST_MAX_VIDEO_SIZE, POST_VIDEO_TYPES, type AdminPostImage } from "../../../types/social/social.types";

type Picked = { file: File; preview: string };

// Phần ảnh / video người dùng đã thay đổi so với bản đã lưu
export type PostMediaChange = {
  removedImageIds: number[];
  newImages: Picked[];
  newVideo: Picked | null;
  removeVideo: boolean;
};

export const EMPTY_MEDIA_CHANGE: PostMediaChange = { removedImageIds: [], newImages: [], newVideo: null, removeVideo: false };

export const isMediaChanged = (m: PostMediaChange) =>
  m.removedImageIds.length > 0 || m.newImages.length > 0 || m.newVideo !== null || m.removeVideo;

type Props = {
  savedImages: AdminPostImage[];
  savedVideoUrl: string | null;
  value: PostMediaChange;
  onChange: (next: PostMediaChange) => void;
  onError: (message: string) => void;
  disabled?: boolean;
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const tile = "relative aspect-[4/3] overflow-hidden rounded-xl bg-primary-50";
const removeBtn = "absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-danger shadow transition hover:bg-white";
const addTile = "flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-primary-300 bg-primary-50/40 text-xs font-semibold text-primary-700 transition hover:bg-primary-50 disabled:opacity-50";

// Ảnh + video của bài: xem ảnh/video hiện có, xóa, thêm ảnh mới, thêm / đổi / gỡ video
export default function PostMediaEditor({ savedImages, savedVideoUrl, value, onChange, onError, disabled }: Props) {
  const imagePicker = useRef<HTMLInputElement>(null);
  const videoPicker = useRef<HTMLInputElement>(null);

  // Giải phóng ảnh/video xem trước (blob) còn lại khi rời trang
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);
  useEffect(
    () => () => {
      latest.current.newImages.forEach((n) => URL.revokeObjectURL(n.preview));
      if (latest.current.newVideo) URL.revokeObjectURL(latest.current.newVideo.preview);
    },
    [],
  );

  const visibleSaved = savedImages.filter((i) => !value.removedImageIds.includes(i.id));
  const total = visibleSaved.length + value.newImages.length;

  const pickImages = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    const valid = files.filter((f) => f.type.startsWith("image/") && f.size <= MAX_IMAGE_SIZE);
    if (valid.length < files.length) onError("Chỉ nhận file ảnh, tối đa 10 MB mỗi ảnh");
    const room = POST_MAX_IMAGES - total;
    if (valid.length > room) onError(`Mỗi bài tối đa ${POST_MAX_IMAGES} ảnh`);
    const accepted = valid.slice(0, Math.max(0, room));
    if (accepted.length === 0) return;
    onChange({ ...value, newImages: [...value.newImages, ...accepted.map((file) => ({ file, preview: URL.createObjectURL(file) }))] });
  };

  const dropNewImage = (index: number) => {
    URL.revokeObjectURL(value.newImages[index].preview);
    onChange({ ...value, newImages: value.newImages.filter((_, k) => k !== index) });
  };

  const pickVideo = (file?: File) => {
    if (!file) return;
    if (!POST_VIDEO_TYPES.includes(file.type)) return onError("Video chỉ hỗ trợ MP4, WEBM hoặc MOV");
    if (file.size > POST_MAX_VIDEO_SIZE) return onError("Video tối đa 20 MB");
    if (value.newVideo) URL.revokeObjectURL(value.newVideo.preview);
    onChange({ ...value, newVideo: { file, preview: URL.createObjectURL(file) } });
  };

  const dropVideo = () => {
    if (value.newVideo) {
      URL.revokeObjectURL(value.newVideo.preview);
      // bỏ video mới chọn: có video cũ thì quay lại video cũ, muốn gỡ hẳn thì bấm gỡ lần nữa
      onChange({ ...value, newVideo: null });
    } else {
      onChange({ ...value, removeVideo: true });
    }
  };

  const shownVideo = value.newVideo?.preview ?? (value.removeVideo ? null : savedVideoUrl);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-footer">
          Hình ảnh <span className="text-xs font-normal text-muted">({total}/{POST_MAX_IMAGES} ảnh, tối đa 10 MB mỗi ảnh)</span>
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {visibleSaved.map((img) => (
            <div key={img.id} className={tile}>
              <img src={img.imageUrl} alt="Ảnh của bài viết" className="h-full w-full object-cover" />
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange({ ...value, removedImageIds: [...value.removedImageIds, img.id] })}
                aria-label="Xóa ảnh"
                className={removeBtn}
              >
                <X size={13} />
              </button>
            </div>
          ))}
          {value.newImages.map((n, i) => (
            <div key={n.preview} className={`${tile} ring-2 ring-primary-300`}>
              <img src={n.preview} alt="Ảnh mới thêm" className="h-full w-full object-cover" />
              <span className="absolute bottom-1.5 left-1.5 rounded bg-pop-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">Mới</span>
              <button type="button" onClick={() => dropNewImage(i)} aria-label="Bỏ ảnh mới" className={removeBtn}>
                <X size={13} />
              </button>
            </div>
          ))}
          {total < POST_MAX_IMAGES && (
            <button type="button" disabled={disabled} onClick={() => imagePicker.current?.click()} className={addTile}>
              <ImagePlus size={20} /> Thêm ảnh
            </button>
          )}
        </div>
        {value.removedImageIds.length > 0 && (
          <button
            type="button"
            onClick={() => onChange({ ...value, removedImageIds: [] })}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:underline"
          >
            <Undo2 size={13} /> Hoàn tác {value.removedImageIds.length} ảnh đã xóa
          </button>
        )}
        <input
          ref={imagePicker}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            pickImages(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-footer">
          Video <span className="text-xs font-normal text-muted">(MP4, WEBM, MOV, tối đa 20 MB, mỗi bài một video)</span>
        </p>
        {shownVideo ? (
          <div className="mt-2 max-w-xl">
            <video src={shownVideo} controls preload="metadata" className="aspect-video w-full rounded-xl bg-black" />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {value.newVideo && <span className="rounded bg-pop-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">Mới</span>}
              <button
                type="button"
                disabled={disabled}
                onClick={() => videoPicker.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-primary-50"
              >
                <Film size={14} /> Đổi video
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={dropVideo}
                className="inline-flex items-center gap-1.5 rounded-lg bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/20"
              >
                <Trash2 size={14} /> {value.newVideo ? "Bỏ video mới" : "Gỡ video"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button type="button" disabled={disabled} onClick={() => videoPicker.current?.click()} className={`${addTile} w-40`}>
              <Film size={20} /> Thêm video
            </button>
            {value.removeVideo && (
              <button
                type="button"
                onClick={() => onChange({ ...value, removeVideo: false })}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:underline"
              >
                <Undo2 size={13} /> Hoàn tác, giữ lại video cũ
              </button>
            )}
          </div>
        )}
        <input
          ref={videoPicker}
          type="file"
          accept={POST_VIDEO_TYPES.join(",")}
          hidden
          onChange={(e) => {
            pickVideo(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
