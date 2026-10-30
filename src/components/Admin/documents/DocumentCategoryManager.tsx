import { useState, type FormEvent } from "react";
import { Check, Eye, EyeOff, Pencil, Trash2, X } from "lucide-react";
import Pagination from "../../common/Pagination";
import ConfirmDialog from "../ConfirmDialog";
import TableSkeleton from "../../common/TableSkeleton";
import { useAdminDocumentCategories } from "../../../hooks/document/useAdminDocumentCategories";
import type { DocumentCategory } from "../../../types/document.types";

const PAGE_SIZE = 8;

const input = "h-11 w-full rounded-xl border border-line px-4 text-sm outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";
const iconBtn = "flex h-9 w-9 items-center justify-center rounded-lg transition disabled:opacity-50";

// Quản lý danh mục tài liệu: thêm, đổi tên, ẩn/hiện, xóa
export default function DocumentCategoryManager() {
  const list = useAdminDocumentCategories(PAGE_SIZE);
  const { categories, busy, add, rename, toggleActive, remove } = list;
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState<DocumentCategory | null>(null);

  const submitAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (await add(name)) setName("");
  };

  const submitRename = async (c: DocumentCategory) => {
    if (!editing?.name.trim()) return;
    if (await rename(c, editing.name)) setEditing(null);
  };

  const confirmDelete = async () => {
    if (deleting && (await remove(deleting))) setDeleting(null);
  };

  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <form onSubmit={submitAdd} className="flex gap-2 p-4">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={150} placeholder="Tên danh mục mới..." aria-label="Tên danh mục mới" className={input} />
        <button disabled={busy || !name.trim()} className="h-11 shrink-0 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-50">
          Thêm danh mục
        </button>
      </form>

      <div className="border-t border-line">
        {list.failed ? (
          <div role="alert" className="px-6 py-14 text-center">
            <p className="font-semibold text-heading">Không tải được danh mục tài liệu</p>
            <button onClick={list.retry} className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">Thử lại</button>
          </div>
        ) : list.waiting ? (
          <TableSkeleton rows={PAGE_SIZE} label="Đang tải danh mục" />
        ) : categories.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-body">Chưa có danh mục nào.</p>
        ) : (
          <ul className="divide-y divide-line">
            {categories.map((c) => {
              const hidden = c.active === false;
              return (
                <li key={c.id} className="flex items-center gap-2 px-5 py-3">
                  {editing?.id === c.id ? (
                    <>
                      <input
                        autoFocus
                        value={editing.name}
                        maxLength={150}
                        onChange={(e) => setEditing({ id: c.id, name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); submitRename(c); }
                          if (e.key === "Escape") setEditing(null);
                        }}
                        aria-label="Tên danh mục"
                        className={input}
                      />
                      <button type="button" onClick={() => submitRename(c)} disabled={busy} aria-label="Lưu" className={`${iconBtn} text-success hover:bg-success/10`}><Check size={16} /></button>
                      <button type="button" onClick={() => setEditing(null)} aria-label="Hủy" className={`${iconBtn} text-body hover:bg-primary-50`}><X size={16} /></button>
                    </>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-semibold ${hidden ? "text-muted line-through" : "text-heading"}`}>{c.name}</p>
                        <p className="truncate text-xs text-muted">/{c.slug}</p>
                      </div>
                      <span className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline ${hidden ? "bg-primary-50 text-muted" : "bg-success/10 text-success"}`}>
                        {hidden ? "Đang ẩn" : "Đang hiển thị"}
                      </span>
                      <button type="button" onClick={() => setEditing({ id: c.id, name: c.name })} disabled={busy} title="Đổi tên" aria-label={`Đổi tên ${c.name}`} className={`${iconBtn} text-body hover:bg-primary-50`}><Pencil size={15} /></button>
                      <button type="button" onClick={() => toggleActive(c)} disabled={busy} title={hidden ? "Hiển thị" : "Ẩn"} aria-label={hidden ? `Hiển thị ${c.name}` : `Ẩn ${c.name}`} className={`${iconBtn} text-body hover:bg-primary-50`}>
                        {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button type="button" onClick={() => setDeleting(c)} disabled={busy} title="Xóa" aria-label={`Xóa ${c.name}`} className={`${iconBtn} bg-danger/10 text-danger hover:bg-danger/20`}><Trash2 size={15} /></button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs text-body">
        <p className="text-muted">Danh mục còn tài liệu thì không xóa được, chỉ có thể ẩn.</p>
        {!list.waiting && !list.failed && list.total > 0 && (
          <div className="flex items-center gap-3">
            <p>
              Hiển thị {list.page * PAGE_SIZE + 1}–{Math.min(list.total, (list.page + 1) * PAGE_SIZE)} trong {list.total} danh mục
            </p>
            {list.pages > 1 && <Pagination page={list.page} totalPages={list.pages} onChange={list.setPage} />}
          </div>
        )}
      </div>

      {deleting && (
        <ConfirmDialog
          title="Xóa danh mục?"
          message={`Bạn có chắc chắn muốn xóa danh mục "${deleting.name}" không?`}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </section>
  );
}
