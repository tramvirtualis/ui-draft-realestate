import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useRememberedProject } from "../../hooks/project/useSelectedProject";
import {
  selectIsSuperAdmin,
  selectPermissions,
  useAppSelector,
} from "../../store";
import { canAccessAdminPath } from "../../config/adminAccess";
import {
  LayoutDashboard,
  Newspaper,
  BookOpenText,
  Bell,
  Settings,
  UserRound,
  Building2,
  Users,
  ChevronDown,
  X,
  type LucideIcon,
  Calendars,
} from "lucide-react";
import logo from "../../assets/images/logo.jpg";

type Leaf = { label: string; to: string };
type Item = { label: string; icon: LucideIcon; to?: string; children?: Leaf[] };

const MENU: Item[] = [
  { label: "Tổng quan", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Quản lý tin tức", icon: Newspaper, to: "/admin/news" },
  {
    label: "Tài liệu",
    icon: BookOpenText,
    children: [
      { label: "Quản lý tài liệu", to: "/admin/documents" },
      { label: "Quản lý danh mục", to: "/admin/document-categories" },
    ],
  },
  { label: "Quản lý sự kiện", icon: Calendars, to: "/admin/events" },
  {
    label: "Thông báo",
    icon: Bell,
    children: [
      { label: "Quản lý thông báo", to: "/admin/notifications" },
      { label: "Loại thông báo", to: "/admin/notification-types" },
    ],
  },
  {
    label: "Hệ thống",
    icon: Settings,
    children: [
      { label: "Quản lý người dùng", to: "/admin/users" },
      { label: "Phân quyền", to: "/admin/roles" },
      { label: "Quản lý chat bot", to: "/admin/chatbot" },
      { label: "Nhật ký hoạt động", to: "/admin/audit-logs" },
    ],
  },
  {
    label: "Tuyển dụng",
    icon: UserRound,
    children: [
      { label: "Tin tuyển dụng", to: "/admin/jobs" },
      { label: "Loại công việc", to: "/admin/job-types" },
      { label: "Quản lý ứng viên", to: "/admin/applications" },
      { label: "Quản lý template CV", to: "/admin/cv-templates" },
      { label: "Nhà tuyển dụng", to: "/admin/companies" },
    ],
  },
  {
    label: "Dự án",
    icon: Building2,
    children: [
      { label: "Quản lý dự án", to: "/admin/projects" },
      { label: "Nhân sự dự án", to: "/admin/project-staff" },
      { label: "Quỹ căn", to: "/admin/properties" },
      { label: "Quản lý ảnh dự án", to: "/admin/project-images" },
      { label: "Quản lý mặt bằng quỹ căn", to: "/admin/project-floor-plan" },
      { label: "Quản lý tòa nhà", to: "/admin/project-buildings" },
      { label: "Quản lý bảng hàng", to: "/admin/project-sales-sheets" },
      { label: "Quản lý booking", to: "/admin/bookings" },
      { label: "Quản lý tiện ích", to: "/admin/project-amenities" },
      { label: "Quản lý video", to: "/admin/project-videos" },
      { label: "Quản lý vị trí", to: "/admin/project-location" },
      { label: "Tour 360°", to: "/admin/project-tours" },
      { label: "Quản lý hỏi đáp", to: "/admin/project-questions" },
      { label: "Quản lý chính sách", to: "/admin/project-policies" },
      { label: "Quản lý tiến độ", to: "/admin/project-progress" },
      { label: "Quản lý tài liệu dự án", to: "/admin/project-documents" },
    ],
  },
  {
    label: "Cộng đồng",
    icon: Users,
    children: [
      { label: "Quản lý bài đăng", to: "/admin/posts" },
      { label: "Quảng cáo cộng đồng", to: "/admin/social-ads" },
      { label: "Màu nền bài viết", to: "/admin/post-backgrounds" },
    ],
  },
];

// Sidebar sáng (trắng ánh tím): mục đang mở nền tím nhạt, chữ tím đậm + vạch tím bên trái
const linkClass = (active: boolean) =>
  `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition focus-visible:outline-2 focus-visible:outline-primary-500 ${
    active
      ? "bg-primary-100 font-semibold text-primary-700 before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary-600"
      : "text-heading hover:bg-primary-50"
  }`;

type Props = { open: boolean; onClose: () => void };

export default function AdminSidebar({ open, onClose }: Props) {
  const { pathname } = useLocation();
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const permissions = useAppSelector(selectPermissions);
  // Chỉ hiện mục có quyền (bảng quyền ở config/adminAccess); nhóm không còn mục con nào thì ẩn cả nhóm
  const menu = useMemo(() => {
    const allowed = (to: string) =>
      canAccessAdminPath(to, permissions, isSuperAdmin);
    return MENU.flatMap((item): Item[] => {
      if (!item.children) return allowed(item.to!) ? [item] : [];
      const children = item.children.filter((c) => allowed(c.to));
      return children.length ? [{ ...item, children }] : [];
    });
  }, [permissions, isSuperAdmin]);
  const selectedProject = useRememberedProject();
  // Mục quản lý theo dự án mở đúng dự án đang chọn
  const withProject = (to: string) =>
    selectedProject && to.startsWith("/admin/project-")
      ? `${to}?project=${selectedProject}`
      : to;
  // Mặc định thu gọn hết các nhóm, bấm vào nhóm nào thì nhóm đó mới mở / đóng
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto border-r border-primary-100 bg-white [scrollbar-width:thin] transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Điều hướng quản trị"
      >
        <div className="flex items-center justify-between border-b border-primary-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Đất Việt Group" className="h-10 w-10 rounded-xl object-contain" />
            <div className="leading-tight">
              <p className="font-heading text-sm font-extrabold uppercase tracking-[0.08em] text-heading">
                Đất Việt <span className="text-primary-600">Group</span>
              </p>
              <p className="mt-0.5 font-heading text-[9px] font-bold uppercase tracking-[0.24em] text-muted">
                Trang quản trị
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng menu"
            className="rounded-full p-2 text-body hover:bg-primary-50 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-5">
          {menu.map((item) => {
            const Icon = item.icon;
            if (!item.children) {
              return (
                <NavLink
                  key={item.label}
                  to={item.to!}
                  onClick={onClose}
                  className={({ isActive }) => linkClass(isActive)}
                >
                  <Icon size={20} /> {item.label}
                </NavLink>
              );
            }
            const groupActive = item.children.some((c) =>
              pathname.startsWith(c.to)
            );
            const expanded = !!expandedGroups[item.label];
            return (
              <div key={item.label}>
                <button
                  onClick={() =>
                    setExpandedGroups((s) => ({ ...s, [item.label]: !expanded }))
                  }
                  aria-expanded={expanded}
                  className={`${linkClass(false)} w-full ${
                    groupActive ? "font-semibold text-primary-700" : ""
                  }`}
                >
                  <Icon size={20} />{" "}
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    size={16}
                    className={`transition ${expanded ? "" : "-rotate-90"}`}
                  />
                </button>
                {expanded && (
                  <ul className="ml-[22px] mt-1 space-y-0.5 border-l border-primary-100 pl-3">
                    {item.children.map((c) => (
                      <li key={c.to}>
                        <NavLink
                          to={withProject(c.to)}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition ${
                              isActive
                                ? "bg-primary-100 font-semibold text-primary-700"
                                : "text-body hover:bg-primary-50 hover:text-primary-700"
                            }`
                          }
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-primary-300" />{" "}
                          {c.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
