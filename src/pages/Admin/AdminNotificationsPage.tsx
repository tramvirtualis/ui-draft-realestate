import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  FileText,
  Mail,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import AdminModal from "../../components/Admin/AdminModal";
import ConfirmDialog from "../../components/Admin/ConfirmDialog";
import RecipientPicker, {
  type Recipient,
} from "../../components/Admin/notifications/RecipientPicker";
import Pagination from "../../components/common/Pagination";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import { adminNotificationService } from "../../services/notification/adminNotificationService";
import { adminNotificationTypeService } from "../../services/notification/adminNotificationTypeService";
import type {
  AdminNotification,
  NotificationInput,
  NotificationTypeItem,
} from "../../types/notification.types";

const PAGE_SIZE = 10;
const field =
  "mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-primary-600";
const btn =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white transition hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-600 active:scale-95";

// id = 0 là tạo mới
type Editing = Pick<
  AdminNotification,
  "id" | "title" | "content" | "notificationTypeId" | "actionUrl"
>;
const EMPTY: Editing = {
  id: 0,
  title: "",
  content: "",
  notificationTypeId: 0,
  actionUrl: "",
};

type Load =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      items: AdminNotification[];
      total: number;
      pages: number;
    };

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("vi-VN");

export default function AdminNotificationsPage() {
  const toast = useToast();
  const [types, setTypes] = useState<NotificationTypeItem[]>([]);
  const [typeId, setTypeId] = useState(0);
  const [page, setPage] = useState(0);
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [viewing, setViewing] = useState<AdminNotification | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [deleting, setDeleting] = useState<AdminNotification | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  // Người nhận khi tạo mới: tất cả hoặc chọn từng người
  const [audience, setAudience] = useState<"all" | "some">("all");
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  const openCreate = () => {
    setAudience("all");
    setRecipients([]);
    setEditing(EMPTY);
  };

  // Loại thông báo cho dropdown lọc và form (gồm cả loại đang ẩn)
  useEffect(() => {
    adminNotificationTypeService
      .list()
      .then(setTypes)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminNotificationService
      .search(typeId, page, PAGE_SIZE)
      .then((p) => {
        if (cancelled) return;
        // Trang hiện tại không còn dữ liệu (vd vừa xóa phần tử cuối) thì lùi về trang cuối
        if (p.content.length === 0 && page > 0) {
          setPage(Math.max(0, p.totalPages - 1));
          return;
        }
        setLoad({
          status: "ready",
          items: p.content,
          total: p.totalElements,
          pages: p.totalPages,
        });
      })
      .catch(
        (err) =>
          !cancelled &&
          setLoad({ status: "error", message: getErrorMessage(err) })
      );
    return () => {
      cancelled = true;
    };
  }, [typeId, page, reload]);

  const refresh = useCallback(() => {
    setLoad({ status: "loading" });
    setReload((n) => n + 1);
  }, []);

  const changeType = (id: number) => {
    setTypeId(id);
    setPage(0);
    setLoad({ status: "loading" });
  };

  const changePage = (p: number) => {
    setPage(p);
    setLoad({ status: "loading" });
  };

  // Xem chi tiết: lấy bản mới nhất từ BE
  const openView = async (id: number) => {
    try {
      setViewing(await adminNotificationService.get(id));
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing || saving) return;
    const f = new FormData(e.currentTarget);
    const title = String(f.get("title") ?? "").trim();
    const content = String(f.get("content") ?? "").trim();
    const notificationTypeId = Number(f.get("notificationTypeId"));
    const url = String(f.get("actionUrl") ?? "").trim();
    if (!title || !content || !notificationTypeId) {
      toast.show(
        "Vui lòng nhập tiêu đề, nội dung và chọn loại thông báo",
        "error"
      );
      return;
    }
    // userIds rỗng = gửi cho tất cả
    const userIds = audience === "some" ? recipients.map((u) => u.id) : [];
    if (!editing.id && audience === "some" && userIds.length === 0) {
      toast.show("Vui lòng chọn ít nhất một người nhận", "error");
      return;
    }
    const input: NotificationInput = {
      title,
      content,
      notificationTypeId,
      // Tạo: bỏ trống là null. Sửa: gửi "" để xóa link (BE bỏ qua trường null)
      actionUrl: url || (editing.id ? "" : null),
      ...(editing.id
        ? {}
        : { userIds, sendEmail: f.get("sendEmail") === "on" }),
    };

    setSaving(true);
    try {
      if (editing.id) {
        await adminNotificationService.edit(editing.id, input);
        toast.show("Đã lưu thông báo");
        refresh();
      } else {
        await adminNotificationService.add(input);
        toast.show("Đã gửi thông báo");
        // Thông báo mới nằm đầu danh sách
        if (page === 0) refresh();
        else changePage(0);
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
      await adminNotificationService.remove(deleting.id);
      toast.show("Đã xóa thông báo");
      setDeleting(null);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setRemoving(false);
    }
  };

  const [toggling, setToggling] = useState<number | null>(null);

  // Ẩn/hiện: cập nhật đúng dòng đó, không tải lại cả bảng
  const toggle = async (n: AdminNotification) => {
    if (toggling !== null) return;
    setToggling(n.id);
    try {
      const updated = await adminNotificationService.toggle(n.id);
      setLoad((s) =>
        s.status === "ready"
          ? {
              ...s,
              items: s.items.map((x) =>
                x.id === n.id ? { ...x, ...updated } : x
              ),
            }
          : s
      );
      toast.show(updated.isActive ? "Đã hiện thông báo" : "Đã ẩn thông báo");
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setToggling(null);
    }
  };

  const rows = load.status === "ready" ? load.items : [];
  const total = load.status === "ready" ? load.total : 0;
  const start = page * PAGE_SIZE;

  return (
    <>
      <AdminPageHeader
        breadcrumb={[
          { label: "Tổng quan", to: "/admin/dashboard" },
          { label: "Thông báo" },
          { label: "Quản lý thông báo" },
        ]}
        title="Quản lý thông báo"
        desc="Tạo, chỉnh sửa và gửi thông báo đến người dùng."
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
          >
            <Send size={16} /> Tạo & gửi thông báo
          </button>
        }
      />

      <div className="-mt-16 px-4 pb-10 md:px-8">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-heading">
                Danh sách thông báo
              </h2>
              {load.status === "ready" && (
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                  {total} thông báo
                </span>
              )}
            </div>
            <select
              value={typeId}
              onChange={(e) => changeType(Number(e.target.value))}
              aria-label="Lọc theo loại"
              className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-primary-600"
            >
              <option value={0}>Tất cả loại</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            {load.status === "loading" ? (
              <div
                className="animate-pulse space-y-3"
                aria-busy="true"
                aria-label="Đang tải thông báo"
              >
                {[0, 1, 2, 3].map((n) => (
                  <div key={n} className="h-14 rounded-xl bg-primary-50" />
                ))}
              </div>
            ) : load.status === "error" ? (
              <div
                role="alert"
                className="rounded-2xl border border-dashed border-danger/30 bg-danger/5 px-6 py-12 text-center"
              >
                <p className="font-semibold text-heading">
                  Không tải được danh sách thông báo
                </p>
                <p className="mt-1 text-sm text-body">{load.message}</p>
                <button
                  onClick={refresh}
                  className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95"
                >
                  Thử lại
                </button>
              </div>
            ) : rows.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-14 text-center text-body">
                Không có thông báo phù hợp.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-muted">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Tiêu đề</th>
                      <th className="px-4 py-3">Loại</th>
                      <th className="px-4 py-3">Đã đọc</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Ngày tạo</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((n, i) => (
                      <tr
                        key={n.id}
                        className="border-t border-line transition hover:bg-primary-50"
                      >
                        <td className="px-4 py-3 text-body">
                          {String(start + i + 1).padStart(2, "0")}
                        </td>
                        <td className="max-w-[360px] px-4 py-3">
                          <p
                            className="flex items-center gap-1.5 truncate font-semibold text-footer"
                            title={n.title}
                          >
                            {n.sendEmail && (
                              <Mail
                                size={13}
                                className="shrink-0 text-accent"
                                aria-label="Có gửi email"
                              />
                            )}
                            <span className="truncate">{n.title}</span>
                          </p>
                          <p className="truncate text-xs text-body">
                            {n.createdBy === null && (
                              <span className="mr-1.5 rounded bg-gray-100 px-1.5 py-px text-[10px] font-semibold uppercase text-gray-600">
                                Hệ thống
                              </span>
                            )}
                            {n.content}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                            {n.notificationTypeName}
                          </span>
                        </td>
                        <td
                          className="whitespace-nowrap px-4 py-3 text-body"
                          title={`${n.readCount} / ${n.recipientCount} người đã đọc`}
                        >
                          {n.readCount}/{n.recipientCount}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              n.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {n.isActive ? "Đang hiện" : "Đang ẩn"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-body">
                          {formatDate(n.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => openView(n.id)}
                              aria-label={`Chi tiết ${n.title}`}
                              title="Chi tiết"
                              className={`${btn} text-primary-600`}
                            >
                              <FileText size={15} />
                            </button>
                            <button
                              onClick={() => toggle(n)}
                              disabled={toggling === n.id}
                              aria-label={
                                n.isActive ? `Ẩn ${n.title}` : `Hiện ${n.title}`
                              }
                              title={n.isActive ? "Ẩn" : "Hiện"}
                              className={`${btn} text-heading disabled:opacity-50`}
                            >
                              {n.isActive ? (
                                <EyeOff size={15} />
                              ) : (
                                <Eye size={15} />
                              )}
                            </button>
                            <button
                              onClick={() => setEditing(n)}
                              aria-label={`Sửa ${n.title}`}
                              title="Sửa"
                              className={`${btn} text-accent`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleting(n)}
                              aria-label={`Xóa ${n.title}`}
                              title="Xóa"
                              className={`${btn} text-danger`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {load.status === "ready" && (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-sm text-body">
                {total === 0
                  ? "Hiển thị 0 thông báo"
                  : `Hiển thị ${start + 1}–${
                      start + rows.length
                    } trong ${total} thông báo`}
              </p>
              <Pagination
                page={page}
                totalPages={load.pages}
                onChange={changePage}
              />
            </div>
          )}
        </section>
      </div>

      {viewing && (
        <AdminModal title="Chi tiết thông báo" onClose={() => setViewing(null)}>
          <dl className="space-y-4 p-6 text-sm">
            <div>
              <dt className="text-xs uppercase text-muted">Tiêu đề</dt>
              <dd className="mt-1 font-semibold text-footer">
                {viewing.title}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted">Loại</dt>
              <dd className="mt-1 text-body">{viewing.notificationTypeName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted">Nội dung</dt>
              <dd className="mt-1 whitespace-pre-line text-body">
                {viewing.content}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted">Đường dẫn</dt>
              <dd className="mt-1 break-all text-body">
                {viewing.actionUrl || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted">Người gửi</dt>
              <dd className="mt-1 text-body">
                {viewing.createdBy === null
                  ? "Hệ thống (tự động)"
                  : `Admin #${viewing.createdBy}`}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted">Người nhận</dt>
              <dd className="mt-1 text-body">
                {viewing.readCount}/{viewing.recipientCount} người đã đọc
                {viewing.sendEmail ? " · có gửi email" : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted">Trạng thái</dt>
              <dd className="mt-1 text-body">
                {viewing.isActive ? "Đang hiện" : "Đang ẩn"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted">Ngày tạo</dt>
              <dd className="mt-1 text-body">
                {formatDate(viewing.createdAt)}
              </dd>
            </div>
          </dl>
        </AdminModal>
      )}

      {editing && (
        <AdminModal
          title={editing.id ? "Sửa thông báo" : "Tạo thông báo"}
          onClose={() => !saving && setEditing(null)}
        >
          <form onSubmit={submit}>
            <div className="space-y-4 p-6">
              <label className="block text-sm font-semibold text-heading">
                Tiêu đề
                <input
                  name="title"
                  required
                  maxLength={255}
                  defaultValue={editing.title}
                  className={field}
                />
              </label>
              <label className="block text-sm font-semibold text-heading">
                Loại thông báo
                <select
                  name="notificationTypeId"
                  required
                  defaultValue={editing.notificationTypeId || ""}
                  className={field}
                >
                  <option value="" disabled>
                    — Chọn loại —
                  </option>
                  {/* Chỉ loại đang hiện, riêng khi sửa giữ thêm loại hiện tại của thông báo */}
                  {types
                    .filter(
                      (t) => t.isActive || t.id === editing.notificationTypeId
                    )
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-heading">
                Nội dung
                <textarea
                  name="content"
                  required
                  defaultValue={editing.content}
                  rows={5}
                  className={field}
                />
              </label>
              <label className="block text-sm font-semibold text-heading">
                Đường dẫn khi bấm (tùy chọn)
                <input
                  name="actionUrl"
                  maxLength={500}
                  defaultValue={editing.actionUrl ?? ""}
                  placeholder="/news/1"
                  className={field}
                />
              </label>
              {!editing.id && (
                <>
                  <fieldset className="text-sm text-heading">
                    <legend className="font-semibold">Người nhận</legend>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {(
                        [
                          ["all", "Tất cả người dùng"],
                          ["some", "Chọn người nhận"],
                        ] as const
                      ).map(([v, label]) => (
                        <label
                          key={v}
                          className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 transition ${
                            audience === v
                              ? "border-primary-600 bg-primary-50 text-primary-700"
                              : "border-line hover:bg-primary-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="audience"
                            value={v}
                            checked={audience === v}
                            onChange={() => setAudience(v)}
                            className="accent-primary-600"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                    {audience === "some" && (
                      <>
                        <RecipientPicker
                          value={recipients}
                          onChange={setRecipients}
                        />
                        {recipients.length > 0 && (
                          <p className="mt-1 text-xs font-normal text-muted">
                            Đã chọn {recipients.length} người
                          </p>
                        )}
                      </>
                    )}
                  </fieldset>
                  <label className="flex items-start gap-2 text-sm text-heading">
                    <input
                      name="sendEmail"
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-primary-600"
                    />
                    <span>
                      <span className="font-semibold">
                        Thông báo quan trọng (
                        {audience === "all" ? "push" : "email + push"})
                      </span>
                      <span className="block text-xs text-muted">
                        {audience === "all"
                          ? "Gửi thông báo đẩy tới trình duyệt. Gửi cho tất cả người dùng thì không gửi email."
                          : "Gửi email và thông báo đẩy tới trình duyệt của người được chọn."}
                      </span>
                    </span>
                  </label>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditing(null)}
                className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50 disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                disabled={saving}
                className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : editing.id ? "Lưu" : "Gửi thông báo"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Xóa thông báo?"
          message="Bạn có chắc chắn muốn xóa thông báo này không? Thông báo cũng sẽ bị ẩn khỏi danh sách của người nhận."
          busy={removing}
          onConfirm={confirmDelete}
          onClose={() => !removing && setDeleting(null)}
        />
      )}
    </>
  );
}
