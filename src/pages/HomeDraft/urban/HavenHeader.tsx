import { useEffect, useState, type CSSProperties } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, Bell, ChevronDown, ChevronRight, LogOut, Menu, Search, X } from "lucide-react";
import NotificationDrawer from "../../../components/Notification/NotificationDrawer";
import Avatar from "../../../components/common/Avatar";
import useHeader, { type HeaderController } from "../../../layouts/UserLayout/useHeader";
import type { AuthUser } from "../../../types/auth/auth.types";
import HubtechLogo from "../../../components/Home/HubtechLogo";

// Header bản nháp kiểu HAVEN (trắng / đen / xám, Inter): đủ nội dung như header trang chủ thật —
// 7 mục menu, tìm kiếm, thông báo, menu tài khoản / đăng nhập, lối vào quản trị, menu điện thoại.
// Dùng chung logic useHeader; trong suốt ở đầu trang, cuộn xuống thì nền trắng mờ.

const BLACK = "#080808";
const GRAY = "#707070";

const NAV_ITEMS = [
  { label: "Giới thiệu", path: "/" },
  { label: "Dự án", path: "/projects" },
  { label: "Sự kiện", path: "/events" },
  { label: "Tin tức", path: "/news" },
  { label: "Cộng đồng", path: "/social" },
  { label: "Kiến thức", path: "/knowledge" },
  { label: "Tuyển dụng", path: "/jobs" },
];

const iconBtn = "relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-current/10";

