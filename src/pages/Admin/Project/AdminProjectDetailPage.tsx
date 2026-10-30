import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import ProjectInfoCard from "../../../components/Admin/project/general/ProjectInfoCard";
import ProjectZonesCard from "../../../components/Admin/project/general/ProjectZonesCard";
import ProjectBuildingsCard from "../../../components/Admin/project/general/ProjectBuildingsCard";
import ProjectSalesSheetsCard from "../../../components/Admin/project/general/ProjectSalesSheetsCard";
import { isHighRise } from "../../../components/Admin/project/general/buildingType";
import ProjectManageBar from "../../../components/Admin/project/manage/ProjectManageBar";
import { rememberSelectedProject } from "../../../hooks/project/useSelectedProject";
import SafeImage from "../../../components/common/SafeImage";
import { getErrorMessage } from "../../../api";
import { useToast } from "../../../components/common/toastContext";
import { useAdminProject } from "../../../hooks/project/useAdminProject";
import { adminProjectService } from "../../../services/project/adminProjectService";

const crumb = [{ label: "Tổng quan", to: "/admin/dashboard" }, { label: "Dự án", to: "/admin/projects" }];

export default function AdminProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const projectId = Number(id);
  const state = useAdminProject(Number.isFinite(projectId) ? projectId : undefined);
  const [confirming, setConfirming] = useState(false);

  // Dự án đang xem trở thành dự án đang chọn của các mục quản lý nội dung
  const loadedId = state.status === "ready" ? state.project.id : null;
  useEffect(() => {
    if (loadedId !== null) rememberSelectedProject(loadedId);
  }, [loadedId]);

  if (state.status === "loading") {
    return <div className="animate-pulse px-4 py-10 md:px-8" aria-busy="true"><div className="h-40 rounded-2xl bg-primary-100" /><div className="mt-6 h-72 rounded-2xl bg-primary-50" /></div>;
  }
  if (state.status === "error") {
    return (
      <div className="px-4 py-24 text-center" role="alert">
        <p className="text-xl font-semibold text-heading">Không tìm thấy dự án</p>
        <Link to="/admin/projects" className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700">Về danh sách dự án</Link>
      </div>
    );
  }

  const p = state.project;

  const remove = async () => {
    try {
      await adminProjectService.remove(p.id);
      toast.show(`Đã xóa dự án ${p.name}`);
      navigate("/admin/projects");
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    }
  };

  const action = (
    <div className="flex gap-2">
      <Link to={`/admin/projects/${p.id}/edit`} className="rounded-lg border border-line bg-white px-5 py-2.5 text-sm font-semibold text-footer shadow-sm transition hover:bg-primary-50">Sửa</Link>
      <button onClick={() => setConfirming(true)} className="rounded-lg bg-danger px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-95">Xóa</button>
    </div>
  );

  return (
    <>
      <AdminPageHeader
        breadcrumb={[...crumb, { label: "Chi tiết dự án" }]}
        title={p.name}
        desc={`${p.investor} · ${p.location}`}
        action={action}
      />

      <div className="-mt-16 space-y-6 px-4 pb-10 md:px-8">
        <div className="-mx-4 -mb-2 md:-mx-8">
          <ProjectManageBar projectId={p.id} />
        </div>
        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-footer">Ảnh tổng quan</h2>
            <Link to={`/admin/projects/${p.id}/edit`} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-footer transition hover:bg-primary-50">Thay đổi</Link>
          </div>
          <SafeImage src={p.overviewImage ?? undefined} alt={p.name} className="mt-4 h-40 w-full rounded-xl object-cover md:h-56" />
        </section>

        <ProjectInfoCard project={p} />

        <ProjectZonesCard project={p} />

        {isHighRise(p.buildingType) && (
          <>
            <ProjectBuildingsCard projectId={p.id} />
            <ProjectSalesSheetsCard projectId={p.id} />
          </>
        )}
      </div>

      {confirming && (
        <ConfirmDialog
          title="Xóa dự án?"
          message="Bạn có chắc chắn muốn xóa dự án này không? Hành động này không thể hoàn tác."
          onConfirm={remove}
          onClose={() => setConfirming(false)}
        />
      )}
    </>
  );
}
