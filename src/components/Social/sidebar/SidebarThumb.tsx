import { useState } from "react";
import type { LucideIcon } from "lucide-react";

type Props = {
  src?: string | null;
  alt: string;
  icon: LucideIcon;
};

// Ảnh thu nhỏ cho danh sách ở sidebar: không có ảnh hoặc ảnh lỗi → hiện icon
export default function SidebarThumb({ src, alt, icon: Icon }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
        <Icon size={20} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-14 w-14 shrink-0 rounded-lg object-cover transition group-hover:opacity-90"
    />
  );
}
