import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { adminProjectService } from "../../../../services/project/adminProjectService";
import { rememberSelectedProject } from "../../../../hooks/project/useSelectedProject";
import { MANAGE_SECTIONS, sectionsFor } from "./manageSections";
import { isHighRise } from "../general/buildingType";
import type { AdminProject } from "../../../../types/project/adminProject.types";

type Props = { projectId: number };

type ProjectOption = { id: number; name: string; highRise: boolean };

// Danh sách dự án dùng chung giữa các trang quản lý (tải một lần; dự án đang xem chưa có trong danh sách,
// vd vừa tạo, thì tải lại để có tên và loại hình xây dựng)
let cache: ProjectOption[] | null = null;
let pending: Promise<ProjectOption[]> | null = null;

const loadProjects = async (projectId: number) => {
  if (cache?.some((p) => p.id === projectId)) return cache;
  pending ??= adminProjectService
    .list()
    .then((list: AdminProject[]) => (cache = list.map((p) => ({ id: p.id, name: p.name, highRise: isHighRise(p.buildingType) }))))
    .finally(() => {
      pending = null;
    });
  return pending;
};

/**
 Thanh quản lý dự án đặt ở đầu MỌI trang quản lý theo dự án:
 - combo chọn dự án (đổi dự án thì ở lại đúng mục đang xem);
 - các tab theo loại hình xây dựng: dự án cao tầng có thêm Tòa nhà + Bảng hàng (MANAGE_SECTIONS).
 */
export default function ProjectManageBar({ projectId }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectOption[]>(cache ?? []);

  useEffect(() => {
    let cancelled = false;
    loadProjects(projectId)
      .then((list) => !cancelled && setProjects(list))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const current = MANAGE_SECTIONS.find((s) => pathname.startsWith(s.match));
  const sectionsOf = (id: number) => sectionsFor(projects.find((p) => p.id === id)?.highRise ?? false);
  const sections = sectionsOf(projectId);

  // Đổi dự án thì ở lại mục đang xem; dự án mới không có mục đó (khác loại hình) thì về Thông tin
  const change = (id: number) => {
    rememberSelectedProject(id);
    const target = current && sectionsOf(id).includes(current) ? current : MANAGE_SECTIONS[0];
    navigate(target.to(id), { replace: true });
  };

  return (
    <nav aria-label="Quản lý dự án" className="px-4 pb-4 md:px-8">
      <div className="space-y-3 rounded-2xl border border-line bg-white p-3 shadow-sm">
        <label className="relative block w-full sm:w-80">
          <span className="sr-only">Chọn dự án</span>
          <select
            value={projectId}
            onChange={(e) => change(Number(e.target.value))}
            className="h-11 w-full appearance-none rounded-xl border border-line bg-primary-50/60 pl-4 pr-10 text-sm font-semibold text-footer outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
          >
            {/* dự án hiện tại luôn có trong danh sách kể cả khi danh sách chưa tải xong */}
            {!projects.some((p) => p.id === projectId) && <option value={projectId}>Dự án #{projectId}</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        </label>

        <ul className="flex flex-wrap gap-1.5">
          {sections.map((s) => {
            const active = current?.key === s.key;
            const Icon = s.icon;
            return (
              <li key={s.key}>
                <Link
                  to={s.to(projectId)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    active ? "bg-primary-600 text-white shadow-md shadow-primary-200" : "text-heading hover:bg-primary-50"
                  }`}
                >
                  <Icon size={15} aria-hidden /> {s.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
