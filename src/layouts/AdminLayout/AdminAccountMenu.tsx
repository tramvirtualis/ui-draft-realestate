import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Globe, Loader2, LogOut } from "lucide-react";
import authService from "../../services/auth/authService";
import { selectCurrentUser, useAppSelector } from "../../store";
import Avatar from "../../components/common/Avatar";
import { roleLabel } from "../../utils/user";

const item =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition disabled:opacity-60";

// Góc phải thanh trên trang quản trị: bấm vào tên để mở menu (về trang web, đăng xuất)
export default function AdminAccountMenu() {
  const user = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const name = user?.fullName ?? "Quản trị viên";

  // Bấm ra ngoài hoặc nhấn Esc thì đóng menu
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Giống đăng xuất bên trang người dùng: gọi API thu hồi phiên rồi về trang đăng nhập
  const logout = async () => {
    setLeaving(true);
    try {
      await authService.logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div ref={root} className="relative border-l border-line pl-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Tài khoản quản trị"
        className="flex items-center gap-3 rounded-xl p-1 pr-2 text-left transition hover:bg-primary-50"
      >
        <Avatar src={user?.avatarUrl} fullName={name} className="h-10 w-10 shrink-0 text-xs" />
        <span className="hidden leading-tight md:block">
          <span className="block text-sm font-medium text-heading">{name}</span>
          <span className="block text-[11px] text-body">{user?.role ? roleLabel(user.role) : "Quản trị viên"}</span>
        </span>
        <ChevronDown size={14} className={`hidden text-body transition md:block ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-64 rounded-2xl border border-line bg-white p-2 shadow-xl">
          <div className="flex items-center gap-3 border-b border-line px-3 pb-3 pt-1">
            <Avatar src={user?.avatarUrl} fullName={name} className="h-10 w-10 shrink-0 text-xs" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-heading">{name}</p>
              {user?.email && <p className="truncate text-xs text-body">{user.email}</p>}
            </div>
          </div>
          <div className="pt-2">
            <Link to="/" role="menuitem" onClick={() => setOpen(false)} className={`${item} text-heading hover:bg-primary-50`}>
              <Globe size={16} /> Về trang web
            </Link>
            <button type="button" role="menuitem" onClick={() => void logout()} disabled={leaving} className={`${item} text-danger hover:bg-danger/10`}>
              {leaving ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
              {leaving ? "Đang đăng xuất..." : "Đăng xuất"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
