import { useCallback, useEffect, useState } from "react";
import { ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import AmenityFormModal from "../../../components/Admin/project/amenities/AmenityFormModal";
import { useToast } from "../../../components/common/toastContext";
import { getErrorMessage } from "../../../api";
import { adminProjectService } from "../../../services/project/adminProjectService";
import { amenityService } from "../../../services/project/amenityService";
import type { AdminProject } from "../../../types/project/adminProject.types";
import type { AmenityDto } from "../../../types/project/project.types";
import ProjectManageBar from "../../../components/Admin/project/manage/ProjectManageBar";
import { useSelectedProject } from "../../../hooks/project/useSelectedProject";

type Boot = { status: "loading" } | { status: "error" } | { status: "ready"; projects: AdminProject[] };
type FormState = { amenity: AmenityDto | null } | null;

// Quản lý tiện ích của từng dự án (bảng Amenities: name, image_url)
export default function AmenitiesManagementPage() {
  const toast = useToast();
  const [boot, setBoot] = useState<Boot>({ status: "loading" });
  const [items, setItems] = useState<AmenityDto[] | null>(null);
  const [form, setForm] = useState<FormState>(null);
  const [deleting, setDeleting] = useState<AmenityDto | null>(null);
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
    amenityService
      .list(projectId)
      .then((list) => !cancelled && setItems(list))
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [projectId, reload]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);

  const save = async (name: string, image?: File) => {
    if (projectId === null) return;
    setSubmitting(true);
    try {
      if (form?.amenity) await amenityService.edit(form.amenity.id, projectId, name, image);
      else {
        await amenityService.add(projectId, name, image);
      }
      toast.show(form?.amenity ? "Đã lưu thay đổi" : "Đã thêm tiện ích");
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
      await amenityService.remove(deleting.id);
      toast.show("Đã xóa tiện ích");
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    }
    setDeleting(null);
  };

  const header = (action?: React.ReactNode) => (
    <AdminPageHeader
      soft
      breadcrumb={[{ label: "Dự án", to: "/admin/projects" }, { label: "Quản lý tiện ích" }]}
      title="Quản lý tiện ích dự án"
      desc="Thêm các tiện ích nội khu (hồ bơi, công viên, phòng gym...) kèm ảnh; hiển thị tại mục Tiện ích của trang chi tiết dự án."
      action={action}
    />
  );

  if (boot.status === "loading") {
    return (
      <div className="animate-page-in">
        {header()}
        <div className="grid animate-pulse gap-4 px-4 pb-10 sm:grid-cols-2 md:px-8 xl:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((n) => <div key={n} className="h-52 rounded-2xl bg-primary-50" />)}
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
            <b className="text-footer">{project?.name}</b> · {items?.length ?? 0} tiện ích
          </p>
          <button
            onClick={() => setForm({ amenity: null })}
            className="ml-auto flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
          >
            <Plus size={16} /> Thêm tiện ích
          </button>
        </div>

        <div className="mt-6">
          {items === null ? (
            <div className="grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
              {[0, 1, 2].map((n) => <div key={n} className="h-52 rounded-2xl bg-primary-50" />)}
            </div>
          ) : items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-16 text-center text-sm text-body">
              Dự án chưa có tiện ích nào.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((a) => (
                <li key={a.id} className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-100">
                  <div className="relative h-40 bg-primary-50">
                    {a.imageUrl ? (
                      <img src={a.imageUrl} alt={a.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-primary-300"><ImageOff size={30} /></span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <p className="min-w-0 truncate font-semibold text-footer" title={a.name}>{a.name}</p>
                    <div className="flex shrink-0 items-center gap-2">
                      <button onClick={() => setForm({ amenity: a })} aria-label={`Sửa ${a.name}`} title="Chỉnh sửa" className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-footer transition hover:bg-primary-50">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleting(a)} aria-label={`Xóa ${a.name}`} title="Xóa" className="flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/5 text-danger transition hover:bg-danger/10">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {form && <AmenityFormModal amenity={form.amenity} submitting={submitting} onSubmit={save} onClose={() => setForm(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Xóa tiện ích này?"
          message={`Bạn có chắc chắn muốn xóa "${deleting.name}" khỏi dự án không? Hành động này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
