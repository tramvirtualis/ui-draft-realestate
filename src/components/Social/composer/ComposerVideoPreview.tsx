import { CheckCircle2, X } from "lucide-react";
import { formatFileSize } from "../../../utils/text";

type Props = {
  file: File | null;
  url: string | null;
  unplayable: boolean;
  disabled?: boolean;
  onUnplayable: () => void;
  onRemove: () => void;
};

export default function ComposerVideoPreview({ file, url, unplayable, disabled, onUnplayable, onRemove }: Props) {
  if (!file || !url) return null;
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-green-200">
      <div className="relative bg-black">
        {/* #t=0.1 để trình duyệt vẽ khung hình đầu làm ảnh xem trước */}
        <video
          key={url}
          src={`${url}#t=0.1`}
          controls
          preload="metadata"
          onError={onUnplayable}
          className="max-h-72 w-full"
        />
        {unplayable && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-white/80">
            Trình duyệt không xem trước được định dạng này, video vẫn đăng bình thường
          </div>
        )}
        {!disabled && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Bỏ video"
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 bg-green-50 px-3 py-2 text-sm text-green-700">
        <CheckCircle2 size={16} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate font-medium">{file.name}</span>
        <span className="shrink-0 text-xs">{formatFileSize(file.size)}</span>
      </div>
    </div>
  );
}
