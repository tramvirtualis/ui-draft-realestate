import { useCallback, useEffect, useMemo, useState } from "react";
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import AdminModal from "../../../components/Admin/AdminModal";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import { useToast } from "../../../components/common/toastContext";
import { getErrorMessage } from "../../../api";
import { adminRoleService } from "../../../services/admin/adminRoleService";
import { roleLabel } from "../../../types/admin/adminUser.types";
import {
  PERMISSION_ACTION_LABEL,
  PERMISSION_MODULE_LABEL,
  splitPermission,
  type Permission,
  type RoleDetail,
} from "../../../types/admin/role.types";

const SUPER_ADMIN = "ROLE_SUPER_ADMIN";
const NO_PERMISSIONS: Permission[] = [];
const NAME_RULE = /^[A-Za-z0-9_]+$/;
const MAX_NAME = 45; // BE giới hạn 50 ký tự gồm cả tiền tố ROLE_
const field =
  "mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm font-normal outline-none focus:border-primary-600";
const btn =
  "flex h-8 w-8 items-center justify-center rounded-lg transition focus-visible:outline-2 focus-visible:outline-primary-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40";
const TH =
  "px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted";

// Một dòng trên bảng tick: module + mã quyền theo từng hành động (VIEW, MANAGE)
type ModuleRow = { module: string; label: string; codes: Record<string, string> };

type Load =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; roles: RoleDetail[]; permissions: Permission[] };

// Gom danh sách quyền BE trả về (đã theo thứ tự enum) thành các dòng theo module.
// Thêm quyền mới bên BE là tự hiện thêm dòng / cột, không cần sửa FE.
function groupPermissions(permissions: Permission[]) {
  const rows: ModuleRow[] = [];
  const actions: string[] = [];
  for (const p of permissions) {
    const { module, action } = splitPermission(p.code);
    let row = rows.find((r) => r.module === module);
    if (!row) {
      row = { module, label: PERMISSION_MODULE_LABEL[module] ?? module, codes: {} };
      rows.push(row);
    }
    row.codes[action] = p.code;
    if (!actions.includes(action)) actions.push(action);
  }
  return { rows, actions };
}

// Tóm tắt quyền của role thành chip: "Tin tức · Toàn bộ", "Tuyển dụng · Xem"
function summarize(role: RoleDetail, rows: ModuleRow[]): string[] {
  if (role.name === SUPER_ADMIN) return ["Toàn quyền"];
  return rows.flatMap((r) => {
    const all = Object.entries(r.codes);
    const held = all.filter(([, code]) => role.permissions.includes(code));
    if (!held.length) return [];
    const text =
      held.length === all.length
        ? "Toàn bộ"
        : held.map(([action]) => PERMISSION_ACTION_LABEL[action] ?? action).join(", ");
    return [`${r.label} · ${text}`];
  });
}

