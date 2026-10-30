import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import AdminPageHeader from "../../AdminPageHeader";
import ConfirmDialog from "../../ConfirmDialog";
import UploadDropzone from "./UploadDropzone";
import ImageGallery from "./ImageGallery";
import Lightbox from "../../../common/Lightbox";
import { getErrorMessage } from "../../../../api";
import { useToast } from "../../../common/toastContext";
import { adminProjectService } from "../../../../services/project/adminProjectService";
import type { AdminProject } from "../../../../types/project/adminProject.types";
import type { ProjectImage } from "../../../../types/project/projectImage.types";
import ProjectManageBar from "../manage/ProjectManageBar";
import { useSelectedProject } from "../../../../hooks/project/useSelectedProject";

const MAX_SIZE = 10 * 1024 * 1024;

// Dịch vụ ảnh theo dự án (ảnh dự án, ảnh chính sách...): cùng một giao diện nên dùng chung màn quản lý
export interface ProjectImageService {
  list(projectId: number): Promise<ProjectImage[]>;
  counts(): Promise<Record<number, number>>;
  add(projectId: number, files: File[]): Promise<ProjectImage[]>;
  remove(id: number): Promise<void>;
}

type Props = {
  service: ProjectImageService;
  title: string;
  desc: string;
};

type Boot = { status: "loading" } | { status: "error" } | { status: "ready"; projects: AdminProject[] };

export default function ProjectImageManager({ service, title, desc }: Props) {
  const toast = useToast();
  const [boot, setBoot] = useState<Boot>({ status: "loading" });
  const [images, setImages] = useState<ProjectImage[] | null>(null); // null = đang tải ảnh
  const [newestFirst, setNewestFirst] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null); // chỉ số trong danh sách đang hiển thị
  const [deleting, setDeleting] = useState<ProjectImage | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const picker = useRef<HTMLInputElement>(null);

  // Dự án đang chọn lưu trên URL (?project=) để chia sẻ/quay lại đúng dự án
  const projects = boot.status === "ready" ? boot.projects : [];
  const { projectId } = useSelectedProject(projects);

  useEffect(() => {
    let cancelled = false;
    adminProjectService
      .list()
      .then((list) => {
        if (cancelled) return;
        setBoot({ status: "ready", projects: list });
      })
      .catch(() => !cancelled && setBoot({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (projectId === null) return;
    let cancelled = false;
    setImages(null); // đổi dự án: hiện khung chờ thay vì dữ liệu của dự án trước
    service
      .list(projectId)
      .then((list) => !cancelled && setImages(list))
      .catch(() => !cancelled && setImages([]));
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const project = projects.find((p) => p.id === projectId);
  // Sắp xếp theo created_at; nhãn "Ảnh N" đánh số theo thứ tự thêm (ảnh cũ nhất là Ảnh 1)
  const list = useMemo(() => {
    const sorted = [...(images ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id);
    return newestFirst ? sorted.reverse() : sorted;
  }, [images, newestFirst]);
  const labelOf = useCallback((img: ProjectImage) => `Ảnh ${[...(images ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id).findIndex((x) => x.id === img.id) + 1}`, [images]);
  const dateOf = useCallback((img: ProjectImage) => new Date(img.createdAt).toLocaleDateString("vi-VN"), []);

  const addFiles = async (files: File[]) => {
    if (projectId === null) return;
    const ok = files.filter((f) => f.type.startsWith("image/") && f.size <= MAX_SIZE);
    const rejected = files.length - ok.length;
    if (rejected > 0) toast.show(`${rejected} tệp bị bỏ qua (không phải ảnh hoặc quá 10 MB)`, "error");
    if (ok.length === 0) return;

    setUploading(true);
    try {
      const created = await service.add(projectId, ok);
      setImages((cur) => [...created, ...(cur ?? [])]);
      toast.show(`Đã thêm ${created.length} ảnh`);
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting || projectId === null) return;
    try {
      await service.remove(deleting.id);
      setImages((cur) => (cur ?? []).filter((x) => x.id !== deleting.id));
      toast.show("Đã xóa ảnh");
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    }
    setDeleting(null);
  };

  const header = (action?: React.ReactNode) => (
    <AdminPageHeader
      soft
      breadcrumb={[{ label: "Dự án", to: "/admin/projects" }, { label: title }]}
      title={title}
      desc={desc}
      action={action}
    />
  );

  if (boot.status === "loading") {
    return (
      <div className="animate-page-in">
        {header()}
        <div className="columns-1 gap-4 px-4 pb-10 sm:columns-2 md:px-8 xl:columns-3" aria-busy="true" aria-label="Đang tải">
          {[220, 300, 260, 340, 240, 280].map((h, i) => <div key={i} style={{ height: h }} className="mb-4 animate-pulse rounded-2xl bg-primary-50 break-inside-avoid" />)}
        </div>
      </div>
    );
  }

  if (boot.status === "error" || projectId === null) {
    return (
      <div className="animate-page-in">
        {header()}
        <div role="alert" className="mx-4 rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-16 text-center md:mx-8">
          <p className="font-semibold text-heading">{boot.status === "error" ? "Không tải được danh sách dự án" : "Chưa có dự án nào"}</p>
          {boot.status === "error" && (
            <button onClick={() => { setBoot({ status: "loading" }); setReloadKey((n) => n + 1); }} className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">Thử lại</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-page-in">
      {header()}
      <ProjectManageBar projectId={projectId} />

      <div className="px-4 pb-12 md:px-8">
        {/* Thanh công cụ */}
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-body" aria-live="polite">
            <b className="text-footer">{project?.name}</b> · {list.length} ảnh
          </p>
          <label className="relative block">
            <select value={newestFirst ? "new" : "old"} onChange={(e) => setNewestFirst(e.target.value === "new")} aria-label="Sắp xếp ảnh" className="h-11 appearance-none rounded-full border border-line bg-white pl-5 pr-10 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100">
              <option value="new">Mới nhất trước</option>
              <option value="old">Cũ nhất trước</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
          </label>
          <input ref={picker} type="file" accept="image/*" multiple hidden onChange={(e) => { void addFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
          <button
            onClick={() => picker.current?.click()}
            disabled={uploading}
            className="ml-auto flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
          >
            <Plus size={16} /> Thêm ảnh
          </button>
        </div>

        <div className="mt-6">
          {images === null ? (
            <div className="columns-1 gap-4 sm:columns-2 xl:columns-3" aria-busy="true" aria-label="Đang tải ảnh">
              {[220, 300, 260, 340, 240, 280].map((h, i) => <div key={i} style={{ height: h }} className="mb-4 animate-pulse rounded-2xl bg-primary-50 break-inside-avoid" />)}
            </div>
          ) : list.length === 0 ? (
            <UploadDropzone large busy={uploading} onFiles={addFiles} />
          ) : (
            <>
              <UploadDropzone busy={uploading} onFiles={addFiles} />
              <div className="mt-6">
                <ImageGallery images={list} labelOf={labelOf} dateOf={dateOf} onView={setViewing} onDelete={setDeleting} />
              </div>
            </>
          )}
        </div>
      </div>

      {viewing !== null && list[viewing] && (
        <Lightbox
          images={list.map((img) => ({ src: img.imageUrl, title: labelOf(img), date: img.createdAt }))}
          index={viewing}
          onIndexChange={setViewing}
          onClose={() => setViewing(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Xóa ảnh này?"
          message={`Bạn có chắc chắn muốn xóa "${labelOf(deleting)}" khỏi dự án ${project?.name} không? Hành động này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
