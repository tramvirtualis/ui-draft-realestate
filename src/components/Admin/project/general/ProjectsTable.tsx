import ProjectRow from "./ProjectRow";
import type { AdminProject } from "../../../../types/project/adminProject.types";

type Props = {
  projects: AdminProject[]; // đã cắt theo trang
  startIndex: number;
  onDelete: (p: AdminProject) => void;
  onStatus: (p: AdminProject, status: AdminProject["status"]) => void;
  onToggleBooking: (p: AdminProject) => void;
};

const COLUMNS = ["STT", "Hình ảnh", "Tên dự án", "Chủ đầu tư", "Địa điểm", "Loại hình", "Ngày tạo", "Thao tác"];

export default function ProjectsTable({ projects, startIndex, ...actions }: Props) {
  return (
    <div className="-mx-6 overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="text-[11px] uppercase text-heading">
            {COLUMNS.map((c) => (
              <th key={c} scope="col" className="px-4 py-2.5 font-semibold first:pl-6">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => (
            <ProjectRow key={p.id} project={p} index={startIndex + i + 1} {...actions} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
