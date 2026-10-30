import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useImageCarousel } from "../../../hooks/social/useImageCarousel";

type Props = {
  images: string[];
  startIndex?: number;
  onClose: () => void;
};

// Khung xem ảnh nền đen bên trái modal bài viết, có nút trước/sau
export default function ImageViewer({ images, startIndex = 0, onClose }: Props) {
  const { index, prev, next } = useImageCarousel(images.length, startIndex);

  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center">
      <button
        onClick={onClose}
        aria-label="Đóng"
        className="absolute left-4 top-4 z-10 rounded-full p-2 text-white hover:bg-white/20"
      >
        <X size={28} />
      </button>
      <img src={images[index]} alt="" className="max-h-full max-w-full object-contain" />
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Ảnh trước"
            className="absolute left-4 rounded-full p-2 text-white hover:bg-white/20"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={next}
            aria-label="Ảnh sau"
            className="absolute right-4 rounded-full p-2 text-white hover:bg-white/20"
          >
            <ChevronRight size={32} />
          </button>
          <span className="absolute bottom-4 rounded-full bg-black/60 px-4 py-1 text-sm font-semibold text-white">
            {index + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
}
