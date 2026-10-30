import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Copy,
  Eye,
  EyeOff,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../components/Admin/ConfirmDialog";
import Pagination from "../../components/common/Pagination";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminCvTemplateService } from "../../services/job/adminCvTemplateService";
import type { CvTemplateSummary } from "../../types/job/cvTemplate.types";

const PAGE_SIZE = 12;
const btn =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white transition hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-600 active:scale-95 disabled:opacity-50";

type StatusFilter = "all" | "active" | "hidden";
const STATUS_PARAM: Record<StatusFilter, boolean | null> = {
  all: null,
  active: true,
  hidden: false,
};

type Load =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      items: CvTemplateSummary[];
      total: number;
      pages: number;
    };

export default function AdminCvTemplatesPage() {
  const toast = useToast();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<CvTemplateSummary | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminCvTemplateService
      .search(keyword, STATUS_PARAM[statusFilter], page, PAGE_SIZE)
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
      .catch(
        (err) =>
          !cancelled &&
          setLoad({ status: "error", message: getErrorMessage(err) })
      );
    return () => {
      cancelled = true;
    };
  }, [keyword, statusFilter, page, reload]);

  const refresh = useCallback(() => {
    setLoad({ status: "loading" });
    setReload((n) => n + 1);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setKeyword(input.trim());
  };

  const changeStatus = (value: StatusFilter) => {
    setPage(0);
    setStatusFilter(value);
  };

  // Cập nhật 1 thẻ tại chỗ, không cần tải lại cả trang
  const replace = (t: CvTemplateSummary) =>
    setLoad((s) =>
      s.status === "ready"
        ? {
            ...s,
            items: s.items.map((x) => (x.id === t.id ? { ...x, ...t } : x)),
          }
        : s
    );

  const toggle = async (t: CvTemplateSummary) => {
    if (busyId !== null) return;
    setBusyId(t.id);
    try {
      const updated = await adminCvTemplateService.setActive(t.id, !t.active);
      replace(updated);
      toast.show(
        updated.active
          ? `Đã hiện mẫu "${updated.name}"`
          : `Đã ẩn mẫu "${updated.name}"`
      );
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  const duplicate = async (t: CvTemplateSummary) => {
    if (busyId !== null) return;
    setBusyId(t.id);
    try {
      const copy = await adminCvTemplateService.duplicate(t.id);
      toast.show(`Đã tạo bản sao "${copy.name}" (đang ẩn)`);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting || removing) return;
    setRemoving(true);
    try {
      await adminCvTemplateService.remove(deleting.id);
      toast.show(`Đã xóa mẫu "${deleting.name}"`);
      setDeleting(null);
      // Xóa phần tử cuối của trang cuối thì lùi về trang trước
      if (load.status === "ready" && load.items.length === 1 && page > 0)
        setPage(page - 1);
      else refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        breadcrumb={[
          { label: "Tổng quan", to: "/admin/dashboard" },
          { label: "Tuyển dụng" },
          { label: "Quản lý template CV" },
        ]}
        title="Quản lý template CV"
        desc="Soạn mẫu CV bằng HTML/CSS (Handlebars). Chỉ mẫu đang hiện mới xuất hiện trong trang Tạo CV của ứng viên."
        action={
          <Link
            to="/admin/cv-templates/new"
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
          >
            <Plus size={16} /> Thêm mẫu CV
          </Link>
        }
      />

      <div className="-mt-16 px-4 pb-10 md:px-8">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-heading">Danh sách mẫu</h2>
              {load.status === "ready" && (
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                  {load.total} mẫu
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div
                className="flex rounded-xl border border-line p-1"
                role="tablist"
                aria-label="Lọc theo trạng thái"
              >
                {(
                  [
                    ["all", "Tất cả"],
                    ["active", "Đang hiện"],
                    ["hidden", "Đang ẩn"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    role="tab"
                    aria-selected={statusFilter === value}
                    onClick={() => changeStatus(value)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      statusFilter === value
                        ? "bg-primary-600 text-white"
                        : "text-body hover:bg-primary-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <form onSubmit={submitSearch} className="flex items-center gap-2">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tìm theo tên, slug..."
                    aria-label="Tìm mẫu CV"
                    className="w-56 rounded-xl border border-line py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary-600"
                  />
                </div>
                <button className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95">
                  Tìm
                </button>
              </form>
            </div>
          </div>

          <div className="mt-5">
            {load.status === "loading" ? (
              <div
                className="grid animate-pulse gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                aria-busy="true"
                aria-label="Đang tải mẫu CV"
              >
                {[0, 1, 2, 3].map((n) => (
                  <div key={n} className="h-72 rounded-2xl bg-primary-50" />
                ))}
              </div>
            ) : load.status === "error" ? (
              <div
                role="alert"
                className="rounded-2xl border border-dashed border-danger/30 bg-danger/5 px-6 py-12 text-center"
              >
                <p className="font-semibold text-heading">
                  Không tải được danh sách mẫu CV
                </p>
                <p className="mt-1 text-sm text-body">{load.message}</p>
                <button
                  onClick={refresh}
                  className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95"
                >
                  Thử lại
                </button>
              </div>
            ) : load.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-14 text-center">
                <p className="text-body">
                  {keyword || statusFilter !== "all"
                    ? "Không có mẫu nào phù hợp."
                    : "Chưa có mẫu CV nào."}
                </p>
                {!keyword && statusFilter === "all" && (
                  <Link
                    to="/admin/cv-templates/new"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
                  >
                    <Plus size={15} /> Tạo mẫu đầu tiên
                  </Link>
                )}
              </div>
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {load.items.map((t) => (
                  <li
                    key={t.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-md"
                  >
                    <Link
                      to={`/admin/cv-templates/${t.id}/edit`}
                      className="relative block aspect-[210/170] overflow-hidden bg-primary-50"
                      aria-label={`Sửa ${t.name}`}
                    >
                      {t.thumbnailUrl ? (
                        <img
                          src={t.thumbnailUrl}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover object-top transition group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-primary-300">
                          <FileText size={36} />
                          <span className="text-xs">Chưa có ảnh xem trước</span>
                        </div>
                      )}
                      <span
                        className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          t.active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {t.active ? "Đang hiện" : "Đang ẩn"}
                      </span>
                    </Link>
                    <div className="flex flex-1 flex-col p-4">
                      <p
                        className="truncate font-semibold text-footer"
                        title={t.name}
                      >
                        {t.name}
                      </p>
                      <p
                        className="truncate font-mono text-xs text-muted"
                        title={t.slug}
                      >
                        {t.slug}
                      </p>
                      {t.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-body">
                          {t.description}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <span className="text-xs text-muted">
                          Thứ tự {t.sortOrder} ·{" "}
                          {new Date(t.updatedAt).toLocaleDateString("vi-VN")}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => toggle(t)}
                            disabled={busyId === t.id}
                            aria-label={
                              t.active ? `Ẩn ${t.name}` : `Hiện ${t.name}`
                            }
                            title={t.active ? "Ẩn" : "Hiện"}
                            className={`${btn} text-primary-600`}
                          >
                            {t.active ? (
                              <EyeOff size={15} />
                            ) : (
                              <Eye size={15} />
                            )}
                          </button>
                          <Link
                            to={`/admin/cv-templates/${t.id}/edit`}
                            aria-label={`Sửa ${t.name}`}
                            title="Sửa"
                            className={`${btn} text-accent`}
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            onClick={() => duplicate(t)}
                            disabled={busyId === t.id}
                            aria-label={`Nhân bản ${t.name}`}
                            title="Nhân bản"
                            className={`${btn} text-footer`}
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            onClick={() => setDeleting(t)}
                            aria-label={`Xóa ${t.name}`}
                            title="Xóa"
                            className={`${btn} text-danger`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {load.status === "ready" && load.pages > 1 && (
            <div className="mt-5 flex justify-end border-t border-line pt-4">
              <Pagination
                page={page}
                totalPages={load.pages}
                onChange={setPage}
              />
            </div>
          )}
        </section>
      </div>

      {deleting && (
        <ConfirmDialog
          title="Xóa mẫu CV?"
          message={`Bạn có chắc chắn muốn xóa mẫu "${deleting.name}" không? Ứng viên đang dùng mẫu này sẽ được chuyển sang mẫu mặc định.`}
          busy={removing}
          onConfirm={confirmDelete}
          onClose={() => !removing && setDeleting(null)}
        />
      )}
    </>
  );
}