function AccountMenu({ header, user }: { header: HeaderController; user: AuthUser }) {
  const { roleLabel, adminPath, accountMenu, menuRef, menuOpen, toggleMenu, closeMenu, logout } = header;
  return (
    <div ref={menuRef} className="relative">
      <button onClick={toggleMenu} aria-expanded={menuOpen} className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-black/5">
        <Avatar src={user.avatarUrl} fullName={user.fullName} className="h-8 w-8 shrink-0 text-xs" />
        <span className="hidden max-w-[110px] truncate text-xs font-medium xl:block">{user.fullName}</span>
        <ChevronDown size={14} className={`transition ${menuOpen ? "rotate-180" : ""}`} style={{ color: GRAY }} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(280px,calc(100vw-2rem))] origin-top-right animate-[menu-drop_0.28s_cubic-bezier(0.2,0.8,0.2,1)] border border-[#e4e4e4] bg-[#fefefe] p-2 text-[#080808] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]">
          <div className="border-b border-[#e4e4e4] p-3">
            <div className="flex items-center gap-2.5">
              <Avatar src={user.avatarUrl} fullName={user.fullName} className="h-10 w-10 shrink-0 text-sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.fullName}</p>
                <p className="truncate text-[11px]" style={{ color: GRAY }}>
                  {user.email}
                </p>
              </div>
              {roleLabel && <span className="shrink-0 border border-[#080808] px-1.5 py-0.5 text-[9px] font-medium uppercase">{roleLabel}</span>}
            </div>
            {adminPath && (
              <Link to={adminPath} onClick={closeMenu} className="group mt-3 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide transition hover:text-[#0a9150]">
                Trang quản trị <ArrowUpRight size={12} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
          <ul className="py-1">
            {accountMenu.map(({ to, icon: Icon, label, count }, i) => (
              <li key={to} className="animate-[menu-item_0.35s_ease-out_both]" style={{ animationDelay: `${60 + i * 30}ms` }}>
                <Link to={to} onClick={closeMenu} className="group relative flex items-center gap-2.5 overflow-hidden px-3 py-2 text-[13px] transition-colors hover:text-[#0a9150]">
                  {/* Nền xanh nhạt quét từ trái sang + vạch xanh đậm bên trái */}
                  <span className="absolute inset-0 origin-left scale-x-0 bg-[#d6f7e1] transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100" aria-hidden />
                  <span className="absolute inset-y-1 left-0 w-0.5 origin-bottom scale-y-0 bg-[#0a9150] transition-transform delay-100 duration-200 group-hover:scale-y-100" aria-hidden />
                  <Icon size={14} className="relative text-[#707070] transition duration-300 group-hover:translate-x-1 group-hover:text-[#0a9150]" />
                  <span className="relative transition-transform duration-300 group-hover:translate-x-1">{label}</span>
                  {count ? (
                    <span className="relative ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#080808] px-1.5 text-[10px] font-medium text-white transition group-hover:bg-[#0a9150]">{count}</span>
                  ) : (
                    <ChevronRight size={13} className="relative ml-auto -translate-x-1 text-[#707070] opacity-40 transition duration-300 group-hover:translate-x-0 group-hover:text-[#0a9150] group-hover:opacity-100" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <button onClick={logout} className="group relative flex w-full items-center gap-2.5 overflow-hidden border-t border-[#e4e4e4] px-3 py-2.5 text-[13px] font-medium text-red-600">
            <span className="absolute inset-0 origin-left scale-x-0 bg-red-50 transition-transform duration-300 group-hover:scale-x-100" aria-hidden />
            <LogOut size={14} className="relative transition-transform duration-300 group-hover:translate-x-1" />
            <span className="relative">Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
}

function MobileMenu({ header }: { header: HeaderController }) {
  const { mobileOpen, closeMobile, user, roleLabel, adminPath, accountMenu, logout } = header;
  return (
    <div className={`fixed inset-0 z-[70] lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`} aria-hidden={!mobileOpen}>
      <div className={`absolute inset-0 flex flex-col bg-[#fefefe] text-[#080808] transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`}>
        <div className="flex h-18 items-center justify-between px-5">
          <HubtechLogo />
          <button type="button" onClick={closeMobile} aria-label="Đóng menu" className={iconBtn}>
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {user ? (
            <Link to="/account" onClick={closeMobile} className="flex items-center gap-3 border-y border-[#e4e4e4] py-4">
              <Avatar src={user.avatarUrl} fullName={user.fullName} className="h-11 w-11 shrink-0 text-sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{user.fullName}</span>
                <span className="block truncate text-xs" style={{ color: GRAY }}>
                  {roleLabel || user.email}
                </span>
              </span>
              <ArrowUpRight size={16} />
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login" onClick={closeMobile} className="border border-[#080808] py-3 text-center text-sm font-medium uppercase">
                Đăng nhập
              </Link>
              <Link to="/register" onClick={closeMobile} className="bg-[#080808] py-3 text-center text-sm font-medium uppercase text-white">
                Đăng ký
              </Link>
            </div>
          )}
          {user && adminPath && (
            <Link to={adminPath} onClick={closeMobile} className="mt-3 flex items-center justify-between text-sm font-medium uppercase">
              Trang quản trị <ArrowUpRight size={15} />
            </Link>
          )}
          <ul className="mt-8">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink to={item.path} end={item.path === "/"} onClick={closeMobile} className="flex items-center justify-between py-2.5 text-3xl font-medium uppercase tracking-tight">
                  {item.label} <ArrowUpRight size={20} strokeWidth={1.5} />
                </NavLink>
              </li>
            ))}
          </ul>
          {user && (
            <ul className="mt-8 border-t border-[#e4e4e4] pt-4">
              {accountMenu.map(({ to, icon: Icon, label, count }) => (
                <li key={to}>
                  <Link to={to} onClick={closeMobile} className="flex items-center gap-3 py-2.5 text-sm">
                    <Icon size={16} style={{ color: GRAY }} /> {label}
                    {count > 0 && <span className="ml-auto rounded-full bg-[#080808] px-1.5 text-[10px] font-medium text-white">{count}</span>}
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" onClick={logout} className="mt-4 flex items-center gap-2 text-sm font-medium text-red-600">
                  <LogOut size={16} /> Đăng xuất
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// onDark: trang có banner tối (video) → khi chưa cuộn, chữ / icon / nút trắng; cuộn xuống thì về chữ đen nền trắng
export default function HavenHeader({
  home = "/",
  font = '"Inter", system-ui, sans-serif',
  onDark = false,
}: {
  home?: string;
  font?: string;
  onDark?: boolean;
}) {
  const header = useHeader();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled ? "border-b border-[#e6dccb] bg-[#f6f1e7]/90 backdrop-blur-xl" : "border-b border-transparent"
      }`}
      style={{ color: onDark && !scrolled ? "#fefefe" : BLACK, fontFamily: font }}
    >
      <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between gap-6 px-5 md:px-10">
        <Link to={home} className="flex shrink-0 items-center gap-2.5">
          <HubtechLogo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex xl:gap-9" aria-label="Điều hướng chính">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className="group relative flex items-center gap-1.5 whitespace-nowrap text-sm"
            >
              {({ isActive }) => (
                // Thanh lịch: chữ chuyển màu êm + gạch chân mảnh kéo từ trái sang (trên video dùng xanh lá nhạt cho dễ đọc).
                // Trang đang mở: giữ sẵn màu nhấn + gạch chân
                <span
                  className={`relative block py-1 leading-5 transition-colors duration-500 group-hover:text-[var(--nav-hover)] ${isActive ? "text-[var(--nav-hover)]" : ""}`}
                  style={{ "--nav-hover": onDark && !scrolled ? "#86efac" : "#0a9150" } as CSSProperties}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--nav-hover)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 ${isActive ? "scale-x-100" : "scale-x-0"}`}
                    aria-hidden
                  />
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <button aria-label="Tìm kiếm" className={`${iconBtn} group hidden sm:flex`}>
            <Search size={17} strokeWidth={1.5} className="transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-115" />
          </button>
          {header.user ? (
            <>
              <button
                onClick={header.openNotif}
                aria-label={header.unreadNotifications > 0 ? `Thông báo, ${header.unreadNotifications} chưa đọc` : "Thông báo"}
                className={`${iconBtn} group`}
              >
                <Bell size={17} strokeWidth={1.5} className="origin-top group-hover:animate-[bell-ring_0.7s_ease-in-out]" />
                {header.unreadNotifications > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#080808] px-1 text-[9px] font-medium text-white">
                    {header.unreadNotifications > 99 ? "99+" : header.unreadNotifications}
                  </span>
                )}
              </button>
              {header.notifOpen && <NotificationDrawer onClose={header.closeNotif} />}
              <AccountMenu header={header} user={header.user} />
            </>
          ) : (
            <Link to="/login" className="hidden px-2 text-sm transition hover:opacity-60 sm:block">
              Đăng nhập
            </Link>
          )}
          <button type="button" onClick={header.openMobile} aria-label="Mở menu" aria-expanded={header.mobileOpen} className={`${iconBtn} lg:hidden`}>
            <Menu size={21} strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <MobileMenu header={header} />
    </header>
  );
}
