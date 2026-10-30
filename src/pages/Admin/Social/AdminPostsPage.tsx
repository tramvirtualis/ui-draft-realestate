import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, LayoutList, Plus, RotateCcw, Search } from "lucide-react";
import Pagination from "../../../components/common/Pagination";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import FilterSelect from "../../../components/Admin/FilterSelect";
import PostDetailModal from "../../../components/Admin/posts/PostDetailModal";
import PostScopeTabs, { type PostScopeFilter } from "../../../components/Admin/posts/PostScopeTabs";
import PostsTable from "../../../components/Admin/posts/PostsTable";
import TableSkeleton from "../../../components/common/TableSkeleton";
import { useToast } from "../../../components/common/toastContext";
import useDelayedLoad from "../../../components/common/useDelayedLoad";
import { getErrorMessage } from "../../../api";
import { adminPostService } from "../../../services/social/adminPostService";
import type { AdminPost, AdminPostStats } from "../../../types/social/social.types";

const PAGE_SIZE = 10;
const EMPTY_STATS: AdminPostStats = { all: 0, publicPosts: 0, privatePosts: 0, hidden: 0 };

type StatusFilter = "all" | "active" | "hidden";

const field =
  "h-11 rounded-xl border border-line bg-white text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

const activeParam = (s: StatusFilter) => (s === "all" ? null : s === "active");

