import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronsDownUp, ChevronsUpDown, Images, Pencil, PlayCircle, Plus, Trash2 } from "lucide-react";
import ProgressVideo from "../../../components/Project/Detail/progress/ProgressVideo";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import ProgressFormModal from "../../../components/Admin/project/progress/ProgressFormModal";
import { useToast } from "../../../components/common/toastContext";
import { getErrorMessage } from "../../../api";
import { adminProjectService } from "../../../services/project/adminProjectService";
import { progressService, type ProgressInput } from "../../../services/project/progressService";
import { formatDate } from "../../../utils/formatDate";
import type { AdminProject } from "../../../types/project/adminProject.types";
import type { Progress } from "../../../types/project/progress.types";
import ProjectManageBar from "../../../components/Admin/project/manage/ProjectManageBar";
import { useSelectedProject } from "../../../hooks/project/useSelectedProject";
import TableSkeleton from "../../../components/common/TableSkeleton";

type Boot = { status: "loading" } | { status: "error" } | { status: "ready"; projects: AdminProject[] };
type FormState = { progress: Progress | null } | null;

// Quản lý tiến độ xây dựng của từng dự án (bảng Progress + Progress_Images)
export default function ProgressManagementPage() {
  const toast = useToast();
  const [boot, setBoot] = useState<Boot>({ status: "loading" });
  const [items, setItems] = useState<Progress[] | null>(null);
  const [form, setForm] = useState<FormState>(null);
  const [deleting, setDeleting] = useState<Progress | null>(null);
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
    progressService
      .list(projectId)
      .then((list) => !cancelled && setItems(list))
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [projectId, reload]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);

  // Danh sách xếp từ cũ đến mới, mỗi báo cáo mở / thu gọn được
  const [openIds, setOpenIds] = useState<Set<number>>(() => new Set());
  const sorted = useMemo(
    () =>
      [...(items ?? [])].sort(
        (a, b) => new Date(a.reportDate ?? a.createdAt).getTime() - new Date(b.reportDate ?? b.createdAt).getTime(),
      ),
    [items],
  );
  const allOpen = sorted.length > 0 && sorted.every((p) => openIds.has(p.id));
  const toggle = (id: number) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const save = async (input: ProgressInput, files: File[], removeIds: number[]) => {
    if (projectId === null) return;
    setSubmitting(true);
    try {
      if (form?.progress) await progressService.update(form.progress.id, projectId, input, files, removeIds);
      else {
        await progressService.create(projectId, input, files);
      }
      toast.show(form?.progress ? "Đã lưu thay đổi" : "Đã thêm tiến độ");
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
      await progressService.remove(deleting.id);
      toast.show("Đã xóa tiến độ");
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    }
    setDeleting(null);
  };

  const header = (action?: React.ReactNode) => (
    <AdminPageHeader
      soft
      breadcrumb={[{ label: "Dự án", to: "/admin/projects" }, { label: "Quản lý tiến độ" }]}
      title="Quản lý tiến độ dự án"
      desc="Cập nhật các mốc và báo cáo tiến độ xây dựng kèm hình ảnh công trường; hiển thị tại tab Tiến độ của dự án."
      action={action}
    />
  );

  if (boot.status === "loading") {
    return (
      <div className="animate-page-in">
        {header()}
        <div className="animate-pulse space-y-4 px-4 pb-10 md:px-8" aria-busy="true">
          {[0, 1, 2].map((n) => <div key={n} className="h-32 rounded-2xl bg-primary-50" />)}
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
            <b className="text-footer">{project?.name}</b> · {items?.length ?? 0} báo cáo
          </p>
          <button
            onClick={() => setForm({ progress: null })}
            className="ml-auto flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
          >
            <Plus size={16} /> Thêm tiến độ
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {items === null ? (
            <TableSkeleton rows={4} label="Đang tải tiến độ" />
          ) : items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-16 text-center text-sm text-body">
              Dự án chưa có báo cáo tiến độ nào.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted">Xếp từ cũ đến mới · bấm vào từng báo cáo để xem chi tiết</p>
                <button
                  type="button"
                  onClick={() => setOpenIds(allOpen ? new Set() : new Set(sorted.map((p) => p.id)))}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-footer transition hover:bg-primary-50"
                >
                  {allOpen ? <ChevronsDownUp size={13} /> : <ChevronsUpDown size={13} />}
                  {allOpen ? "Thu gọn tất cả" : "Mở tất cả"}
                </button>
              </div>
              {sorted.map((p, i) => {
                const open = openIds.has(p.id);
                const current = i === sorted.length - 1;
                return (
                  <article key={p.id} className={`rounded-2xl border bg-white shadow-sm transition ${open ? "border-primary-200" : "border-line"}`}>
                    <div className="flex items-center gap-3 p-4 md:p-5">
                      <button
                        type="button"
                        onClick={() => toggle(p.id)}
                        aria-expanded={open}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${open ? "rotate-180 border-primary-600 bg-primary-600 text-white" : "border-line text-primary-700"}`}
                          aria-hidden
                        >
                          <ChevronDown size={15} />
                        </span>
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2 text-xs font-semibold text-primary-600">
                            {formatDate(p.reportDate ?? p.createdAt)}
                            {current && <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] text-white">Hiện tại</span>}
                          </span>
                          <span className="mt-0.5 block truncate text-base font-semibold text-footer md:text-lg">{p.title}</span>
                          {!open && (p.images.length > 0 || p.videoUrl) && (
                            <span className="mt-1 flex items-center gap-3 text-xs text-muted">
                              {p.images.length > 0 && <span className="inline-flex items-center gap-1"><Images size={12} /> {p.images.length} ảnh</span>}
                              {p.videoUrl && <span className="inline-flex items-center gap-1"><PlayCircle size={12} /> Video</span>}
                            </span>
                          )}
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center gap-2">
                        <button onClick={() => setForm({ progress: p })} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-footer transition hover:bg-primary-50">
                          <Pencil size={13} /> <span className="hidden sm:inline">Chỉnh sửa</span>
                        </button>
                        <button onClick={() => setDeleting(p)} aria-label={`Xóa ${p.title}`} title="Xóa" className="flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/5 text-danger transition hover:bg-danger/10">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {open && (
                      <div className="animate-rise-in border-t border-line px-4 pb-5 pt-4 md:px-5">
                        {p.content ? (
                          <p className="whitespace-pre-line text-sm leading-relaxed text-body">{p.content}</p>
                        ) : (
                          <p className="text-sm text-muted">Không có nội dung mô tả.</p>
                        )}
                        {(p.videoUrl || p.images.length > 0) && (
                          <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-1">
                            {p.videoUrl && <ProgressVideo url={p.videoUrl} title={p.title} />}
                            {p.images.map((img) => (
                              <img key={img.id} src={img.imageUrl} alt={p.title} className="h-20 w-28 shrink-0 rounded-lg object-cover" />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </>
          )}
        </div>
      </div>

      {form && <ProgressFormModal progress={form.progress} submitting={submitting} onSubmit={save} onClose={() => setForm(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Xóa tiến độ này?"
          message={`Bạn có chắc chắn muốn xóa "${deleting.title}" cùng các hình ảnh kèm theo không? Hành động này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
