import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ProjectManageBar from "../../../components/Admin/project/manage/ProjectManageBar";
import LocationPickerMap, { type LatLng } from "../../../components/Admin/project/location/LocationPickerMap";
import AdvantagesEditor from "../../../components/Admin/project/location/AdvantagesEditor";
import RichTextEditor from "../../../components/common/RichTextEditor";
import TableSkeleton from "../../../components/common/TableSkeleton";
import { useToast } from "../../../components/common/toastContext";
import { getErrorMessage } from "../../../api";
import { adminProjectService } from "../../../services/project/adminProjectService";
import { adminLocationService } from "../../../services/project/locationService";
import { useSelectedProject } from "../../../hooks/project/useSelectedProject";
import { htmlToText, isRichTextEmpty } from "../../../utils/richText";
import { projectPath } from "../../../utils/slug";
import type { AdminProject } from "../../../types/project/adminProject.types";
import type { LocationImageDto, ProjectLocationDto } from "../../../types/project/location.types";

type Boot = { status: "loading" } | { status: "error" } | { status: "ready"; projects: AdminProject[] };
type Form = { point: LatLng | null; intro: string; articleTitle: string; content: string; advantages: string[] };

const field =
  "mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-primary-600";
const MAX_CONTENT = 100000; // khớp ProjectLocationRequest.content của BE
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGES = 30; // khớp ProjectLocationServiceImpl.MAX_IMAGES

const toForm = (l: ProjectLocationDto): Form => ({
  point: l.latitude != null && l.longitude != null ? { lat: l.latitude, lng: l.longitude } : null,
  intro: l.intro ?? "",
  articleTitle: l.articleTitle ?? "",
  content: l.content ?? "",
  advantages: l.advantages,
});

