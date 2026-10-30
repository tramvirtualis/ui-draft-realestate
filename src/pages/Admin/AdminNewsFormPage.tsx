import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import CategoryChipInput from "../../components/Admin/news/CategoryChipInput";
import RichTextEditor from "../../components/common/RichTextEditor";
import { htmlToText, isRichTextEmpty } from "../../utils/richText";
import {
  adminNewsService,
  type AdminNewsCategory,
  type NewsInput,
} from "../../services/news/adminNewsService";
import { projectService } from "../../services/project/projectService";
import type { NewsImage } from "../../types/new/news.types";
import type { ProjectDto } from "../../types/project/project.types";

const EMPTY: NewsInput = {
  title: "",
  content: "",
  categoryIds: [],
  projectId: null,
  active: true,
};
const field =
  "mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-primary-600";
const MAX_CONTENT = 100000; // giới hạn số ký tự (gồm cả thẻ định dạng), khớp NewsRequest.content của BE
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export default function AdminNewsFormPage() {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();
  const toast = useToast();
  const picker = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<NewsInput>(EMPTY);
  const [categories, setCategories] = useState<AdminNewsCategory[]>([]);
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(editId !== null);
  const [saving, setSaving] = useState(false);
  // Ảnh đã lưu (chỉ khi sửa) + ảnh mới chọn từ máy
  const [saved, setSaved] = useState<NewsImage[]>([]);
  const [removeIds, setRemoveIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<{ file: File; preview: string }[]>(
    []
  );

  useEffect(() => {
    adminNewsService
      .getCategories()
      .then((list) => setCategories(list.filter((c) => c.active !== false)))
      .catch(() => toast.show("Không tải được chuyên mục", "error"));
    projectService
      .getAdminProjects(0, 200)
      .then((p) => setProjects(p.content))
      .catch(() => toast.show("Không tải được danh sách dự án", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editId === null) return;
    adminNewsService
      .get(editId)
      .then((n) => {
        const ids = (
          n.categories?.length ? n.categories : n.category ? [n.category] : []
        ).map((c) => c.id);
        setForm({
          title: n.title,
          content: n.content,
          categoryIds: ids,
          projectId: n.project?.id ?? null,
          active: n.active,
        });
        setSaved(n.images ?? []);
      })
      .catch((err) => {
        toast.show(getErrorMessage(err), "error");
        navigate("/admin/news");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const visibleSaved = saved.filter((i) => !removeIds.includes(i.id));

  const pickFiles = (list: FileList | null) => {
    const files = Array.from(list ?? []).filter(
      (f) => f.type.startsWith("image/") && f.size <= MAX_IMAGE_SIZE
    );
    setNewFiles((cur) => [
      ...cur,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Báo đúng trường còn thiếu để người dùng biết cần sửa gì
    const missing = [
      !form.title.trim() && "tiêu đề",
      !form.projectId && "dự án",
      form.categoryIds.length === 0 &&
        "chuyên mục (nhập tên rồi nhấn Enter hoặc chọn chuyên mục có sẵn)",
      isRichTextEmpty(form.content) && "nội dung",
    ].filter(Boolean);
    if (missing.length > 0) {
      toast.show(`Vui lòng bổ sung: ${missing.join(", ")}`, "error");
      return;
    }
    setSaving(true);
    try {
      if (editId === null) {
        await adminNewsService.add(
          form,
          newFiles.map((n) => n.file)
        );
      } else {
        await adminNewsService.edit(editId, form);
        await Promise.all(
          removeIds.map((imageId) =>
            adminNewsService.removeImage(editId, imageId)
          )
        );
        if (newFiles.length > 0)
          await adminNewsService.addImages(
            editId,
            newFiles.map((n) => n.file)
          );
      }
      toast.show(editId === null ? "Đã thêm tin tức" : "Đã cập nhật tin tức");
      navigate("/admin/news");
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const title = editId === null ? "Thêm tin tức" : "Sửa tin tức";

  return (
    <>
      <AdminPageHeader
        breadcrumb={[
          { label: "Tổng quan", to: "/admin/dashboard" },
          { label: "Quản lý tin tức", to: "/admin/news" },
          { label: title },
        ]}
        title={title}
      />
      <div className="-mt-16 px-4 pb-10 md:px-8">
        <form
          onSubmit={submit}
          className="space-y-5 rounded-2xl border border-line bg-white p-6 shadow-sm"
          aria-busy={loading}
        >
          <label className="block text-sm font-semibold text-heading">
            Tiêu đề <span className="text-danger">*</span>
            <input
              value={form.title}
              maxLength={255}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={field}
              disabled={loading}
            />
          </label>
          <label className="block text-sm font-semibold text-heading">
            Dự án <span className="text-danger">*</span>
            <select
              value={form.projectId ?? 0}
              onChange={(e) =>
                setForm({ ...form, projectId: Number(e.target.value) || null })
              }
              className={field}
              disabled={loading}
            >
              <option value={0}>— Chọn dự án —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="text-sm font-semibold text-heading">
              Chuyên mục <span className="text-danger">*</span>
            </span>
            <CategoryChipInput
              categories={categories}
              selectedIds={form.categoryIds}
              disabled={loading}
              onCategoriesChange={setCategories}
              onChange={(categoryIds) =>
                setForm((f) => ({ ...f, categoryIds }))
              }
            />
          </div>
          <div>
            <span className="flex items-center justify-between text-sm font-semibold text-heading">
              <span>
                Nội dung <span className="text-danger">*</span>
              </span>
              <span
                className={`text-xs font-normal ${
                  form.content.length >= MAX_CONTENT
                    ? "text-danger"
                    : "text-muted"
                }`}
              >
                {htmlToText(form.content).split(/\s+/).filter(Boolean).length}{" "}
                từ
              </span>
            </span>
            <div className="mt-1.5">
              <RichTextEditor
                value={form.content}
                onChange={(html) =>
                  setForm((f) => ({
                    ...f,
                    content: html.slice(0, MAX_CONTENT),
                  }))
                }
                placeholder="Nhập nội dung bài viết..."
                disabled={loading}
                minHeight={320}
              />
            </div>
          </div>

          <div>
            <span className="text-sm font-semibold text-heading">
              Hình ảnh{" "}
              <span className="text-xs font-normal text-muted">
                (Không bắt buộc, tối đa 10 MB/ảnh)
              </span>
            </span>
            <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {visibleSaved.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.imageUrl}
                    alt={img.title || "Ảnh tin tức"}
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setRemoveIds((cur) => [...cur, img.id])}
                    aria-label="Xóa ảnh"
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-danger shadow"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              {newFiles.map((n, i) => (
                <div key={n.preview} className="relative">
                  <img
                    src={n.preview}
                    alt="Ảnh mới"
                    className="aspect-[4/3] w-full rounded-xl border border-dashed border-primary-300 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setNewFiles((cur) => cur.filter((_, k) => k !== i))
                    }
                    aria-label="Bỏ ảnh"
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-danger shadow"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => picker.current?.click()}
                className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-primary-300 bg-primary-50/40 text-xs font-semibold text-primary-700 transition hover:bg-primary-50"
              >
                + Thêm ảnh
              </button>
            </div>
            <input
              ref={picker}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                pickFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-heading">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Hiển thị trên website
          </label>
          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/news")}
              className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50"
            >
              Hủy
            </button>
            <button
              disabled={saving || loading}
              className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
