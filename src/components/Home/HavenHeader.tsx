import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, Bell, ChevronDown, ChevronRight, LogOut, Menu, Search, X } from "lucide-react";
import NotificationDrawer from "../Notification/NotificationDrawer";
import Avatar from "../common/Avatar";
import useHeader, { type HeaderController } from "../../layouts/UserLayout/useHeader";
import type { AuthUser } from "../../types/auth/auth.types";
import HubtechLogo from "./HubtechLogo";

// Header chung kiểu HAVEN (trắng / đen / xám, Inter) —
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
              <Link to={adminPath} onClick={closeMenu} className="group mt-3 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide transition hover:text-[#a67d12]">
                Trang quản trị <ArrowUpRight size={12} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
          <ul className="py-1">
            {accountMenu.map(({ to, icon: Icon, label, count }, i) => (
              <li key={to} className="animate-[menu-item_0.35s_ease-out_both]" style={{ animationDelay: `${60 + i * 30}ms` }}>
                <Link to={to} onClick={closeMenu} className="group relative flex items-center gap-2.5 overflow-hidden px-3 py-2 text-[13px] transition-colors hover:text-[#a67d12]">
                  {/* Nền xanh nhạt quét từ trái sang + vạch xanh đậm bên trái */}
                  <span className="absolute inset-0 origin-left scale-x-0 bg-[#fcf1cc] transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100" aria-hidden />
                  <span className="absolute inset-y-1 left-0 w-0.5 origin-bottom scale-y-0 bg-[#a67d12] transition-transform delay-100 duration-200 group-hover:scale-y-100" aria-hidden />
                  <Icon size={14} className="relative text-[#707070] transition duration-300 group-hover:translate-x-1 group-hover:text-[#a67d12]" />
                  <span className="relative transition-transform duration-300 group-hover:translate-x-1">{label}</span>
                  {count ? (
                    <span className="relative ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#080808] px-1.5 text-[10px] font-medium text-white transition group-hover:bg-[#a67d12]">{count}</span>
                  ) : (
                    <ChevronRight size={13} className="relative ml-auto -translate-x-1 text-[#707070] opacity-40 transition duration-300 group-hover:translate-x-0 group-hover:text-[#a67d12] group-hover:opacity-100" />
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

// Một nhóm gập / mở trong menu điện thoại (kiểu CGV): dòng tiêu đề chữ hoa có mũi tên, bấm để mở các mục con
function MenuGroup({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <li className="border-b border-[#e6dcd3]">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-3 px-5 py-4 text-left">
        <ChevronDown size={16} className={`shrink-0 transition-transform duration-300 ${open ? "" : "-rotate-90"}`} style={{ color: open ? "#a67d12" : GRAY }} />
        <span className={`text-[15px] font-semibold uppercase tracking-wide ${open ? "text-[#a67d12]" : ""}`}>{title}</span>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <ul className="overflow-hidden">{children}</ul>
      </div>
    </li>
  );
}

const subItem = "flex items-center gap-3 border-t border-[#efe7df] py-3.5 pl-12 pr-5 text-[15px] transition-colors";

// Menu điện thoại: bấm nút 3 gạch → ngăn kéo trượt vào từ bên phải, phần trang còn hở phủ tối (chạm để đóng).
// Các mục điều hướng xếp thẳng; nhóm "Tài khoản" gập / mở (khi đã đăng nhập). Gắn thẳng vào body (portal) để header
// có kính mờ (backdrop-filter) không bó khung "fixed" của menu vào trong header.
function MobileMenu({ header }: { header: HeaderController }) {
  const { mobileOpen, closeMobile, user, roleLabel, adminPath, accountMenu, logout } = header;
  return createPortal(
    <div className={`fixed inset-0 z-[70] overflow-hidden lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`} aria-hidden={!mobileOpen}>
      <button
        type="button"
        tabIndex={mobileOpen ? 0 : -1}
        aria-label="Đóng menu"
        onClick={closeMobile}
        className={`absolute inset-0 bg-[#080808]/50 transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
      />
      <nav
        aria-label="Menu điện thoại"
        className={`absolute inset-y-0 right-0 flex w-[min(86vw,380px)] flex-col bg-[#faf5f0] text-[#080808] shadow-[-20px_0_60px_-20px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#e6dcd3] px-5">
          <HubtechLogo />
          <button type="button" onClick={closeMobile} aria-label="Đóng menu" className={iconBtn}>
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* data-lenis-prevent: trang chủ có cuộn mượt Lenis → để vùng menu tự cuộn bên trong */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain">
          {/* Tài khoản / đăng nhập */}
          <div className="border-b border-[#e6dcd3] px-5 py-4">
            {user ? (
              <Link to="/account" onClick={closeMobile} className="flex items-center gap-3">
                <Avatar src={user.avatarUrl} fullName={user.fullName} className="h-11 w-11 shrink-0 text-sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{user.fullName}</span>
                  <span className="block truncate text-xs" style={{ color: GRAY }}>
                    {roleLabel || user.email}
                  </span>
                </span>
                <ChevronRight size={16} style={{ color: GRAY }} />
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
          </div>

          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.path} className="border-b border-[#e6dcd3]">
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  onClick={closeMobile}
                  className={({ isActive }) => `flex items-center px-5 py-4 text-[15px] transition-colors ${isActive ? "font-medium text-[#a67d12]" : "hover:text-[#a67d12]"}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}

            {user && (
              <MenuGroup title="Tài khoản">
                {adminPath && (
                  <li>
                    <Link to={adminPath} onClick={closeMobile} className={`${subItem} font-medium hover:text-[#a67d12]`}>
                      Trang quản trị <ArrowUpRight size={15} className="ml-auto" />
                    </Link>
                  </li>
                )}
                {accountMenu.map(({ to, icon: Icon, label, count }) => (
                  <li key={to}>
                    <Link to={to} onClick={closeMobile} className={`${subItem} hover:text-[#a67d12]`}>
                      <Icon size={16} style={{ color: GRAY }} /> {label}
                      {count > 0 && <span className="ml-auto rounded-full bg-[#080808] px-1.5 text-[10px] font-medium text-white">{count}</span>}
                    </Link>
                  </li>
                ))}
              </MenuGroup>
            )}
          </ul>

          {user && (
            <button type="button" onClick={logout} className="flex w-full items-center gap-2 px-5 py-4 text-sm font-medium text-red-600">
              <LogOut size={16} /> Đăng xuất
            </button>
          )}
        </div>
      </nav>
    </div>,
    document.body,
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
        scrolled ? "border-b border-[#e6dcd3] bg-[#faf5f0]/90 backdrop-blur-xl" : "border-b border-transparent"
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
                // Thanh lịch: chữ chuyển màu êm + gạch chân mảnh kéo từ trái sang (trên video dùng vàng nhạt cho dễ đọc).
                // Trang đang mở: giữ sẵn màu vàng + gạch chân
                <span
                  className={`relative block py-1 leading-5 transition-colors duration-500 group-hover:text-[var(--nav-hover)] ${isActive ? "text-[var(--nav-hover)]" : ""}`}
                  style={{ "--nav-hover": onDark && !scrolled ? "#f2cd5f" : "#a67d12" } as CSSProperties}
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
