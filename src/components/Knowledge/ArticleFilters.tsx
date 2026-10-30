import type { FormEvent } from "react";
import { ChevronDown, Search } from "lucide-react";
import { selectCls } from "./knowledgeHelpers";
import {
  DOCUMENT_SORT_LABEL,
  type DocumentCategory,
  type DocumentSort,
  type DocumentType,
} from "../../types/document.types";

type Props = {
  keywordDraft: string;
  setKeywordDraft: (value: string) => void;
  onSearch: (e: FormEvent<HTMLFormElement>) => void;
  categories: DocumentCategory[];
  categoryId: number | null;
  setCategoryId: (id: number | null) => void;
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

export default function ArticleFilters({
  keywordDraft, setKeywordDraft, onSearch, categories, categoryId, setCategoryId, type, setType, sort, setSort,
}: Props) {
  return (
    <div className="mt-6 space-y-3 rounded-2xl border border-line bg-primary-50 p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_220px_190px]">
        <form onSubmit={onSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={keywordDraft}
              onChange={(e) => setKeywordDraft(e.target.value)}
              placeholder="Tìm theo tiêu đề, mô tả…"
              aria-label="Tìm tài liệu"
              className={`${selectCls} pl-10 pr-4`}
            />
          </div>
          <button className="h-11 shrink-0 rounded-xl bg-primary-600 px-5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">
            Tìm kiếm
          </button>
        </form>
        <div className="relative">
          <select
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
            aria-label="Danh mục"
            className={selectCls}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-body" />
        </div>
        <div className="relative">
          <select value={sort} onChange={(e) => setSort(e.target.value as DocumentSort)} aria-label="Sắp xếp" className={selectCls}>
            {(Object.keys(DOCUMENT_SORT_LABEL) as DocumentSort[]).map((k) => <option key={k} value={k}>{DOCUMENT_SORT_LABEL[k]}</option>)}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-body" />
        </div>
      </div>

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
    </div>
  );
}
