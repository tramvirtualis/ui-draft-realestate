import type { FormEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import RichTextEditor from "../../../components/common/RichTextEditor";
import DocumentTypePicker from "../../../components/Admin/documents/DocumentTypePicker";
import DocumentFileField from "../../../components/Admin/documents/DocumentFileField";
import DocumentThumbnailField from "../../../components/Admin/documents/DocumentThumbnailField";
import { MAX_CONTENT, useAdminDocumentForm } from "../../../hooks/document/useAdminDocumentForm";
import useUnsavedChangesGuard from "../../../hooks/useUnsavedChangesGuard";
import { htmlToText } from "../../../utils/richText";

const LIST = "/admin/documents";
const field = "mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-primary-600";
const card = "space-y-5 rounded-2xl border border-line bg-white p-6 shadow-sm";
const label = "block text-sm font-semibold text-heading";

export default function AdminDocumentFormPage() {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();
  const f = useAdminDocumentForm(editId);
  const guard = useUnsavedChangesGuard(f.dirty && !f.saving);
  const { form, setField } = f;
  const busy = f.loading || f.saving;

  if (f.notFound) return <Navigate to={LIST} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (await f.submit()) {
      guard.allowLeave();
      navigate(LIST);
    }
  };

  const title = editId === null ? "Thêm tài liệu" : "Sửa tài liệu";
  const words = htmlToText(form.content).split(/\s+/).filter(Boolean).length;

  return (
    <>
      <AdminPageHeader
        breadcrumb={[{ label: "Tổng quan", to: "/admin/dashboard" }, { label: "Quản lý tài liệu", to: LIST }, { label: title }]}
        title={title}
      />
      <form onSubmit={submit} aria-busy={busy} className="-mt-16 grid items-start gap-5 px-4 pb-10 md:px-8 xl:grid-cols-[1fr_340px]">
        {/* Cột chính: loại, tiêu đề, file hoặc nội dung */}
        <div className="space-y-5">
          <div className={card}>
            <div>
              <span className={label}>Loại tài liệu</span>
              <div className="mt-2">
                <DocumentTypePicker value={form.type} onChange={(t) => setField("type", t)} disabled={busy} />
              </div>
            </div>
            <label className={label}>
              Tiêu đề <span className="text-danger">*</span>
              <input value={form.title} maxLength={255} onChange={(e) => setField("title", e.target.value)} className={field} disabled={busy} />
            </label>
            <label className={label}>
              Mô tả ngắn
              <span className="ml-2 text-xs font-normal text-muted">{form.description.length}/1000 · hiện ở danh sách và kết quả tìm kiếm Google</span>
              <textarea
                value={form.description}
                maxLength={1000}
                rows={3}
                onChange={(e) => setField("description", e.target.value)}
                className={`${field} resize-y`}
                disabled={busy}
              />
            </label>
          </div>

          <div className={card}>
            {/* Bài viết không đính kèm file; cần tài liệu kèm theo thì chèn link (vd Google Drive) trong nội dung */}
            {form.type === "FILE" && (
              <div>
                <span className={label}>
                  File tài liệu <span className="text-danger">*</span>
                </span>
                <div className="mt-2">
                  <DocumentFileField
                    file={f.file}
                    saved={f.saved}
                    showSaved={f.hasSavedFile}
                    onPick={f.pickFile}
                    onClear={f.clearFile}
                    disabled={busy}
                  />
                </div>
              </div>
            )}

            {form.type === "ARTICLE" && (
              <div>
                <span className="flex items-center justify-between text-sm font-semibold text-heading">
                  <span>Nội dung <span className="text-danger">*</span></span>
                  <span className={`text-xs font-normal ${form.content.length >= MAX_CONTENT ? "text-danger" : "text-muted"}`}>{words} từ</span>
                </span>
                <div className="mt-1.5">
                  <RichTextEditor
                    value={form.content}
                    onChange={(html) => setField("content", html.slice(0, MAX_CONTENT))}
                    onUploadImage={f.uploadContentImage}
                    placeholder="Soạn nội dung tài liệu... (bấm biểu tượng ảnh để chèn hình, biểu tượng liên kết để gắn link Google Drive)"
                    disabled={busy}
                    minHeight={420}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cột phụ: xuất bản, danh mục, slug, ảnh đại diện */}
        <div className="space-y-5 xl:sticky xl:top-6">
          <div className={card}>
            <label className="flex items-center justify-between gap-3 text-sm font-semibold text-heading">
              Hiển thị trên website
              <input type="checkbox" checked={form.published} onChange={(e) => setField("published", e.target.checked)} className="h-4 w-4 accent-primary-600" disabled={busy} />
            </label>
            <label className={label}>
              Danh mục
              <select
                value={form.categoryId ?? ""}
                onChange={(e) => setField("categoryId", e.target.value ? Number(e.target.value) : null)}
                className={field}
                disabled={busy}
              >
                <option value="">— Chưa phân loại —</option>
                {f.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className={label}>
              Đường dẫn (slug)
              <input
                value={form.slug}
                maxLength={300}
                onChange={(e) => setField("slug", e.target.value.toLowerCase())}
                placeholder="Bỏ trống để tự tạo từ tiêu đề"
                className={field}
                disabled={busy}
              />
              <span className="mt-1 block text-[11px] font-normal text-muted">/knowledge/{form.slug || "…"}</span>
            </label>
          </div>

          <div className={card}>
            <span className={label}>Ảnh đại diện</span>
            <DocumentThumbnailField
              src={f.currentThumbnail}
              onPick={f.pickThumbnail}
              onClear={f.clearThumbnail}
              disabled={busy}
              hint={form.type === "FILE" ? "Bỏ trống: file PDF tự lấy trang 1 làm ảnh. File Word nên chọn ảnh." : "Tối đa 10MB."}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => guard.requestLeave(LIST)}
              className="flex-1 rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-footer transition hover:bg-primary-50"
            >
              Hủy
            </button>
            <button disabled={busy} className="flex-1 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60">
              {f.saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      </form>

      {guard.target && (
        <ConfirmDialog
          title="Rời trang khi chưa lưu?"
          message="Các thay đổi chưa lưu sẽ bị mất."
          confirmLabel="Rời trang"
          onConfirm={guard.leave}
          onClose={guard.stay}
        />
      )}
    </>
  );
}
