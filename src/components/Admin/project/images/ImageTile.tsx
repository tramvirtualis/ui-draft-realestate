import { useState } from "react";
import { Maximize2, Trash2 } from "lucide-react";
import SafeImage from "../../../common/SafeImage";
import type { ProjectImage } from "../../../../types/project/projectImage.types";

type Props = {
  image: ProjectImage;
  label: string;
  date: string; // created_at đã định dạng
  index: number;
  onView: () => void;
  onDelete: () => void;
};

const action =
  "flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-footer shadow-lg backdrop-blur transition hover:bg-white focus-visible:outline-2 focus-visible:outline-white active:scale-90";

export default function ImageTile({ image, label, date, index, onView, onDelete }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure
      style={{ animationDelay: `${Math.min(index, 10) * 60}ms` }}
      className="animate-rise-in group relative mb-4 overflow-hidden rounded-2xl bg-primary-50 break-inside-avoid shadow-sm transition duration-500 hover:shadow-xl hover:shadow-primary-200/50"
    >
      <button onClick={onView} aria-label={`Xem ảnh ${label}`} className="block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-primary-600">
        {/* Giữ khung tạm trước khi ảnh tải xong để bố cục masonry không bị nhảy */}
        <div className={loaded ? "" : "aspect-[4/3] animate-pulse"}>
          <SafeImage
            src={image.imageUrl}
            alt={label}
            onLoad={() => setLoaded(true)}
            className="block h-auto w-full min-h-24 object-cover transition duration-700 ease-out group-hover:scale-105"
          />
        </div>
      </button>

      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between gap-3 bg-gradient-to-t from-footer/85 via-footer/40 to-transparent p-4 pt-12 opacity-0 transition duration-500 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-white" title={label}>{label}</span>
          <span className="block text-[11px] text-white/70">{date}</span>
        </span>
        <span className="pointer-events-auto flex shrink-0 gap-2">
          <button onClick={onView} aria-label={`Xem ảnh lớn ${label}`} title="Xem ảnh lớn" className={action}><Maximize2 size={16} /></button>
          <button onClick={onDelete} aria-label={`Xóa ảnh ${label}`} title="Xóa ảnh" className={`${action} text-danger`}><Trash2 size={16} /></button>
        </span>
      </figcaption>
    </figure>
  );
}
