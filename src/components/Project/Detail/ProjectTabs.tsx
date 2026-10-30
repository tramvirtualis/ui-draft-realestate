import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  Building2, ChevronDown, ChevronLeft, ChevronRight, Compass, FileSpreadsheet, FileText, Home, LayoutGrid, Map as MapIcon, MapPin, Newspaper, Percent, Rotate3d, TrendingUp, type LucideIcon,
} from "lucide-react";
import { isHighRise } from "../../Admin/project/general/buildingType";
import { projectService } from "../../../services/project/projectService";
import { parseProjectId } from "../../../utils/slug";

// Mỗi tab: trang riêng (path) hoặc cuộn tới mục (hash) trong trang tổng quan dự án
type Tab = {
  label: string;
  icon: LucideIcon;
  path?: string;
  hash?: string;
  only?: "high-rise" | "low-rise";
  highRiseLabel?: string; // tên tab riêng cho dự án cao tầng
};

const TABS: Tab[] = [
  { label: "Tổng quan", icon: Compass, path: "" },
  { label: "Vị trí", icon: MapPin, path: "/location" },
  { label: "Phân khu", icon: LayoutGrid, path: "/zones" },
  { label: "Tòa nhà", icon: Building2, path: "/buildings", only: "high-rise" },
  { label: "Mặt bằng quỹ căn", highRiseLabel: "Mặt bằng", icon: MapIcon, path: "/floor-plans" },
  { label: "Bảng hàng", icon: FileSpreadsheet, path: "/sales-sheets", only: "high-rise" },
  { label: "Quỹ căn", icon: Home, path: "/inventory" },
  { label: "Ảnh 360°", icon: Rotate3d, path: "/tour-360" },
  { label: "Chính sách bán hàng", icon: Percent, path: "/policy" },
  { label: "Tiến độ", icon: TrendingUp, path: "/progress" },
  { label: "Tài liệu", icon: FileText, path: "/documents" },
  { label: "Tin tức", icon: Newspaper, path: "/news" },
];

const highRiseCache = new Map<number, boolean>();

