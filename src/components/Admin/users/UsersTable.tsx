import { useEffect, useRef, useState } from "react";
import { Lock, MoreHorizontal, Pencil, Send, Trash2, Unlock } from "lucide-react";
import { ROLE_LABEL, ROLE_TONE, STATUS_LABEL, STATUS_TONE, type AdminUser } from "../../../data/mockAdminUsers";

type Props = {
  users: AdminUser[];
  selected: Set<number>;
  onToggle: (id: number) => void;
  onToggleAll: (checked: boolean) => void;
  onEdit: (user: AdminUser) => void;
  onToggleLock: (user: AdminUser) => void;
  onResendInvite: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
};

const TH = "px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted";
const iconBtn = "flex h-9 w-9 items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-primary-600";

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0]).join("").toUpperCase();

// Nút "..." mở menu thao tác phụ của một dòng
function RowMenu({ user, onResendInvite, onDelete }: Pick<Props, "onResendInvite" | "onDelete"> & { user: AdminUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Thao tác khác với ${user.name}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`${iconBtn} border border-line text-body hover:bg-primary-50`}
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <ul className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-xl border border-line bg-white py-1 text-sm shadow-lg">
          <li>
            <button
              type="button"
              onClick={() => { setOpen(false); onResendInvite(user); }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-heading transition hover:bg-primary-50"
            >
              <Send size={14} /> Gửi lại lời mời
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => { setOpen(false); onDelete(user); }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-danger transition hover:bg-danger/5"
            >
              <Trash2 size={14} /> Xóa người dùng
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

export default function UsersTable({ users, selected, onToggle, onToggleAll, onEdit, onToggleLock, onResendInvite, onDelete }: Props) {
  const allChecked = users.length > 0 && users.every((u) => selected.has(u.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-primary-50/60">
          <tr>
            <th className="w-12 px-4 py-3">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => onToggleAll(e.target.checked)}
                aria-label="Chọn tất cả"
                className="h-4 w-4 accent-primary-600"
              />
            </th>
            <th className={TH}>Người dùng</th>
            <th className={TH}>Vai trò</th>
            <th className={TH}>Tổ chức</th>
            <th className={TH}>Trạng thái</th>
            <th className={TH}>Truy cập gần nhất</th>
            <th className={TH}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const role = ROLE_TONE[u.role];
            const st = STATUS_TONE[u.status];
            const locked = u.status === "locked";
            return (
              <tr key={u.id} className="border-t border-line transition hover:bg-primary-50/40">
                <td className="px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={selected.has(u.id)}
                    onChange={() => onToggle(u.id)}
                    aria-label={`Chọn ${u.name}`}
                    className="h-4 w-4 accent-primary-600"
                  />
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-100 bg-primary-50 text-xs font-bold text-primary-700">
                      {initials(u.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-footer">{u.name}</p>
                      <p className="truncate text-xs text-body">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${role.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${role.dot}`} /> {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-heading">{u.organization}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} /> {STATUS_LABEL[u.status]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-body">{u.lastAccess}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onEdit(u)} aria-label={`Sửa ${u.name}`} title="Chỉnh sửa" className={`${iconBtn} bg-primary-50 text-primary-600 hover:bg-primary-100`}>
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleLock(u)}
                      aria-label={locked ? `Mở khóa ${u.name}` : `Khóa ${u.name}`}
                      title={locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                      className={`${iconBtn} bg-amber-100 text-warning hover:bg-amber-200`}
                    >
                      {locked ? <Unlock size={15} /> : <Lock size={15} />}
                    </button>
                    <RowMenu user={u} onResendInvite={onResendInvite} onDelete={onDelete} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
