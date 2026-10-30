import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Folder, Layers, PenLine, Plus, RotateCcw, Search } from "lucide-react";
import Pagination from "../../../components/common/Pagination";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import FilterSelect from "../../../components/Admin/FilterSelect";
import TableSkeleton from "../../../components/common/TableSkeleton";
import DocumentStatusTabs from "../../../components/Admin/documents/DocumentStatusTabs";
import DocumentTable from "../../../components/Admin/documents/DocumentTable";
import { useAdminDocuments } from "../../../hooks/document/useAdminDocuments";
import type { DocumentItem, DocumentType } from "../../../types/document.types";

const PAGE_SIZE = 10;

const field =
  "h-11 rounded-xl border border-line bg-white text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

type TypeFilter = DocumentType | "ALL";

// Quản lý tài liệu: lọc, tìm kiếm và phân trang ở server theo GET /api/admin/documents
export default function AdminDocumentsPage() {
  const d = useAdminDocuments(PAGE_SIZE);
  const [deleting, setDeleting] = useState<DocumentItem | null>(null);

  const from = d.total === 0 ? 0 : d.page * PAGE_SIZE + 1;
  const to = Math.min(d.total, (d.page + 1) * PAGE_SIZE);

  const confirmDelete = async () => {
    if (deleting && (await d.remove(deleting))) setDeleting(null);
  };

  return (
    <>
      <AdminPageHeader
        breadcrumb={[{ label: "Tổng quan", to: "/admin/dashboard" }, { label: "Quản lý tài liệu" }]}
        title="Quản lý tài liệu"
        desc="Đăng tài liệu PDF / Word hoặc soạn bài viết cho trang Thư viện kiến thức."
        action={
          <Link
            to="/admin/documents/new"
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
          >
            <Plus size={16} /> Thêm tài liệu
          </Link>
        }
      />

      <div className="-mt-16 space-y-5 px-4 pb-10 md:px-8">
        <DocumentStatusTabs value={d.status} counts={d.counts} onChange={d.setStatus} />

        <section className="rounded-2xl border border-line bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 p-4">
            <form onSubmit={d.search} className="flex min-w-60 flex-1 gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={d.keywordDraft}
                  onChange={(e) => d.setKeywordDraft(e.target.value)}
                  placeholder="Tìm theo tiêu đề, mô tả..."
                  aria-label="Tìm tài liệu"
                  className="h-11 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-sm outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
                />
              </div>
              <button className="h-11 shrink-0 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95">
                Tìm kiếm
              </button>
            </form>
            <FilterSelect<TypeFilter>
              label="Loại"
              value={d.type ?? "ALL"}
              onChange={(v) => d.setType(v === "ALL" ? null : v)}
              options={[
                { value: "ALL", label: "Tất cả", desc: "File và bài viết", icon: Layers },
                { value: "FILE", label: "File PDF / Word", desc: "Tài liệu tải lên", icon: FileText },
                { value: "ARTICLE", label: "Bài viết", desc: "Soạn trực tiếp trên web", icon: PenLine },
              ]}
            />
            <FilterSelect
              label="Danh mục"
              value={d.categoryId === null ? "" : String(d.categoryId)}
              onChange={(v) => d.setCategoryId(v ? Number(v) : null)}
              icon={Folder}
              options={[
                { value: "", label: "Tất cả", desc: "Mọi danh mục", icon: Layers },
                ...d.categories.map((c) => ({ value: String(c.id), label: c.name, desc: c.active === false ? "Đang ẩn" : undefined })),
              ]}
            />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={d.from}
                max={d.to || undefined}
                onChange={(e) => d.setFrom(e.target.value)}
                aria-label="Tạo từ ngày"
                className={`${field} px-3`}
              />
              <span className="text-sm text-body">→</span>
              <input
                type="date"
                value={d.to}
                min={d.from || undefined}
                onChange={(e) => d.setTo(e.target.value)}
                aria-label="Tạo đến ngày"
                className={`${field} px-3`}
              />
            </div>
            <button
              type="button"
              onClick={d.resetFilters}
              disabled={!d.hasFilter}
              className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-heading transition hover:bg-primary-50 disabled:opacity-50"
            >
              <RotateCcw size={15} /> Đặt lại
            </button>
          </div>
          {d.badRange && <p role="alert" className="px-4 pb-3 text-xs text-danger">Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.</p>}

          <div className="border-t border-line">
            {d.failed ? (
              <div role="alert" className="px-6 py-14 text-center">
                <p className="font-semibold text-heading">{d.badRange ? "Khoảng ngày không hợp lệ" : "Không tải được danh sách tài liệu"}</p>
                <button onClick={d.retry} className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">Thử lại</button>
              </div>
            ) : d.waiting ? (
              <TableSkeleton rows={PAGE_SIZE} label="Đang tải tài liệu" />
            ) : d.items.length === 0 ? (
              <p className="px-6 py-14 text-center text-sm text-body">{d.hasFilter ? "Không có tài liệu phù hợp với bộ lọc." : "Chưa có tài liệu nào."}</p>
            ) : (
              <DocumentTable items={d.items} busyId={d.busyId} onTogglePublished={d.togglePublished} onDelete={setDeleting} />
            )}
          </div>

          {!d.waiting && !d.failed && d.total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs text-body">
              <p>Hiển thị {from}–{to} trong {d.total} tài liệu</p>
              {d.pages > 1 && <Pagination page={d.page} totalPages={d.pages} onChange={d.setPage} />}
            </div>
          )}
        </section>
      </div>

      {deleting && (
        <ConfirmDialog
          title="Xóa tài liệu?"
          message={`Bạn có chắc chắn muốn xóa "${deleting.title}" không? File và ảnh trên Cloudinary cũng sẽ bị xóa, không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
