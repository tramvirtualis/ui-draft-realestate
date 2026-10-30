import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import Pagination from "../../components/common/Pagination";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../components/Admin/ConfirmDialog";
import EventStatusTabs, {
  type EventStatusFilter,
} from "../../components/Admin/events/EventStatusTabs";
import EventTable from "../../components/Admin/events/EventTable";
import EventPeopleModal from "../../components/Admin/events/EventPeopleModal";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminEventService } from "../../services/event/adminEventService";
import {
  EVENT_STATUS_META,
  type Event,
  type EventStatus,
} from "../../types/event/event.types";

const PAGE_SIZE = 10;
const STATUSES = Object.keys(EVENT_STATUS_META) as EventStatus[];

type Load =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: Event[]; total: number; pages: number };

const select =
  "h-11 appearance-none rounded-xl border border-line bg-white pl-4 pr-10 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

// Quản lý sự kiện: lọc, tìm kiếm và phân trang ở server theo GET /api/admin/events
export default function AdminEventsPage() {
  const toast = useToast();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<EventStatusFilter>("");
  const [page, setPage] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [deleting, setDeleting] = useState<Event | null>(null);
  const [people, setPeople] = useState<Event | null>(null);
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
    Promise.all(
      (["", ...STATUSES] as EventStatusFilter[]).map((s) =>
        adminEventService.count(s)
      )
    )
      .then((n) =>
        setCounts(
          Object.fromEntries(
            n.map((v, i) => [i === 0 ? "all" : STATUSES[i - 1], v])
          )
        )
      )
      .catch(() => undefined);
  }, [reload]);

  useEffect(() => {
    let cancelled = false;
    adminEventService
      .search({ keyword, status, page, size: PAGE_SIZE })
      .then(
        (p) =>
          !cancelled &&
          setLoad({
            status: "ready",
            items: p.content,
            total: p.totalElements,
            pages: p.totalPages,
          })
      )
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [keyword, status, page, reload]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);

  const items = load.status === "ready" ? load.items : [];
  const total = load.status === "ready" ? load.total : 0;
  const pages = load.status === "ready" ? load.pages : 1;
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min(total, (page + 1) * PAGE_SIZE);
  const hasFilter = input.trim() !== "" || status !== "";

  const goto = (p: number) => {
    setLoad({ status: "loading" });
    setPage(p);
  };

  const changeStatusFilter = (v: EventStatusFilter) => {
    setLoad({ status: "loading" });
    setStatus(v);
    setPage(0);
  };

  const resetFilters = () => {
    setLoad({ status: "loading" });
    setInput("");
    setKeyword("");
    setStatus("");
    setPage(0);
  };

  const changeStatus = async (e: Event, next: EventStatus) => {
    if (next === e.status) return;
    setBusyId(e.id);
    try {
      await adminEventService.setStatus(e.id, next);
      toast.show(
        `Đã chuyển "${e.title}" sang ${EVENT_STATUS_META[
          next
        ].label.toLowerCase()}`
      );
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
      await adminEventService.remove(deleting.id);
      toast.show(`Đã xóa sự kiện "${deleting.title}"`);
      setDeleting(null);
      // xóa phần tử cuối của trang cuối thì lùi về trang trước
      if (items.length === 1 && page > 0) setPage(page - 1);
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
          { label: "Quản lý sự kiện" },
        ]}
        title="Quản lý sự kiện"
        desc="Tạo, chỉnh sửa và theo dõi người tham gia, bình luận của các sự kiện."
        action={
          <Link
            to="/admin/events/new"
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
          >
            <Plus size={16} /> Thêm sự kiện
          </Link>
        }
      />

      <div className="-mt-16 space-y-5 px-4 pb-10 md:px-8">
        <EventStatusTabs
          value={status}
          counts={counts}
          onChange={changeStatusFilter}
        />

        <section className="rounded-2xl border border-line bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-60 flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tìm theo tên sự kiện, địa điểm..."
                aria-label="Tìm sự kiện"
                className="h-11 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-sm outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
              />
            </div>
            <label className="relative block">
              <select
                value={status}
                onChange={(e) =>
                  changeStatusFilter(e.target.value as EventStatusFilter)
                }
                aria-label="Trạng thái"
                className={select}
              >
                <option value="">Trạng thái: Tất cả</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    Trạng thái: {EVENT_STATUS_META[s].label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
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
              <div
                className="animate-pulse space-y-3 p-4"
                aria-busy="true"
                aria-label="Đang tải sự kiện"
              >
                {[0, 1, 2, 3].map((n) => (
                  <div key={n} className="h-16 rounded-xl bg-primary-50" />
                ))}
              </div>
            ) : load.status === "error" ? (
              <div role="alert" className="px-6 py-14 text-center">
                <p className="font-semibold text-heading">
                  Không tải được danh sách sự kiện
                </p>
                <button
                  onClick={() => {
                    setLoad({ status: "loading" });
                    refresh();
                  }}
                  className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95"
                >
                  Thử lại
                </button>
              </div>
            ) : items.length === 0 ? (
              <p className="px-6 py-14 text-center text-sm text-body">
                {hasFilter
                  ? "Không có sự kiện phù hợp với bộ lọc."
                  : "Chưa có sự kiện nào."}
              </p>
            ) : (
              <EventTable
                items={items}
                busyId={busyId}
                onChangeStatus={changeStatus}
                onOpenPeople={setPeople}
                onDelete={setDeleting}
              />
            )}
          </div>

          {load.status === "ready" && total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs text-body">
              <p>
                Hiển thị {from}–{to} trong {total} sự kiện
              </p>
              {pages > 1 && (
                <Pagination page={page} totalPages={pages} onChange={goto} />
              )}
            </div>
          )}
        </section>
      </div>

      {people && (
        <EventPeopleModal event={people} onClose={() => setPeople(null)} />
      )}

      {deleting && (
        <ConfirmDialog
          title="Xóa sự kiện?"
          message={`Bạn có chắc chắn muốn xóa "${deleting.title}" không? Ảnh, người tham gia và bình luận của sự kiện cũng bị xóa. Hành động này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