// Quản lý trang Vị trí: bản đồ, điểm thuận lợi, giới thiệu, bài viết (soạn như tin tức) và hình ảnh
export default function LocationManagementPage() {
  const toast = useToast();
  const picker = useRef<HTMLInputElement>(null);
  const [boot, setBoot] = useState<Boot>({ status: "loading" });
  const projects = boot.status === "ready" ? boot.projects : [];
  const { projectId } = useSelectedProject(projects);
  const project = projects.find((p) => p.id === projectId);

  const [location, setLocation] = useState<ProjectLocationDto | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  // Ảnh đã lưu + ảnh mới chọn từ máy (giống form tin tức)
  const [removeIds, setRemoveIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<{ file: File; preview: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminProjectService
      .list()
      .then((list) => !cancelled && setBoot({ status: "ready", projects: list }))
      .catch(() => !cancelled && setBoot({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    if (projectId === null) return;
    const data = await adminLocationService.get(projectId);
    setLocation(data);
    setForm(toForm(data));
    setRemoveIds([]);
    setNewFiles([]);
  }, [projectId]);

  useEffect(() => {
    setLocation(null);
    setForm(null);
    load().catch((e) => toast.show(getErrorMessage(e), "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const visibleSaved: LocationImageDto[] = (location?.images ?? []).filter((i) => !removeIds.includes(i.id));
  const totalImages = visibleSaved.length + newFiles.length;

  const pickFiles = (list: FileList | null) => {
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith("image/") && f.size <= MAX_IMAGE_SIZE);
    const room = Math.max(0, MAX_IMAGES - totalImages);
    if (files.length > room) toast.show(`Ảnh vị trí tối đa ${MAX_IMAGES} ảnh`, "error");
    setNewFiles((cur) => [...cur, ...files.slice(0, room).map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (projectId === null || !form) return;
    setSaving(true);
    try {
      const saved = await adminLocationService.save(
        projectId,
        {
          latitude: form.point?.lat ?? null,
          longitude: form.point?.lng ?? null,
          intro: form.intro,
          articleTitle: form.articleTitle,
          content: isRichTextEmpty(form.content) ? "" : form.content,
          // Dòng để trống thì bỏ qua
          advantages: form.advantages.filter((text) => text.trim()),
        },
        newFiles.map((n) => n.file),
        removeIds,
      );
      setLocation(saved);
      setForm(toForm(saved));
      setRemoveIds([]);
      setNewFiles([]);
      toast.show("Đã lưu trang vị trí");
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const header = (
    <AdminPageHeader
      soft
      breadcrumb={[{ label: "Dự án", to: "/admin/projects" }, { label: "Vị trí" }]}
      title="Quản lý vị trí dự án"
      desc="Bản đồ, điểm thuận lợi, bài viết phân tích vị trí và hình ảnh khu vực; hiển thị tại tab Vị trí của dự án."
      action={
        project && (
          <a
            href={`${projectPath(project.id, project.name)}/location`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50"
          >
            <ExternalLink size={15} /> Xem trang vị trí
          </a>
        )
      }
    />
  );

  if (boot.status === "loading") {
    return <div className="animate-page-in">{header}<div className="px-4 md:px-8"><TableSkeleton rows={4} label="Đang tải" /></div></div>;
  }
  if (boot.status === "error" || projectId === null || !project) {
    return (
      <div className="animate-page-in">
        {header}
        <div role="alert" className="mx-4 rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-16 text-center md:mx-8">
          <p className="font-semibold text-heading">{boot.status === "error" ? "Không tải được danh sách dự án" : "Chưa có dự án nào"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-page-in">
      {header}
      <ProjectManageBar projectId={projectId} />

      <div className="space-y-6 px-4 pb-12 md:px-8">
        {!location || !form ? (
          <TableSkeleton rows={5} label="Đang tải nội dung vị trí" />
        ) : (
          <form onSubmit={(e) => void submit(e)} className="space-y-5 rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div>
              <span className="text-sm font-semibold text-heading">Vị trí dự án trên bản đồ</span>
              <div className="mt-1.5">
                <LocationPickerMap
                  key={projectId}
                  value={form.point}
                  onChange={(point) => setForm((f) => (f ? { ...f, point } : f))}
                  initialQuery={project.location}
                  className="h-[360px]"
                />
              </div>
              {form.point && (
                <button type="button" onClick={() => setForm((f) => (f ? { ...f, point: null } : f))} className="mt-2 text-xs font-semibold text-danger hover:underline">
                  Bỏ toạ độ
                </button>
              )}
            </div>

            <div>
              <span className="text-sm font-semibold text-heading">Điểm thuận lợi</span>
              <div className="mt-1.5">
                <AdvantagesEditor value={form.advantages} onChange={(advantages) => setForm((f) => (f ? { ...f, advantages } : f))} />
              </div>
            </div>

            <label className="block text-sm font-semibold text-heading">
              Giới thiệu ngắn
              <textarea
                value={form.intro}
                maxLength={2000}
                rows={3}
                onChange={(e) => setForm({ ...form, intro: e.target.value })}
                placeholder="Hiển thị dưới tên dự án ở đầu trang vị trí"
                className={field}
              />
            </label>

            <label className="block text-sm font-semibold text-heading">
              Tiêu đề bài viết
              <input value={form.articleTitle} maxLength={255} onChange={(e) => setForm({ ...form, articleTitle: e.target.value })} className={field} />
            </label>

            <div>
              <span className="flex items-center justify-between text-sm font-semibold text-heading">
                <span>Nội dung</span>
                <span className={`text-xs font-normal ${form.content.length >= MAX_CONTENT ? "text-danger" : "text-muted"}`}>
                  {htmlToText(form.content).split(/\s+/).filter(Boolean).length} từ
                </span>
              </span>
              <div className="mt-1.5">
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => setForm((f) => (f ? { ...f, content: html.slice(0, MAX_CONTENT) } : f))}
                  placeholder="Nhập bài viết phân tích vị trí..."
                  minHeight={320}
                />
              </div>
            </div>

            <div>
              <span className="text-sm font-semibold text-heading">
                Hình ảnh vị trí <span className="text-xs font-normal text-muted">(sơ đồ, bản đồ dạng ảnh · {totalImages}/{MAX_IMAGES}, tối đa 10 MB/ảnh)</span>
              </span>
              <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {visibleSaved.map((img) => (
                  <div key={img.id} className="relative">
                    <img src={img.imageUrl} alt="Ảnh vị trí" className="aspect-[4/3] w-full rounded-xl object-cover" />
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
                    <img src={n.preview} alt="Ảnh mới" className="aspect-[4/3] w-full rounded-xl border border-dashed border-primary-300 object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewFiles((cur) => cur.filter((_, k) => k !== i))}
                      aria-label="Bỏ ảnh"
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-danger shadow"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
                {totalImages < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => picker.current?.click()}
                    className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-primary-300 bg-primary-50/40 text-xs font-semibold text-primary-700 transition hover:bg-primary-50"
                  >
                    + Thêm ảnh
                  </button>
                )}
              </div>
              <input ref={picker} type="file" accept="image/*" multiple hidden onChange={(e) => { pickFiles(e.target.files); e.target.value = ""; }} />
            </div>

            <div className="flex justify-end gap-3 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => {
                  setForm(toForm(location));
                  setRemoveIds([]);
                  setNewFiles([]);
                }}
                className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50"
              >
                Hoàn tác
              </button>
              <button
                disabled={saving}
                className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
