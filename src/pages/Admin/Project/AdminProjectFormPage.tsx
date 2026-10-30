import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ProjectForm from "../../../components/Admin/project/general/ProjectForm";
import BuildingTypePicker from "../../../components/Admin/project/general/BuildingTypePicker";
import { getErrorMessage } from "../../../api";
import { useToast } from "../../../components/common/toastContext";
import { useAdminProject } from "../../../hooks/project/useAdminProject";
import { adminProjectService } from "../../../services/project/adminProjectService";
import type { AdminProjectInput } from "../../../types/project/adminProject.types";

const crumb = [{ label: "Tổng quan", to: "/admin/dashboard" }, { label: "Dự án", to: "/admin/projects" }];

// Trang Tạo (/admin/projects/new) và Sửa (/admin/projects/:id/edit) dùng chung một form.
// Tạo dự án gồm 2 bước: chọn loại hình xây dựng (cao tầng / thấp tầng) rồi mới nhập thông tin phù hợp.
export default function AdminProjectFormPage() {
  const { id } = useParams();
  const editing = id !== undefined;
  const projectId = Number(id);
  const navigate = useNavigate();
  const toast = useToast();
  const state = useAdminProject(editing && Number.isFinite(projectId) ? projectId : undefined);
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pickedType, setPickedType] = useState<string | null>(null); // loại hình chọn ở bước 1

  if (editing && state.status === "loading") {
    return <div className="animate-pulse px-4 py-10 md:px-8" aria-busy="true"><div className="h-32 rounded-2xl bg-primary-100" /><div className="mt-6 h-96 rounded-2xl bg-primary-50" /></div>;
  }
  if (editing && state.status === "error") {
    return (
      <div className="px-4 py-24 text-center" role="alert">
        <p className="text-xl font-semibold text-heading">Không tìm thấy dự án</p>
        <Link to="/admin/projects" className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700">Về danh sách dự án</Link>
      </div>
    );
  }

  const initial = editing && state.status === "ready" ? state.project : undefined;
  const back = initial ? `/admin/projects/${initial.id}` : "/admin/projects";
  // Loại hình đã lưu thì cố định; dự án cũ chưa có loại hình chọn như khi tạo mới
  const savedType = initial?.buildingType || null;
  const buildingType = savedType ?? pickedType;

  const submit = async (input: AdminProjectInput) => {
    setSubmitting(true);
    try {
      const saved = initial ? await adminProjectService.update(initial.id, input) : await adminProjectService.create(input);
      if (saved?.id && saved?.name) {
        try {
          localStorage.setItem(`project_name_${saved.id}`, saved.name);
        } catch (_) { }
      }
      toast.show(initial ? "Đã lưu thay đổi" : "Đã tạo dự án mới");
      navigate(`/admin/projects/${saved.id}`);
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        breadcrumb={[...crumb, { label: initial ? "Sửa dự án" : "Tạo dự án" }]}
        title={initial ? "Sửa dự án" : "Tạo dự án"}
        desc={
          !buildingType
            ? "Chọn loại hình xây dựng của dự án trước khi nhập thông tin."
            : initial
              ? `Cập nhật thông tin đã xác định của dự án ${initial.name}.`
              : `Nhập thông tin để tạo dự án ${buildingType.toLowerCase()} mới trong hệ thống.`
        }
      >
        {dirty && (
          <p role="status" className="mt-4 flex items-center gap-2 rounded-lg border border-warning/40 bg-amber-100 px-4 py-2.5 text-xs font-semibold text-warning">
            <span className="h-2 w-2 rounded-full bg-warning" /> Có thay đổi chưa lưu
          </p>
        )}
      </AdminPageHeader>

      <div className="-mt-16 px-4 pb-10 md:px-8">
        {buildingType ? (
          <ProjectForm
            initial={initial}
            buildingType={buildingType}
            onChangeType={savedType ? undefined : () => setPickedType(null)}
            submitting={submitting}
            onSubmit={submit}
            onCancel={() => navigate(back)}
            onDirtyChange={setDirty}
          />
        ) : (
          <BuildingTypePicker onPick={setPickedType} onCancel={() => navigate(back)} />
        )}
      </div>
    </>
  );
}
