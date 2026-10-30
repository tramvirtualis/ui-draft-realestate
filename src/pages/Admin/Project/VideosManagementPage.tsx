import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Pencil, Play, Plus, Trash2, Video as VideoIcon } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import VideoFormModal from "../../../components/Admin/project/videos/VideoFormModal";
import { useToast } from "../../../components/common/toastContext";
import { getErrorMessage } from "../../../api";
import { adminProjectService } from "../../../services/project/adminProjectService";
import { videoService, type VideoInput } from "../../../services/project/videoService";
import { formatDate } from "../../../utils/formatDate";
import { parseVideoSource } from "../../../utils/videoSource";
import type { AdminProject } from "../../../types/project/adminProject.types";
import type { VideoDto } from "../../../types/project/project.types";
import ProjectManageBar from "../../../components/Admin/project/manage/ProjectManageBar";
import { useSelectedProject } from "../../../hooks/project/useSelectedProject";
import TableSkeleton from "../../../components/common/TableSkeleton";

type Boot = { status: "loading" } | { status: "error" } | { status: "ready"; projects: AdminProject[] };
type FormState = { video: VideoDto | null } | null;

// Quản lý video giới thiệu của từng dự án (bảng Video: name, video_url, description)
export default function VideosManagementPage() {
  const toast = useToast();
  const [boot, setBoot] = useState<Boot>({ status: "loading" });
  const [items, setItems] = useState<VideoDto[] | null>(null);
  const [form, setForm] = useState<FormState>(null);
  const [deleting, setDeleting] = useState<VideoDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reload, setReload] = useState(0);

  const projects = boot.status === "ready" ? boot.projects : [];
  const { projectId } = useSelectedProject(projects);
  const project = projects.find((p) => p.id === projectId);

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
  }, []);

  useEffect(() => {
    if (projectId === null) return;
    let cancelled = false;
    setItems(null); // đổi dự án: hiện khung chờ thay vì dữ liệu của dự án trước
    videoService
      .list(projectId)
      .then((list) => !cancelled && setItems(list))
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [projectId, reload]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);

  const save = async (input: VideoInput) => {
    if (projectId === null) return;
    setSubmitting(true);
    try {
      if (form?.video) await videoService.edit(form.video.id, projectId, input);
      else {
        await videoService.add(projectId, input);
      }
      toast.show(form?.video ? "Đã lưu thay đổi" : "Đã thêm video");
      setForm(null);
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting || projectId === null) return;
    try {
      await videoService.remove(deleting.id);
      toast.show("Đã xóa video");
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    }
    setDeleting(null);
  };

  const header = (action?: React.ReactNode) => (
    <AdminPageHeader
      soft
      breadcrumb={[{ label: "Dự án", to: "/admin/projects" }, { label: "Quản lý video" }]}
      title="Quản lý video dự án"
      desc="Thêm video giới thiệu bằng link YouTube; hiển thị tại mục Video của trang chi tiết dự án."
      action={action}
    />
  );

  if (boot.status === "loading") {
    return (
      <div className="animate-page-in">
        {header()}
        <div className="animate-pulse space-y-3 px-4 pb-10 md:px-8" aria-busy="true">
          {[0, 1, 2].map((n) => <div key={n} className="h-24 rounded-2xl bg-primary-50" />)}
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
        </div>
      </div>
    );
  }

  return (
    <div className="animate-page-in">
      {header()}
      <ProjectManageBar projectId={projectId} />

      <div className="px-4 pb-12 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-body" aria-live="polite">
            <b className="text-footer">{project?.name}</b> · {items?.length ?? 0} video
          </p>
          <button
            onClick={() => setForm({ video: null })}
            className="ml-auto flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
          >
            <Plus size={16} /> Thêm video
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {items === null ? (
            <TableSkeleton rows={4} label="Đang tải video" />
          ) : items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-16 text-center text-sm text-body">
              Dự án chưa có video nào.
            </p>
          ) : (
            items.map((v) => {
              const src = parseVideoSource(v.videoUrl);
              return (
                <article key={v.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-3 shadow-sm sm:flex-nowrap">
                  <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-xl bg-primary-100">
                    {src.poster ? (
                      <img src={src.poster} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-200 to-primary-100 text-primary-500">
                        <VideoIcon size={24} />
                      </span>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-footer/20">
                      <Play size={18} className="fill-white text-white" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-footer" title={v.name}>{v.name}</p>
                    {v.description && <p className="mt-0.5 line-clamp-1 text-xs text-body">{v.description}</p>}
                    <a href={v.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1 truncate text-xs text-primary-600 hover:underline">
                      <ExternalLink size={12} className="shrink-0" /> <span className="truncate">{v.videoUrl}</span>
                    </a>
                  </div>
                  <span className="hidden text-xs text-muted md:block">{formatDate(v.createdAt)}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <button onClick={() => setForm({ video: v })} aria-label={`Sửa ${v.name}`} title="Chỉnh sửa" className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-footer transition hover:bg-primary-50">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleting(v)} aria-label={`Xóa ${v.name}`} title="Xóa" className="flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/5 text-danger transition hover:bg-danger/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {form && <VideoFormModal video={form.video} submitting={submitting} onSubmit={save} onClose={() => setForm(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Xóa video này?"
          message={`Bạn có chắc chắn muốn xóa "${deleting.name}" khỏi dự án không? Hành động này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
