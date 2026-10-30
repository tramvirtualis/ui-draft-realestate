import { ChevronDown } from "lucide-react";
import { selectCls } from "../Knowledge/knowledgeHelpers";
import { DOCUMENT_SORT_LABEL, type DocumentSort, type DocumentType } from "../../types/document.types";

type Props = {
  type: DocumentType | null;
  setType: (type: DocumentType | null) => void;
  sort: DocumentSort;
  setSort: (sort: DocumentSort) => void;
};

const TYPE_TABS: { value: DocumentType | null; label: string }[] = [
  { value: null, label: "Tất cả" },
  { value: "FILE", label: "File PDF / Word" },
  { value: "ARTICLE", label: "Bài viết" },
];

// Lọc loại + sắp xếp phía trên danh sách tài liệu của 1 danh mục
export default function CategoryListToolbar({ type, setType, sort, setSort }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-3 shadow-sm">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Loại tài liệu">
        {TYPE_TABS.map((t) => (
          <button
            key={t.label}
            type="button"
            role="tab"
            aria-selected={type === t.value}
            onClick={() => setType(t.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              type === t.value ? "bg-primary-600 text-white" : "border border-line bg-white text-body hover:border-primary-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="relative w-48">
        <select value={sort} onChange={(e) => setSort(e.target.value as DocumentSort)} aria-label="Sắp xếp" className={`${selectCls} h-10`}>
          {(Object.keys(DOCUMENT_SORT_LABEL) as DocumentSort[]).map((k) => <option key={k} value={k}>{DOCUMENT_SORT_LABEL[k]}</option>)}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-body" />
      </div>
    </div>
  );
}