// Quản lý bài đăng cộng đồng: tìm kiếm, lọc phạm vi / trạng thái / khoảng ngày và phân trang ở server theo GET /api/admin/posts
export default function AdminPostsPage() {
  const toast = useToast();
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [scope, setScope] = useState<PostScopeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [viewing, setViewing] = useState<AdminPost | null>(null);
  const [hiding, setHiding] = useState<AdminPost | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Tìm khi bấm nút "Tìm kiếm" hoặc Enter; xóa hết chữ thì hiện lại toàn bộ danh sách ngay
  const search = (e: FormEvent) => {
    e.preventDefault();
    // Bấm lại với cùng từ khóa thì tải lại kết quả
    if (input.trim() === keyword) return list.reload();
    setKeyword(input.trim());
    setPage(0);
  };
  const changeInput = (value: string) => {
    setInput(value);
    if (!value.trim() && keyword) {
      setKeyword("");
      setPage(0);
    }
  };

  const loadStats = useCallback(() => adminPostService.stats().then(setStats).catch(() => undefined), []);
  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  // Chờ 1 giây (có skeleton) rồi mới gọi API khi đổi trang / bộ lọc; lần vào đầu tiên gọi ngay
  const list = useDelayedLoad(JSON.stringify([keyword, scope, status, from, to, page]), () =>
    adminPostService.search({
      keyword,
      scope: scope === "all" ? null : scope,
      active: activeParam(status),
      from,
      to,
      page,
      size: PAGE_SIZE,
    }),
  );

  const refresh = () => {
    list.reload();
    void loadStats();
  };

  const items = list.data?.content ?? [];
  const total = list.data?.totalElements ?? 0;
  const pages = list.data?.totalPages ?? 1;
  const rangeFrom = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeTo = Math.min(total, (page + 1) * PAGE_SIZE);
  const badRange = from !== "" && to !== "" && from > to;
  const hasFilter = input.trim() !== "" || scope !== "all" || status !== "all" || from !== "" || to !== "";

  const goPage = (next: number) => setPage(next);

  const changeScope = (v: PostScopeFilter) => {
    setScope(v);
    setPage(0);
  };

  const changeStatus = (v: StatusFilter) => {
    setStatus(v);
    setPage(0);
  };

  const changeDate = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(0);
  };

  const resetFilters = () => {
    setInput("");
    setKeyword("");
    setScope("all");
    setStatus("all");
    setFrom("");
    setTo("");
    setPage(0);
  };

  const toggleActive = async (p: AdminPost) => {
    setBusyId(p.id);
    try {
      await adminPostService.setActive(p.id, !p.active);
      toast.show(p.active ? "Đã ẩn bài viết" : "Đã hiển thị bài viết");
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  // Ẩn bài là việc người dùng sẽ thấy ngay nên hỏi xác nhận; hiện lại thì làm luôn
  const requestToggle = (p: AdminPost) => (p.active ? setHiding(p) : void toggleActive(p));

  const confirmHide = async () => {
    if (!hiding) return;
    await toggleActive(hiding);
    setHiding(null);
  };

  return (
    <>
      <AdminPageHeader
        breadcrumb={[{ label: "Tổng quan", to: "/admin/dashboard" }, { label: "Cộng đồng" }, { label: "Quản lý bài đăng" }]}
        title="Quản lý bài đăng"
        desc="Theo dõi, tìm kiếm, kiểm duyệt và đăng bài viết trên cộng đồng."
        action={
          <Link
            to="/admin/posts/new"
            className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 active:scale-95"
          >
            <Plus size={18} /> Tạo bài viết
          </Link>
        }
      />

      <div className="-mt-16 space-y-5 px-4 pb-10 md:px-8">
        <PostScopeTabs value={scope} stats={stats} onChange={changeScope} />

        <section className="rounded-2xl border border-line bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 p-4">
            <form onSubmit={search} role="search" className="flex min-w-60 flex-1 gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={input}
                  onChange={(e) => changeInput(e.target.value)}
                  placeholder="Tìm theo nội dung, tên người đăng..."
                  aria-label="Tìm bài viết"
                  className={`${field} w-full pl-11 pr-4`}
                />
              </div>
              <button
                type="submit"
                className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95"
              >
                <Search size={15} /> Tìm kiếm
              </button>
            </form>
            <FilterSelect<StatusFilter>
              label="Trạng thái"
              value={status}
              onChange={changeStatus}
              options={[
                { value: "all", label: "Tất cả", desc: `${stats.all} bài viết`, icon: LayoutList },
                { value: "active", label: "Đang hiển thị", desc: `${stats.all - stats.hidden} bài viết`, icon: Eye },
                { value: "hidden", label: "Đang ẩn", desc: `${stats.hidden} bài viết`, icon: EyeOff },
              ]}
            />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => changeDate(setFrom)(e.target.value)}
                aria-label="Từ ngày"
                className={`${field} px-3`}
              />
              <span className="text-sm text-body">→</span>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => changeDate(setTo)(e.target.value)}
                aria-label="Đến ngày"
                className={`${field} px-3`}
              />
            </div>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasFilter}
              className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-heading transition hover:bg-primary-50 disabled:opacity-50"
            >
              <RotateCcw size={15} /> Đặt lại
            </button>
          </div>
          {badRange && <p role="alert" className="px-4 pb-3 text-xs text-danger">Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.</p>}

          <div className="border-t border-line">
            {list.waiting ? (
              <TableSkeleton rows={PAGE_SIZE} label="Đang tải bài viết" />
            ) : list.status === "error" ? (
              <div role="alert" className="px-6 py-14 text-center">
                <p className="font-semibold text-heading">{badRange ? "Khoảng ngày không hợp lệ" : "Không tải được danh sách bài viết"}</p>
                <button onClick={list.retry} className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">Thử lại</button>
              </div>
            ) : items.length === 0 ? (
              <p className="px-6 py-14 text-center text-sm text-body">
                {hasFilter ? "Không có bài viết phù hợp với bộ lọc." : "Chưa có bài viết nào."}
              </p>
            ) : (
              <PostsTable items={items} busyId={busyId} onToggleActive={requestToggle} onHide={setHiding} onView={setViewing} />
            )}
          </div>

          {list.status === "ready" && total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs text-body">
              <p>Hiển thị {rangeFrom}–{rangeTo} trong {total} bài viết</p>
              {pages > 1 && <Pagination page={page} totalPages={pages} onChange={goPage} />}
            </div>
          )}
        </section>
      </div>

      {viewing && <PostDetailModal post={viewing} onClose={() => setViewing(null)} />}

      {hiding && (
        <ConfirmDialog
          title="Ẩn bài viết?"
          message="Bạn có chắc chắn muốn ẩn bài viết này không? Người dùng (kể cả người đăng) sẽ không thấy bài trên bảng tin nữa. Bạn có thể hiển thị lại bất cứ lúc nào."
          confirmLabel="Ẩn bài"
          busy={busyId === hiding.id}
          onConfirm={confirmHide}
          onClose={() => setHiding(null)}
        />
      )}
    </>
  );
}
