import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import AdminModal from "../../components/Admin/AdminModal";
import ConfirmDialog from "../../components/Admin/ConfirmDialog";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminNotificationTypeService } from "../../services/notification/adminNotificationTypeService";
import type { NotificationTypeItem } from "../../types/notification.types";

const btn =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white transition hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-600 active:scale-95 disabled:opacity-50";

// id = 0 là thêm mới
type Editing = Pick<NotificationTypeItem, "id" | "name" | "isActive">;
const EMPTY: Editing = { id: 0, name: "", isActive: true };

type Load = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; items: NotificationTypeItem[] };

export default function AdminNotificationTypesPage() {
  const toast = useToast();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [deleting, setDeleting] = useState<NotificationTypeItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminNotificationTypeService
      .list()
      .then((items) => !cancelled && setLoad({ status: "ready", items }))
      .catch((err) => !cancelled && setLoad({ status: "error", message: getErrorMessage(err) }));
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const refresh = useCallback(() => {
    setLoad({ status: "loading" });
    setReload((n) => n + 1);
  }, []);

  // Cập nhật 1 dòng tại chỗ, không cần tải lại cả bảng
  const replace = (t: NotificationTypeItem) =>
    setLoad((s) => (s.status === "ready" ? { ...s, items: s.items.map((x) => (x.id === t.id ? t : x)) } : s));

  const toggle = async (t: NotificationTypeItem) => {
    if (toggling !== null) return;
    setToggling(t.id);
    try {
      const updated = await adminNotificationTypeService.toggle(t.id);
      replace(updated);
      toast.show(updated.isActive ? `Đã hiện loại "${updated.name}"` : `Đã ẩn loại "${updated.name}"`);
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setToggling(null);
    }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing || saving) return;
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    if (!name) {
      toast.show("Vui lòng nhập tên loại", "error");
      return;
    }
    const input = { name, isActive: f.get("isActive") === "on" };

    setSaving(true);
    try {
      if (editing.id) {
        replace(await adminNotificationTypeService.edit(editing.id, input));
        toast.show("Đã lưu loại thông báo");
      } else {
        await adminNotificationTypeService.add(input);
        toast.show("Đã thêm loại thông báo");
        refresh();
      }
      setEditing(null);
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting || removing) return;
    setRemoving(true);
    try {
      await adminNotificationTypeService.remove(deleting.id);
      toast.show("Đã xóa loại thông báo");
      setDeleting(null);
      refresh();
    } catch (err) {
      // Loại còn thông báo dùng thì BE từ chối: hiện message của BE, gợi ý ẩn thay vì xóa
      toast.show(getErrorMessage(err), "error");
      setDeleting(null);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        breadcrumb={[{ label: "Tổng quan", to: "/admin/dashboard" }, { label: "Thông báo" }, { label: "Loại thông báo" }]}
        title="Loại thông báo"
        desc="Quản lý các loại thông báo dùng để phân nhóm và lọc."
        action={
          <button onClick={() => setEditing(EMPTY)} className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95">
            <Plus size={16} /> Thêm loại
          </button>
        }
      />

      <div className="-mt-16 px-4 pb-10 md:px-8">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-heading">Danh sách loại</h2>
            {load.status === "ready" && (
              <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">{load.items.length} loại</span>
            )}
          </div>

          <div className="mt-5">
            {load.status === "loading" ? (
              <div className="animate-pulse space-y-3" aria-busy="true" aria-label="Đang tải loại thông báo">
                {[0, 1, 2].map((n) => <div key={n} className="h-12 rounded-xl bg-primary-50" />)}
              </div>
            ) : load.status === "error" ? (
              <div role="alert" className="rounded-2xl border border-dashed border-danger/30 bg-danger/5 px-6 py-12 text-center">
                <p className="font-semibold text-heading">Không tải được danh sách loại thông báo</p>
                <p className="mt-1 text-sm text-body">{load.message}</p>
                <button onClick={refresh} className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">Thử lại</button>
              </div>
            ) : load.items.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-14 text-center text-body">Chưa có loại thông báo nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-muted">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Tên loại</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Ngày tạo</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {load.items.map((t, i) => (
                      <tr key={t.id} className="border-t border-line transition hover:bg-primary-50">
                        <td className="px-4 py-3 text-body">{String(i + 1).padStart(2, "0")}</td>
                        <td className="px-4 py-3 font-semibold text-footer">{t.name}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${t.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {t.isActive ? "Đang hiện" : "Đang ẩn"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-body">{new Date(t.createdAt).toLocaleDateString("vi-VN")}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => toggle(t)}
                              disabled={toggling === t.id}
                              aria-label={t.isActive ? `Ẩn ${t.name}` : `Hiện ${t.name}`}
                              title={t.isActive ? "Ẩn" : "Hiện"}
                              className={`${btn} text-primary-600`}
                            >
                              {t.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                            <button onClick={() => setEditing(t)} aria-label={`Sửa ${t.name}`} title="Sửa" className={`${btn} text-accent`}><Pencil size={15} /></button>
                            <button onClick={() => setDeleting(t)} aria-label={`Xóa ${t.name}`} title="Xóa" className={`${btn} text-danger`}><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {editing && (
        <AdminModal title={editing.id ? "Sửa loại thông báo" : "Thêm loại thông báo"} onClose={() => !saving && setEditing(null)}>
          <form onSubmit={submit}>
            <div className="space-y-4 p-6">
              <label className="block text-sm font-semibold text-heading">
                Tên loại
                <input name="name" required maxLength={100} defaultValue={editing.name} className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-primary-600" />
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-heading">
                <input name="isActive" type="checkbox" defaultChecked={editing.isActive} className="h-4 w-4 accent-primary-600" />
                Hiển thị cho người dùng
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
              <button type="button" disabled={saving} onClick={() => setEditing(null)} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50 disabled:opacity-60">Hủy</button>
              <button disabled={saving} className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60">
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Xóa loại thông báo?"
          message={`Bạn có chắc chắn muốn xóa loại "${deleting.name}" không? Loại đang có thông báo sử dụng sẽ không xóa được, khi đó hãy ẩn loại này.`}
          busy={removing}
          onConfirm={confirmDelete}
          onClose={() => !removing && setDeleting(null)}
        />
      )}
    </>
  );
}
