import { Link, NavLink, Outlet } from "react-router-dom";
import {
  User,
  Heart,
  FileText,
  CalendarCheck,
  Briefcase,
  Bell,
  BookmarkCheck,
  LogIn,
  FileUser,
  Building2,
} from "lucide-react";
import { selectCurrentUser, useAppSelector } from "../../store";
import { roleLabel } from "../../utils/user";
import Avatar from "../../components/common/Avatar";

const MENU = [
  { to: "/account", icon: User, label: "Hồ sơ cá nhân", end: true },
  { to: "/account/favorites", icon: Heart, label: "Dự án đã lưu" },
  {
    to: "/account/saved-jobs",
    icon: BookmarkCheck,
    label: "Tin tuyển dụng đã lưu",
  },
  { to: "/account/cvs", icon: FileUser, label: "CV của tôi" },
  { to: "/account/bookings", icon: CalendarCheck, label: "Danh sách booking" },
  { to: "/applications", icon: Briefcase, label: "Lịch sử ứng tuyển" },
  { to: "/account/employer", icon: Building2, label: "Nhà tuyển dụng" },
  { to: "/account/notifications", icon: Bell, label: "Thông báo" },
];

// Khung trang tài khoản: sidebar bên trái + nội dung (Outlet) bên phải
export default function AccountLayout() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <div className="bg-white py-8">
      <div className="container mx-auto grid items-start gap-8 px-4 lg:grid-cols-[256px_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-3xl border border-line bg-white p-5 shadow-sm lg:sticky lg:top-28">
          {user ? (
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 p-3.5 text-white shadow-lg shadow-primary-200">
              <Avatar
                src={user.avatarUrl}
                fullName={user.fullName}
                className="h-10 w-10 shrink-0 border-2 border-white/60 text-sm"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user.fullName}
                </p>
                <p className="text-[11px] text-white/80">
                  {roleLabel(user.role)}
                </p>
              </div>
            </div>
          ) : (
            // Chưa có thông tin người dùng (chưa đăng nhập / chưa nạp được /users/me)
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 p-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-200 hover:opacity-95"
            >
              <LogIn size={17} />
              Đăng nhập
            </Link>
          )}

          <div className="my-5 h-px bg-line" />

          <nav className="space-y-1">
            {MENU.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm ${
                    isActive
                      ? "bg-primary-50 font-semibold text-primary-700"
                      : "text-heading hover:bg-primary-50/60"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r bg-primary-600" />
                    )}
                    <Icon
                      size={17}
                      className={isActive ? "text-primary-600" : "text-heading"}
                    />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
