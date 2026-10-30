import { useState } from "react";
import { initials } from "../../utils/user";

interface AvatarProps {
  src?: string | null;
  fullName: string;
  className?: string;
}

export default function Avatar({ src, fullName, className = "h-10 w-10" }: AvatarProps) {
  // Ảnh lỗi (link hỏng, Google chặn...) thì quay về chữ cái đầu; đổi src thì thử tải lại
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (src && src !== failedSrc) {
    return (
      <img
        src={src}
        alt={fullName}
        // Ảnh Google (lh3.googleusercontent.com) hay trả 403/429 khi request kèm Referer của trang khác
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(src)}
        className={`${className} rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      className={`${className} flex items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700`}
    >
      {initials(fullName)}
    </span>
  );
}
