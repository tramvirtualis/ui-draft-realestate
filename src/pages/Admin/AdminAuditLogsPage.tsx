import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import AuditLogStats from "../../components/Admin/auditLogs/AuditLogStats";
import AuditLogFilters from "../../components/Admin/auditLogs/AuditLogFilters";
import AuditLogTable from "../../components/Admin/auditLogs/AuditLogTable";
import AuditLogDetailModal from "../../components/Admin/auditLogs/AuditLogDetailModal";
import { formatIp, formatUser } from "../../components/Admin/auditLogs/auditLogUtils";
import { adminAuditLogService } from "../../services/admin/adminAuditLogService";
import { adminProjectService } from "../../services/project/adminProjectService";
import { useAppSelector } from "../../store";
import type { AuditLogItem } from "../../types/admin/auditLog.types";

const PAGE_LIMIT = 20;

export default function AdminAuditLogsPage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [selectedModule, setSelectedModule] = useState("ALL");
  const [selectedMethod, setSelectedMethod] = useState("ALL");
  const [selectedHours, setSelectedHours] = useState(24);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [activeItem, setActiveItem] = useState<AuditLogItem | null>(null);
  const [projectMap, setProjectMap] = useState<Record<string, string>>({});

  const observerRef = useRef<HTMLDivElement | null>(null);

  // Nạp map tên dự án từ localStorage và API
  useEffect(() => {
    const map: Record<string, string> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("project_name_")) {
          const id = k.replace("project_name_", "");
          const name = localStorage.getItem(k);
          if (name) map[id] = name;
        }
      }
      setProjectMap(map);
    } catch (_) {}

    adminProjectService
      .list()
      .then((list) => {
        list.forEach((p) => {
          if (p.id) {
            map[String(p.id)] = p.name;
            try {
              localStorage.setItem(`project_name_${p.id}`, p.name);
            } catch (_) {}
          }
        });
        setProjectMap({ ...map });
      })
      .catch(() => {});
  }, []);

  // Fetch log từ BE: tương thích cả BE cũ (trả về mảng) lẫn BE mới (trả về object cursor)
  const fetchLogs = useCallback(
    async (cursorToUse?: string | null, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const res = await adminAuditLogService.getLogs({
          module: selectedModule !== "ALL" ? selectedModule : undefined,
          hours: from || to ? undefined : selectedHours,
          from: from || undefined,
          to: to || undefined,
          cursor: cursorToUse || undefined,
          limit: PAGE_LIMIT,
        });

        // Tương thích cả trường hợp BE trả về mảng trực tiếp lẫn object AuditLogCursorResponse
        const rawList: AuditLogItem[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.items)
          ? res.items
          : [];

        if (isLoadMore) {
          setItems((prev) => [...(Array.isArray(prev) ? prev : []), ...rawList]);
        } else {
          setItems(rawList);
        }

        setNextCursor(Array.isArray(res) ? null : (res?.nextCursor ?? null));
        setHasMore(Array.isArray(res) ? false : Boolean(res?.hasMore));
      } catch (err) {
        console.error("fetchLogs failed:", err);
        if (!isLoadMore) {
          setItems([]);
          setNextCursor(null);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedModule, selectedHours, from, to]
  );

  // Gọi trang đầu mỗi khi bộ lọc thay đổi
  useEffect(() => {
    void fetchLogs(null, false);
  }, [fetchLogs]);

  // Tự động làm mới mỗi 15s nếu bật autoRefresh (chỉ nạp lại trang đầu)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      void fetchLogs(null, false);
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  // Bấm nút hoặc cuộn để tải thêm
  const handleLoadMore = useCallback(() => {
    if (!nextCursor || loadingMore || loading) return;
    void fetchLogs(nextCursor, true);
  }, [nextCursor, loadingMore, loading, fetchLogs]);

  // Tự động tải thêm khi cuộn đến cuối bảng (Infinite Scroll)
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const el = observerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, loadingMore, loading, handleLoadMore]);

  // Đặt lại bộ lọc
  const handleReset = () => {
    setSearchInput("");
    setSelectedModule("ALL");
    setSelectedMethod("ALL");
    setSelectedHours(24);
    setFrom("");
    setTo("");
  };

  // Lọc an toàn phía client theo method và ô tìm kiếm trên danh sách đã tải
  const safeItems = Array.isArray(items) ? items : [];
  const filteredItems = safeItems.filter((item) => {
    const matchMethod = selectedMethod === "ALL" || item.method === selectedMethod;
    const kw = searchInput.toLowerCase().trim();
    const matchKeyword =
      !kw ||
      item.userEmail?.toLowerCase().includes(kw) ||
      formatUser(item.userEmail, currentUser?.email).toLowerCase().includes(kw) ||
      item.actionTitle?.toLowerCase().includes(kw) ||
      item.targetName?.toLowerCase().includes(kw) ||
      item.description?.toLowerCase().includes(kw) ||
      item.uri?.toLowerCase().includes(kw) ||
      item.traceId?.toLowerCase().includes(kw) ||
      formatIp(item.clientIp).toLowerCase().includes(kw);
    return matchMethod && matchKeyword;
  });

  const totalLogs = filteredItems.length;
  const successLogs = filteredItems.filter((i) => i.status && i.status >= 200 && i.status < 300).length;
  const errorLogs = filteredItems.filter((i) => i.status && i.status >= 400).length;
  const slowLogs = filteredItems.filter((i) => i.durationMs && i.durationMs >= 1000).length;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <AdminPageHeader
        breadcrumb={[
          { label: "Quản trị", to: "/admin" },
          { label: "Hệ thống", to: "/admin/users" },
          { label: "Nhật ký hoạt động" },
        ]}
        title="Nhật ký hoạt động"
        desc="Theo dõi toàn bộ thao tác thêm, sửa, xóa và truy cập của ban quản trị hệ thống theo thời gian thực"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-body shadow-sm hover:bg-slate-50">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-400"
              />
              Tự động làm mới (15s)
            </label>
            <button
              onClick={() => void fetchLogs(null, false)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-footer shadow-sm ring-1 ring-line hover:bg-slate-50 disabled:opacity-50"
            >
              <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
              Làm mới
            </button>
          </div>
        }
      />

      <div className="-mt-16 px-4 md:px-8">
        {/* Thống kê nhanh */}
        <AuditLogStats
          total={totalLogs}
          success={successLogs}
          error={errorLogs}
          slow={slowLogs}
        />

        {/* Thanh tìm kiếm & Bộ lọc */}
        <AuditLogFilters
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          selectedModule={selectedModule}
          onModuleChange={setSelectedModule}
          selectedMethod={selectedMethod}
          onMethodChange={setSelectedMethod}
          selectedHours={selectedHours}
          onHoursChange={setSelectedHours}
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
          onReset={handleReset}
        />

        {/* Bảng dữ liệu */}
        <AuditLogTable
          items={filteredItems}
          loading={loading}
          currentUserEmail={currentUser?.email}
          projectMap={projectMap}
          onViewDetail={(item) => setActiveItem(item)}
        />

        {/* Chân bảng: Phân trang Cursor / Tự động cuộn vô tận (Infinite Scroll) */}
        {!loading && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm sm:flex-row">
            <p className="text-xs text-muted">
              Đang hiển thị <span className="font-semibold text-heading">{filteredItems.length}</span> bản ghi nhật ký
            </p>

            {hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
              >
                {loadingMore ? (
                  <>
                    <RotateCcw size={14} className="animate-spin" />
                    <span>Đang tải thêm nhật ký...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    <span>Cuộn xuống hoặc bấm để tải thêm (20 dòng)</span>
                  </>
                )}
              </button>
            ) : items.length > 0 ? (
              <span className="text-xs text-muted">
                ✓ Đã hiển thị toàn bộ nhật ký trong khoảng thời gian này
              </span>
            ) : null}
          </div>
        )}

        {/* Điểm kích hoạt cuộn vô tận (Infinite Scroll Sentinel) */}
        <div ref={observerRef} className="h-6 w-full" />
      </div>

      {/* Modal Chi tiết */}
      <AuditLogDetailModal
        item={activeItem}
        currentUserEmail={currentUser?.email}
        projectMap={projectMap}
        onClose={() => setActiveItem(null)}
      />
    </div>
  );
}
