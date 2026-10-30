import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Plus, RotateCcw, Search } from "lucide-react";
import Pagination from "../../components/common/Pagination";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../components/Admin/ConfirmDialog";
import NewsStatusTabs, { type NewsStatusFilter } from "../../components/Admin/news/NewsStatusTabs";
import NewsTable from "../../components/Admin/news/NewsTable";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminNewsService, type AdminNewsCategory } from "../../services/news/adminNewsService";
import type { News } from "../../types/new/news.types";

const PAGE_SIZE = 10;
const EMPTY_COUNTS = { all: 0, active: 0, hidden: 0 };

type Load =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: News[]; total: number; pages: number };

const select =
  "h-11 appearance-none rounded-xl border border-line bg-white pl-4 pr-10 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

const activeParam = (s: NewsStatusFilter) => (s === "all" ? null : s === "active");

// Quản lý tin tức: lọc, tìm kiếm và phân trang ở server theo GET /api/admin/news
export default function AdminNewsPage() {
  const toast = useToast();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<NewsStatusFilter>("all");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(0);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [categories, setCategories] = useState<AdminNewsCategory[]>([]);
  const [deleting, setDeleting] = useState<News | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Chờ người dùng ngừng gõ rồi mới gọi API tìm kiếm
  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(input);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    adminNewsService.getCategories().then(setCategories).catch(() => undefined);
  }, []);

  useEffect(() => {
    adminNewsService.counts().then(setCounts).catch(() => undefined);
  }, [reload]);

  useEffect(() => {
    let cancelled = false;
    adminNewsService
      .search({
        keyword,
        categoryId: categoryId ? Number(categoryId) : null,
        active: activeParam(status),
        page,
        size: PAGE_SIZE,
      })
      .then((p) => !cancelled && setLoad({ status: "ready", items: p.content, total: p.totalElements, pages: p.totalPages }))
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [keyword, status, categoryId, page, reload]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);

  const items = load.status === "ready" ? load.items : [];
  const total = load.status === "ready" ? load.total : 0;
  const pages = load.status === "ready" ? load.pages : 1;
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min(total, (page + 1) * PAGE_SIZE);
  const hasFilter = input.trim() !== "" || status !== "all" || categoryId !== "";

  const changeStatus = (v: NewsStatusFilter) => {
    setLoad({ status: "loading" });
    setStatus(v);
    setPage(0);
  };

  const resetFilters = () => {
    setLoad({ status: "loading" });
    setInput("");
    setKeyword("");
    setStatus("all");
    setCategoryId("");
    setPage(0);
  };

  const toggleActive = async (n: News) => {
    setBusyId(n.id);
    try {
      await adminNewsService.setActive(n.id, !n.active);
      toast.show(n.active ? "Đã ẩn tin tức" : "Đã hiển thị tin tức");
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await adminNewsService.remove(deleting.id);
      toast.show(`Đã xóa tin "${deleting.title}"`);
      setDeleting(null);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    }
  };

  return (
    <>
      <AdminPageHeader
        breadcrumb={[
          { label: "Tổng quan", to: "/admin/dashboard" },
          { label: "Quản lý tin tức" },
        ]}
        title="Quản lý tin tức"
        desc="Quản lý, biên tập và xuất bản nội dung tin tức trên toàn bộ chuyên trang."
        action={
          <Link
            to="/admin/news/new"
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
          >
            <Plus size={16} /> Thêm tin tức
          </Link>
        }
      />

      <div className="-mt-16 space-y-5 px-4 pb-10 md:px-8">
        <NewsStatusTabs value={status} counts={counts} onChange={changeStatus} />

        <section className="rounded-2xl border border-line bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-60 flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tìm theo tiêu đề, nội dung..."
                aria-label="Tìm tin tức"
                className="h-11 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-sm outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
              />
            </div>
            <label className="relative block">
              <select value={status} onChange={(e) => changeStatus(e.target.value as NewsStatusFilter)} aria-label="Trạng thái" className={select}>
                <option value="all">Trạng thái: Tất cả</option>
                <option value="active">Trạng thái: Đang hiển thị</option>
                <option value="hidden">Trạng thái: Đang ẩn</option>
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
            </label>
            <label className="relative block">
              <select
                value={categoryId}
                onChange={(e) => {
                  setLoad({ status: "loading" });
                  setCategoryId(e.target.value);
                  setPage(0);
                }}
                aria-label="Chuyên mục"
                className={select}
              >
                <option value="">Chuyên mục: Tất cả</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>Chuyên mục: {c.name}</option>
                ))}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
            </label>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasFilter}
              className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-heading transition hover:bg-primary-50 disabled:opacity-50"
            >
              <RotateCcw size={15} /> Đặt lại
            </button>
          </div>

          <div className="border-t border-line">
            {load.status === "loading" ? (
              <div className="animate-pulse space-y-3 p-4" aria-busy="true" aria-label="Đang tải tin tức">
                {[0, 1, 2, 3].map((n) => <div key={n} className="h-16 rounded-xl bg-primary-50" />)}
              </div>
            ) : load.status === "error" ? (
              <div role="alert" className="px-6 py-14 text-center">
                <p className="font-semibold text-heading">Không tải được danh sách tin tức</p>
                <button onClick={() => { setLoad({ status: "loading" }); refresh(); }} className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">Thử lại</button>
              </div>
            ) : items.length === 0 ? (
              <p className="px-6 py-14 text-center text-sm text-body">
                {hasFilter ? "Không có tin tức phù hợp với bộ lọc." : "Chưa có tin tức nào."}
              </p>
            ) : (
              <NewsTable items={items} busyId={busyId} onToggleActive={toggleActive} onDelete={setDeleting} />
            )}
          </div>

          {load.status === "ready" && total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs text-body">
              <p>Hiển thị {from}–{to} trong {total} bài viết</p>
              {pages > 1 && (
                <Pagination
                  page={page}
                  totalPages={pages}
                  onChange={(p) => {
                    setLoad({ status: "loading" });
                    setPage(p);
                  }}
                />
              )}
            </div>
          )}
        </section>
      </div>

      {deleting && (
        <ConfirmDialog
          title="Xóa tin tức?"
          message={`Bạn có chắc chắn muốn xóa "${deleting.title}" không? Hành động này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
