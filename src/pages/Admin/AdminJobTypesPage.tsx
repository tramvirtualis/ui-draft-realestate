import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import AdminModal from "../../components/Admin/AdminModal";
import ConfirmDialog from "../../components/Admin/ConfirmDialog";
import Pagination from "../../components/common/Pagination";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminJobTypeService } from "../../services/job/adminJobTypeService";
import { formatDate } from "../../utils/formatDate";
import type { JobType, JobTypeRequest } from "../../types/job/job.types";

const PAGE_SIZE = 10;
const MAX_NAME = 100;
const MAX_DESC = 500;
const field =
  "mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm font-normal outline-none focus:border-primary-600";
const btn =
  "flex h-8 w-8 items-center justify-center rounded-lg transition focus-visible:outline-2 focus-visible:outline-primary-600 active:scale-95";
const TH =
  "px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted";

type Load =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: JobType[]; total: number; pages: number };

function JobTypeModal({
  item,
  onClose,
  onSaved,
}: {
  item: JobType | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState<JobTypeRequest>({
    name: item?.name ?? "",
    description: item?.description ?? "",
    active: item?.active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.show("Vui lòng nhập tên loại công việc", "error");
      return;
    }
    setSaving(true);
    try {
      const request = {
        ...form,
        name: form.name.trim(),
        description: form.description?.trim(),
      };
      if (item) await adminJobTypeService.edit(item.id, request);
      else await adminJobTypeService.add(request);
      toast.show(
        item ? "Đã cập nhật loại công việc" : "Đã thêm loại công việc"
      );
      onSaved();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminModal
      title={item ? "Sửa loại công việc" : "Thêm loại công việc"}
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate className="space-y-4 p-6">
        <label className="block text-sm font-semibold text-heading">
          Tên loại <span className="text-danger">*</span>
          <input
            autoFocus
            value={form.name}
            maxLength={MAX_NAME}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Vd: Kinh doanh / Môi giới"
            className={field}
          />
        </label>
        <label className="block text-sm font-semibold text-heading">
          <span className="flex justify-between">
            Mô tả
            <span className="text-xs font-normal text-muted">
              {form.description?.length ?? 0}/{MAX_DESC}
            </span>
          </span>
          <textarea
            value={form.description}
            maxLength={MAX_DESC}
            rows={3}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={field}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-heading">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="h-4 w-4 accent-primary-600"
          />
          Hiển thị cho ứng viên (bộ lọc ở trang tuyển dụng)
        </label>
        <div className="flex justify-end gap-3 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50"
          >
            Hủy
          </button>
          <button
            disabled={saving}
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}

// Quản lý loại công việc: GET/POST/PUT/DELETE /api/admin/job-types
export default function AdminJobTypesPage() {
  const toast = useToast();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [page, setPage] = useState(0);
  // undefined = đóng, null = thêm mới
  const [editing, setEditing] = useState<JobType | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<JobType | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminJobTypeService
      .list(page, PAGE_SIZE)
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
  }, [page, reload]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);
  const items = load.status === "ready" ? load.items : [];

  // Bật / tắt hiển thị ngay trên bảng (PUT cả bản ghi vì BE không có API riêng)
  const toggleActive = async (t: JobType) => {
    setBusyId(t.id);
    try {
      await adminJobTypeService.edit(t.id, {
        name: t.name,
        description: t.description ?? "",
        active: t.active === false,
      });
      toast.show(
        t.active === false ? `Đã hiển thị "${t.name}"` : `Đã ẩn "${t.name}"`
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
      await adminJobTypeService.remove(deleting.id);
      toast.show(`Đã xóa "${deleting.name}"`);
      setDeleting(null);
      if (items.length === 1 && page > 0) setPage(page - 1);
      refresh();
    } catch (err) {
      // đang có tin dùng loại này → BE chỉ cho ẩn
      toast.show(getErrorMessage(err), "error");
      setDeleting(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        breadcrumb={[
          { label: "Tổng quan", to: "/admin/dashboard" },
          { label: "Loại công việc" },
        ]}
        title="Loại công việc"
        desc="Nhóm ngành nghề dùng để phân loại tin tuyển dụng và làm bộ lọc cho ứng viên."
        action={
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
          >
            <Plus size={16} /> Thêm loại
          </button>
        }
      />

      <div className="-mt-16 px-4 pb-10 md:px-8">
        <section className="rounded-2xl border border-line bg-white shadow-sm">
          {load.status === "loading" ? (
            <div
              className="animate-pulse space-y-3 p-4"
              aria-busy="true"
              aria-label="Đang tải loại công việc"
            >
              {[0, 1, 2].map((n) => (
                <div key={n} className="h-12 rounded-xl bg-primary-50" />
              ))}
            </div>
          ) : load.status === "error" ? (
            <div role="alert" className="px-6 py-14 text-center">
              <p className="font-semibold text-heading">
                Không tải được danh sách loại công việc
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
              Chưa có loại công việc nào.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-primary-50/60">
                  <tr>
                    <th className={TH}>Tên loại</th>
                    <th className={TH}>Mô tả</th>
                    <th className={TH}>Hiển thị</th>
                    <th className={TH}>Cập nhật</th>
                    <th className={TH} />
                  </tr>
                </thead>
                <tbody>
                  {items.map((t) => {
                    const active = t.active !== false;
                    return (
                      <tr
                        key={t.id}
                        className="border-t border-line transition hover:bg-primary-50/40"
                      >
                        <td className="px-4 py-3 font-semibold text-footer">
                          {t.name}
                        </td>
                        <td className="max-w-[420px] px-4 py-3 text-body">
                          <p className="line-clamp-2">{t.description || "—"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleActive(t)}
                            disabled={busyId === t.id}
                            title={active ? "Bấm để ẩn" : "Bấm để hiển thị"}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-80 disabled:opacity-50 ${
                              active
                                ? "bg-success/10 text-success"
                                : "bg-line text-body"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                active ? "bg-success" : "bg-muted"
                              }`}
                            />
                            {active ? "Đang hiển thị" : "Đang ẩn"}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-body">
                          {t.updatedAt ? formatDate(t.updatedAt) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditing(t)}
                              aria-label={`Sửa ${t.name}`}
                              title="Sửa"
                              className={`${btn} text-body hover:bg-primary-50`}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(t)}
                              aria-label={`Xóa ${t.name}`}
                              title="Xóa"
                              className={`${btn} bg-danger/10 text-danger hover:bg-danger/20`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {load.status === "ready" && load.pages > 1 && (
            <div className="flex justify-end border-t border-line px-5 py-4">
              <Pagination
                page={page}
                totalPages={load.pages}
                onChange={(p) => {
                  setLoad({ status: "loading" });
                  setPage(p);
                }}
              />
            </div>
          )}
        </section>
      </div>

      {editing !== undefined && (
        <JobTypeModal
          item={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            refresh();
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Xóa loại công việc?"
          message={`Xóa "${deleting.name}"? Nếu đang có tin tuyển dụng thuộc loại này thì không xóa được, khi đó hãy ẩn loại này đi.`}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
