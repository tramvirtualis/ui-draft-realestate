import { useState, type ImgHTMLAttributes } from "react";
import { ImageOff } from "lucide-react";

// Ảnh có fallback khi tải lỗi, giữ nguyên khung nên bố cục không bị nhảy
export default function SafeImage({ className = "", alt, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div role="img" aria-label={alt} className={`flex items-center justify-center bg-primary-50 text-primary-300 ${className}`}>
        <ImageOff size={28} />
      </div>
    );
  }
  return <img loading="lazy" alt={alt} onError={() => setFailed(true)} className={className} {...rest} />;
}