function RoleModal({
  role,
  permissions,
  onClose,
  onSaved,
}: {
  role: RoleDetail | null;
  permissions: Permission[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const { rows, actions } = useMemo(() => groupPermissions(permissions), [permissions]);
  const allCodes = useMemo(() => permissions.map((p) => p.code), [permissions]);
  const [name, setName] = useState(role ? role.name.replace(/^ROLE_/, "") : "");
  // Role hệ thống (Admin / Giám đốc dự án) chỉ sửa quyền, tên giữ nguyên
  const nameLocked = role?.system ?? false;
  const [selected, setSelected] = useState<Set<string>>(new Set(role?.permissions ?? []));
  const [saving, setSaving] = useState(false);

  const allChecked = allCodes.length > 0 && allCodes.every((c) => selected.has(c));

  // Tick "Thêm / sửa / xóa" thì tự tick "Xem" (không xem được danh sách thì không thao tác được);
  // bỏ "Xem" thì bỏ luôn mọi quyền khác của khu vực đó
  const toggle = (code: string, checked: boolean) => {
    const { module, action } = splitPermission(code);
    const view = `${module}_VIEW`;
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(code);
        if (action !== "VIEW" && allCodes.includes(view)) next.add(view);
      } else {
        next.delete(code);
        if (action === "VIEW") {
          for (const c of allCodes) if (splitPermission(c).module === module) next.delete(c);
        }
      }
      return next;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.show("Vui lòng nhập tên vai trò", "error");
      return;
    }
    if (!NAME_RULE.test(trimmed)) {
      toast.show("Tên vai trò chỉ gồm chữ không dấu, số và dấu _", "error");
      return;
    }
    setSaving(true);
    try {
      const request = { name: trimmed, permissionCodes: [...selected] };
      if (role) await adminRoleService.edit(role.id, request);
      else await adminRoleService.add(request);
      toast.show(role ? "Đã cập nhật vai trò" : "Đã tạo vai trò");
      onSaved();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminModal title={role ? "Sửa vai trò" : "Tạo vai trò"} onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-5 p-6">
        <label className="block text-sm font-semibold text-heading">
          Tên vai trò <span className="text-danger">*</span>
          <input
            autoFocus={!nameLocked}
            value={name}
            maxLength={MAX_NAME}
            disabled={nameLocked}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            placeholder="Vd: EDITOR, HR, CONTENT_MANAGER"
            className={`${field} font-mono uppercase`}
          />
          <span className="mt-1 block text-xs font-normal text-muted">
            {nameLocked ? (
              "Vai trò hệ thống, được gán tự động khi giao dự án; chỉ chỉnh được quyền."
            ) : (
              <>
                Chữ không dấu, số và dấu _. Lưu thành{" "}
                <code className="rounded bg-primary-50 px-1 text-primary-700">ROLE_{name.trim() || "..."}</code>
              </>
            )}
          </span>
        </label>

        <fieldset>
          <legend className="flex w-full items-center justify-between text-sm font-semibold text-heading">
            Quyền trang quản trị
            <label className="flex cursor-pointer items-center gap-2 text-xs font-normal text-body">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => setSelected(new Set(e.target.checked ? allCodes : []))}
                className="h-4 w-4 accent-primary-600"
              />
              Chọn tất cả
            </label>
          </legend>
          <div className="mt-2 overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary-50/60">
                <tr>
                  <th className={TH}>Khu vực</th>
                  {actions.map((a) => (
                    <th key={a} className={`${TH} text-center`}>
                      {PERMISSION_ACTION_LABEL[a] ?? a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.module} className="border-t border-line">
                    <td className="px-4 py-3 font-medium text-footer">{r.label}</td>
                    {actions.map((a) => {
                      const code = r.codes[a];
                      const description = permissions.find((p) => p.code === code)?.description;
                      return (
                        <td key={a} className="px-4 py-3 text-center">
                          {code ? (
                            <input
                              type="checkbox"
                              checked={selected.has(code)}
                              onChange={(e) => toggle(code, e.target.checked)}
                              aria-label={description ?? code}
                              title={description}
                              className="h-4 w-4 cursor-pointer accent-primary-600"
                            />
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">
            Đã chọn {selected.size}/{allCodes.length} quyền. Quyền Dự án chỉ áp dụng cho các dự án được giao
            (trang Nhân sự dự án). Trang Tổng quan và Phân quyền chỉ dành cho Quản trị hệ thống.
          </p>
        </fieldset>

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

// Phân quyền: tạo vai trò và tick quyền cho từng vai trò (chỉ SUPER_ADMIN)
export default function AdminRolesPage() {
  const toast = useToast();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);
  // undefined = đóng, null = tạo mới
  const [editing, setEditing] = useState<RoleDetail | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<RoleDetail | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminRoleService.list(), adminRoleService.permissions()])
      .then(
        ([roles, permissions]) =>
          !cancelled && setLoad({ status: "ready", roles, permissions })
      )
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);
  const permissions = load.status === "ready" ? load.permissions : NO_PERMISSIONS;
  const { rows } = useMemo(() => groupPermissions(permissions), [permissions]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminRoleService.remove(deleting.id);
      toast.show(`Đã xóa vai trò ${deleting.name}`);
      refresh();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        breadcrumb={[
          { label: "Tổng quan", to: "/admin/dashboard" },
          { label: "Hệ thống" },
          { label: "Phân quyền" },
        ]}
        title="Phân quyền"
        desc="Tạo vai trò cho nhân viên và chọn những khu vực trong trang quản trị mà vai trò đó được xem hoặc quản lý."
        action={
          <button
            type="button"
            onClick={() => setEditing(null)}
            disabled={load.status !== "ready"}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
          >
            <Plus size={16} /> Tạo vai trò
          </button>
        }
      />

      <div className="-mt-16 px-4 pb-10 md:px-8">
        <section className="rounded-2xl border border-line bg-white shadow-sm">
          {load.status === "loading" ? (
            <div
              className="animate-pulse space-y-3 p-4"
              aria-busy="true"
              aria-label="Đang tải danh sách vai trò"
            >
              {[0, 1, 2].map((n) => (
                <div key={n} className="h-12 rounded-xl bg-primary-50" />
              ))}
            </div>
          ) : load.status === "error" ? (
            <div role="alert" className="px-6 py-14 text-center">
              <p className="font-semibold text-heading">Không tải được danh sách vai trò</p>
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
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-primary-50/60">
                  <tr>
                    <th className={TH}>Vai trò</th>
                    <th className={TH}>Quyền</th>
                    <th className={`${TH} text-center`}>Người dùng</th>
                    <th className={TH} />
                  </tr>
                </thead>
                <tbody>
                  {load.roles.map((r) => {
                    const chips = summarize(r, rows);
                    return (
                      <tr
                        key={r.id}
                        className="border-t border-line align-top transition hover:bg-primary-50/40"
                      >
                        <td className="px-4 py-3">
                          <p className="flex items-center gap-1.5 font-semibold text-footer">
                            {roleLabel(r.name)}
                            {r.system && (
                              <Lock
                                size={13}
                                className="text-muted"
                                aria-label="Vai trò hệ thống"
                              />
                            )}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-muted">{r.name}</p>
                        </td>
                        <td className="max-w-[480px] px-4 py-3">
                          {chips.length ? (
                            <div className="flex flex-wrap gap-1.5">
                              {chips.map((c) => (
                                <span
                                  key={c}
                                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                    r.name === SUPER_ADMIN
                                      ? "bg-accent/10 text-accent"
                                      : "bg-primary-50 text-primary-700"
                                  }`}
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted">
                              {r.system ? "Không có quyền quản trị" : "Chưa chọn quyền nào"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-footer">
                          {r.userCount}
                        </td>
                        <td className="px-4 py-3">
                          {!r.permissionsEditable ? (
                            <p className="text-right text-xs text-muted">Vai trò hệ thống</p>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditing(r)}
                                aria-label={`Sửa ${r.name}`}
                                title="Sửa"
                                className={`${btn} text-body hover:bg-primary-50`}
                              >
                                <Pencil size={16} />
                              </button>
                              {!r.system && (
                                <button
                                  type="button"
                                  onClick={() => setDeleting(r)}
                                  disabled={r.userCount > 0}
                                  aria-label={`Xóa ${r.name}`}
                                  title={
                                    r.userCount > 0
                                      ? "Còn người dùng mang vai trò này, hãy đổi vai trò của họ trước"
                                      : "Xóa"
                                  }
                                  className={`${btn} bg-danger/10 text-danger hover:bg-danger/20`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {editing !== undefined && load.status === "ready" && (
        <RoleModal
          role={editing}
          permissions={load.permissions}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            refresh();
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Xóa vai trò?"
          message={`Xóa vai trò ${deleting.name}? Thao tác này không hoàn tác được.`}
          busy={busy}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