// Thanh mục của dự án: kính trắng dính ngay dưới thanh điều hướng (cao 4rem), tab dạng viên thuốc, tab đang xem tím đặc
export default function ProjectTabs({ activeHash, highRise }: { activeHash?: string; highRise?: boolean }) {
  const { id } = useParams();
  const projectId = parseProjectId(id);
  const { pathname } = useLocation();
  const base = `/projects/${id}`;
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  const [isHigh, setIsHigh] = useState<boolean>(() => {
    if (highRise !== undefined) return highRise;
    if (projectId != null && highRiseCache.has(projectId)) {
      return highRiseCache.get(projectId)!;
    }
    return false;
  });

  useEffect(() => {
    if (projectId == null) return;
    if (highRise !== undefined) {
      highRiseCache.set(projectId, highRise);
      setIsHigh(highRise);
      return;
    }
    if (highRiseCache.has(projectId)) {
      setIsHigh(highRiseCache.get(projectId)!);
      return;
    }
    let cancelled = false;
    projectService
      .getProject(projectId)
      .then((p) => {
        const hr = isHighRise(p.buildingType);
        highRiseCache.set(projectId, hr);
        if (!cancelled) setIsHigh(hr);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [projectId, highRise]);

  const isActive = (t: Tab) => {
    if (t.hash) return pathname === base && activeHash === t.hash;
    if (!t.path) return pathname === base && !activeHash;
    if (t.path === "/sales-sheets") {
      return pathname === `${base}/sales-sheets` || pathname === `${base}/sales-sheet`;
    }
    return pathname === base + (t.path ?? "");
  };

  const visibleTabs = TABS.filter((t) => {
    if (!t.only) return true;
    if (t.only === "high-rise") return isHigh;
    if (t.only === "low-rise") return !isHigh;
    return true;
  });

  // Màn hẹp: cuộn ngang để tab đang xem nằm giữa thanh (chỉ cuộn thanh, không cuộn trang)
  useEffect(() => {
    const list = listRef.current;
    const tab = activeRef.current;
    if (!list || !tab) return;
    list.scrollTo({ left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2 });
  }, [pathname, activeHash, visibleTabs.length]);

  // Còn tab bị khuất bên trái / phải không → hiện mép mờ + nút mũi tên
  const [edges, setEdges] = useState({ left: false, right: false });
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () =>
      setEdges({
        left: list.scrollLeft > 4,
        right: list.scrollLeft + list.clientWidth < list.scrollWidth - 4,
      });
    update();
    list.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(list);
    return () => {
      list.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [visibleTabs.length]);

  const scrollBy = (dir: 1 | -1) => {
    const list = listRef.current;
    list?.scrollBy({ left: dir * list.clientWidth * 0.6, behavior: "smooth" });
  };

  const arrow = "absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-primary-700 shadow-md transition hover:bg-primary-50";

  // Điện thoại: thanh gọn (mục đang xem + nút mở) và lưới 2 cột liệt kê đủ các mục
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => setMenuOpen(false), [pathname, activeHash]);
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => !navRef.current?.contains(e.target as Node) && setMenuOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);
  const labelOf = (t: Tab) => (isHigh && t.highRiseLabel ? t.highRiseLabel : t.label);
  // Mục đang xem: tìm trong mọi tab (kể cả tab đang ẩn, vd. "Tòa nhà" ở dự án thấp tầng); trang không phải tab
  // (So sánh căn…) thì ghi đúng tên trang, không rơi về "Tổng quan" gây hiểu nhầm
  const EXTRA: Record<string, { label: string; icon: LucideIcon }> = { "/compare": { label: "So sánh căn", icon: LayoutGrid } };
  const extra = EXTRA[pathname.slice(base.length)];
  const activeTab = TABS.find(isActive);
  const current = activeTab
    ? { label: labelOf(activeTab), icon: activeTab.icon }
    : (extra ?? { label: "Mục dự án", icon: Compass });
  const CurrentIcon = current.icon;

  return (
    <nav
      ref={navRef}
      aria-label="Mục của dự án"
      className="sticky top-18 z-40 border-b border-line bg-[#faf5f0]/90 backdrop-blur-xl"
    >
      {/* ===== Điện thoại ===== */}
      <div className="px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="project-tabs-menu"
          className="flex w-full items-center gap-2 py-3 text-left"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
            <CurrentIcon size={15} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Đang xem</span>
            <span className="block truncate font-heading text-sm font-semibold uppercase text-heading">{current.label}</span>
          </span>
          <span className="flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 font-heading text-[11px] font-semibold uppercase text-primary-700">
            Các mục ({visibleTabs.length})
            <ChevronDown size={14} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} aria-hidden />
          </span>
        </button>
        {menuOpen && (
          <ul id="project-tabs-menu" className="grid grid-cols-2 gap-1.5 border-t border-line pb-3 pt-3">
            {visibleTabs.map((t) => {
              const to = t.hash ? `${base}#${t.hash}` : base + (t.path ?? "");
              const active = isActive(t);
              const Icon = t.icon;
              return (
                <li key={t.label}>
                  <Link
                    to={to}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 font-heading text-[12px] font-semibold uppercase leading-tight transition ${
                      active ? "btn-gloss text-white" : "bg-white text-body hover:text-primary-700"
                    }`}
                  >
                    <Icon size={14} aria-hidden className={`shrink-0 ${active ? "" : "text-primary-500"}`} />
                    {labelOf(t)}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ===== Máy tính bảng / máy tính: dải tab cuộn ngang ===== */}
      <div className="container relative mx-auto hidden px-4 md:block lg:px-8">
        {edges.left && (
          <>
            <span className="pointer-events-none absolute inset-y-0 left-4 z-[5] w-16 bg-linear-to-r from-white to-transparent lg:left-8" aria-hidden />
            <button type="button" onClick={() => scrollBy(-1)} aria-label="Xem các mục phía trước" className={`${arrow} left-3 lg:left-6`}>
              <ChevronLeft size={16} />
            </button>
          </>
        )}
        {edges.right && (
          <>
            <span className="pointer-events-none absolute inset-y-0 right-4 z-[5] w-16 bg-linear-to-l from-white to-transparent lg:right-8" aria-hidden />
            <button type="button" onClick={() => scrollBy(1)} aria-label="Xem các mục tiếp theo" className={`${arrow} right-3 lg:right-6`}>
              <ChevronRight size={16} />
            </button>
          </>
        )}
        <div ref={listRef} className="relative overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* w-max + mx-auto: đủ chỗ thì nằm giữa, thiếu chỗ thì cuộn ngang */}
          <div className="mx-auto flex w-max gap-0.5 xl:gap-1">
          {visibleTabs.map((t) => {
            const to = t.hash ? `${base}#${t.hash}` : base + (t.path ?? "");
            const active = isActive(t);
            const Icon = t.icon;
            return (
              <Link
                key={t.label}
                ref={active ? activeRef : undefined}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 font-heading text-[11.5px] font-semibold uppercase tracking-[0.03em] transition 2xl:px-4 2xl:text-[12px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300 ${
                  active ? "btn-gloss text-white" : "text-body hover:bg-primary-50 hover:text-primary-700"
                }`}
              >
                <Icon size={14} aria-hidden className={active ? "" : "text-primary-500"} />
                {isHigh && t.highRiseLabel ? t.highRiseLabel : t.label}
              </Link>
            );
          })}
          </div>
        </div>
      </div>
    </nav>
  );
}

