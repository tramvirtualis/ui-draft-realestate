import { documentKind } from "./knowledgeHelpers";
import type { DocumentItem } from "../../types/document.types";

// Nhãn nhỏ "PDF" / "Word" / "Bài viết"
export default function DocumentKindBadge({ doc }: { doc: Pick<DocumentItem, "type" | "mimeType"> }) {
  const kind = documentKind(doc);
  const Icon = kind.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${kind.badge}`}>
      <Icon size={11} /> {kind.label}
    </span>
  );
}
