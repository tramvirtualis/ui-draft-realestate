import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Play, X } from "lucide-react";
import useFocusTrap from "../../../common/useFocusTrap";
import { parseVideoSource, type VideoSource } from "../../../../utils/videoSource";

type Props = {
  url: string;
  title: string;
};

const SOURCE_LABEL: Record<VideoSource["kind"], string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  file: "Video",
  link: "Liên kết ngoài",
};

// Trình phát dạng cửa sổ nổi: video chỉ tải khi khách mở
function VideoDialog({ source, title, onClose }: { source: VideoSource; title: string; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useFocusTrap(root, true, onClose);
  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-ink-950/85 p-4 backdrop-blur-sm" onClick={onClose} role="presentation">
      <div
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-label={`Video: ${title}`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="animate-page-in w-full max-w-5xl outline-none"
      >
        <div className="mb-3 flex items-center justify-between gap-4 text-white">
          <p className="truncate font-semibold">{title}</p>
          <button type="button" onClick={onClose} aria-label="Đóng video" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 hover:bg-white/25">
            <X size={18} />
          </button>
        </div>
        <div className="relative aspect-video overflow-hidden bg-black shadow-2xl">
          {source.kind === "file" ? (
            <video src={source.src} controls autoPlay className="absolute inset-0 h-full w-full object-contain" />
          ) : (
            source.kind !== "link" && (
              <iframe
                title={title}
                src={source.embed}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            )
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// Nút play tròn của một giai đoạn tiến độ, bấm mới mở trình phát (link ngoài thì mở tab mới)
export default function ProgressVideo({ url, title }: Props) {
  const [open, setOpen] = useState(false);
  const source = parseVideoSource(url);
  const external = source.kind === "link";

  const play = () => {
    if (external) window.open(source.src, "_blank", "noopener,noreferrer");
    else setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={play}
        aria-label={`Xem video: ${title}`}
        title={`Xem video (${SOURCE_LABEL[source.kind]})`}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-[#ffffff] shadow-[0_8px_20px_-8px_rgba(201,153,31,0.9)] transition hover:scale-110 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 active:scale-95"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-primary-600/40 [animation-duration:2s]" aria-hidden />
        {external ? <ExternalLink size={16} className="relative" /> : <Play size={16} className="relative ml-0.5 fill-current" />}
      </button>
      {open && <VideoDialog source={source} title={title} onClose={() => setOpen(false)} />}
    </>
  );
}
