import { documentKind } from "./knowledgeHelpers";
import type { DocumentItem } from "../../types/document.types";

type Props = {
  doc: Pick<DocumentItem, "thumbnail" | "title" | "type" | "mimeType">;
  className?: string;
  iconSize?: number;
};

// Ảnh đại diện tài liệu; chưa có ảnh thì hiện ô màu kèm icon theo loại (PDF / Word / Bài viết)
export default function DocumentThumb({ doc, className = "", iconSize = 26 }: Props) {
  if (doc.thumbnail) {
    return <img src={doc.thumbnail} alt="" loading="lazy" className={`object-cover ${className}`} />;
  }
  const kind = documentKind(doc);
  const Icon = kind.icon;
  return (
    <span className={`flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 ${className}`}>
      <Icon size={iconSize} />
      <span className="text-[10px] font-semibold uppercase tracking-wide">{kind.label}</span>
    </span>
  );
}
