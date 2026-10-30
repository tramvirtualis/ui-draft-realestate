import { useCallback, useEffect, useState } from "react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import ProjectManageBar from "../../../components/Admin/project/manage/ProjectManageBar";
import StaffCard from "../../../components/Admin/project/staff/StaffCard";
import StaffPicker from "../../../components/Admin/project/staff/StaffPicker";
import TableSkeleton from "../../../components/common/TableSkeleton";
import { useToast } from "../../../components/common/toastContext";
import { getErrorMessage } from "../../../api";
import { adminProjectService } from "../../../services/project/adminProjectService";
import { adminStaffService } from "../../../services/project/staffService";
import { useSelectedProject } from "../../../hooks/project/useSelectedProject";
import type { AdminProject } from "../../../types/project/adminProject.types";
import type { ProjectStaff, StaffMember, StaffType } from "../../../types/project/staff.types";

type Boot = { status: "loading" } | { status: "error" } | { status: "ready"; projects: AdminProject[] };
type Removing = { type: StaffType; member: StaffMember } | null;

const LABEL: Record<StaffType, string> = { ADMIN: "admin dự án", DIRECTOR: "giám đốc dự án" };

// Nhân sự dự án: admin dự án (SUPER_ADMIN hoặc admin dự án thêm, chỉ SUPER_ADMIN gỡ) và giám đốc dự án (admin dự án thêm); cả hai hiện ở form booking
export default function StaffManagementPage() {
  const toast = useToast();
  const [boot, setBoot] = useState<Boot>({ status: "loading" });
  const projects = boot.status === "ready" ? boot.projects : [];
  const { projectId } = useSelectedProject(projects);
  const [staff, setStaff] = useState<ProjectStaff | null>(null);
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<Removing>(null);

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
    setStaff(await adminStaffService.get(projectId));
  }, [projectId]);

  useEffect(() => {
    setStaff(null);
    load().catch((e) => toast.show(getErrorMessage(e), "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await action();
      toast.show(success);
      setRemoving(null);
      await load();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const add = (type: StaffType, member: StaffMember) => {
    if (projectId === null) return;
    void run(() => adminStaffService.add(projectId, type, member.userId), `Đã thêm ${member.fullName} làm ${LABEL[type]}`);
  };

  const header = (
    <AdminPageHeader
      soft
      breadcrumb={[{ label: "Dự án", to: "/admin/projects" }, { label: "Nhân sự" }]}
      title="Nhân sự dự án"
      desc="Admin dự án quản lý nội dung của dự án; giám đốc dự án do admin dự án thêm vào. Cả hai hiện ở form booking kèm số điện thoại và Zalo."
    />
  );

  if (boot.status === "loading") {
    return <div className="animate-page-in">{header}<div className="px-4 md:px-8"><TableSkeleton rows={4} label="Đang tải" /></div></div>;
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
        {staff === null ? (
          <TableSkeleton rows={4} label="Đang tải nhân sự" />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <StaffCard
              title="Admin dự án"
              members={staff.admins}
              canEdit={staff.canAddAdmins}
              canRemove={staff.canManageAdmins}
              note={staff.canAddAdmins ? "Chỉ SUPER_ADMIN được gỡ admin dự án." : "Chỉ admin dự án hoặc SUPER_ADMIN được thêm admin dự án."}
              picker={<StaffPicker type="ADMIN" excludeIds={staff.admins.map((m) => m.userId)} busy={busy} onPick={(m) => add("ADMIN", m)} />}
              onRemove={(member) => setRemoving({ type: "ADMIN", member })}
            />
            <StaffCard
              title="Giám đốc dự án"
              members={staff.directors}
              canEdit={staff.canManageDirectors}
              note="Chỉ admin dự án hoặc Quản trị hệ thống được thêm hoặc gỡ giám đốc dự án."
              picker={<StaffPicker type="DIRECTOR" excludeIds={staff.directors.map((m) => m.userId)} busy={busy} onPick={(m) => add("DIRECTOR", m)} />}
              onRemove={(member) => setRemoving({ type: "DIRECTOR", member })}
            />
          </div>
        )}
      </div>

      {removing && (
        <ConfirmDialog
          title={`Gỡ ${removing.member.fullName}?`}
          message={`Tài khoản sẽ không còn là ${LABEL[removing.type]} của dự án này.`}
          confirmLabel="Gỡ"
          busy={busy}
          onConfirm={() =>
            void run(() => adminStaffService.remove(projectId, removing.type, removing.member.userId), `Đã gỡ ${LABEL[removing.type]}`)
          }
          onClose={() => setRemoving(null)}
        />
      )}
    </div>
  );
}
