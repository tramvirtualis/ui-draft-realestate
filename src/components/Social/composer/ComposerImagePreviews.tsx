import { X } from "lucide-react";

type Props = {
  urls: string[];
  disabled?: boolean;
  onRemove: (index: number) => void;
};

export default function ComposerImagePreviews({ urls, disabled, onRemove }: Props) {
  if (urls.length === 0) return null;
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
      {urls.map((url, i) => (
        <div key={url} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <img src={url} alt="" className="h-full w-full object-cover" />
          {!disabled && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label="Bỏ ảnh"
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
