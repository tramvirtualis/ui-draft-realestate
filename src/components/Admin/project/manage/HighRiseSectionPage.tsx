import { useEffect, useState } from "react";
import { Home, type LucideIcon } from "lucide-react";
import AdminPageHeader from "../../AdminPageHeader";
import ProjectManageBar from "./ProjectManageBar";
import SectionNotice from "../general/SectionNotice";
import { isHighRise } from "../general/buildingType";
import { adminProjectService } from "../../../../services/project/adminProjectService";
import { useSelectedProject } from "../../../../hooks/project/useSelectedProject";
import type { AdminProject } from "../../../../types/project/adminProject.types";

type Props = {
  title: string;
  desc: string;
  icon: LucideIcon;
  pendingTitle: string;
  pendingDesc: string;
};

type Boot = { status: "loading" } | { status: "error" } | { status: "ready"; projects: AdminProject[] };

// Khung trang quản lý chỉ dành cho dự án cao tầng (Tòa nhà, Bảng hàng): chọn dự án + thanh mục quản lý;
// phần nội dung chưa làm nên hiện thông báo; chọn dự án thấp tầng thì báo mục không áp dụng
export default function HighRiseSectionPage({ title, desc, icon, pendingTitle, pendingDesc }: Props) {
  const [boot, setBoot] = useState<Boot>({ status: "loading" });
  const projects = boot.status === "ready" ? boot.projects : [];
  const { projectId } = useSelectedProject(projects);
  const project = projects.find((p) => p.id === projectId);

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

  const header = <AdminPageHeader soft breadcrumb={[{ label: "Dự án", to: "/admin/projects" }, { label: title }]} title={title} desc={desc} />;

  if (boot.status === "loading") {
    return (
      <div className="animate-page-in">
        {header}
        <div className="animate-pulse px-4 pb-10 md:px-8" aria-busy="true"><div className="h-60 rounded-2xl bg-primary-50" /></div>
      </div>
    );
  }

  if (boot.status === "error" || projectId === null) {
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
      <div className="px-4 pb-12 md:px-8">
        {isHighRise(project?.buildingType) ? (
          <SectionNotice icon={icon} title={pendingTitle} desc={pendingDesc} />
        ) : (
          <SectionNotice
            icon={Home}
            title={`${project?.name ?? "Dự án"} là dự án thấp tầng`}
            desc={`Mục ${title.toLowerCase()} chỉ dành cho dự án cao tầng. Dự án thấp tầng quản lý theo phân khu và mặt bằng quỹ căn.`}
          />
        )}
      </div>
    </div>
  );
}
