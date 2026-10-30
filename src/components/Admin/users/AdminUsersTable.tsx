import { Link } from "react-router-dom";
import { Eye, Lock, LockOpen, Pencil } from "lucide-react";
import Avatar from "../../common/Avatar";
import { formatDate } from "../../../utils/formatDate";
import { USER_STATUS_LABEL, roleLabel, type AdminUser, type AdminUserStatus } from "../../../types/admin/adminUser.types";

type Props = {
  items: AdminUser[];
  currentUserId: number | null; // admin đang đăng nhập: không tự khóa chính mình
  busyId?: number | null;
  onView: (user: AdminUser) => void;
  onLock: (user: AdminUser) => void; // mở hộp xác nhận khóa
  onUnlock: (user: AdminUser) => void;
};

const TH = "px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted";
const btn =
  "flex h-8 w-8 items-center justify-center rounded-lg transition focus-visible:outline-2 focus-visible:outline-primary-600 active:scale-95 disabled:opacity-50";

const STATUS_STYLE: Record<AdminUserStatus, { pill: string; dot: string }> = {
  ACTIVE: { pill: "bg-success/10 text-success", dot: "bg-success" },
  INACTIVE: { pill: "bg-warning/10 text-warning", dot: "bg-warning" },
  LOCKED: { pill: "bg-danger/10 text-danger", dot: "bg-danger" },
};

export default function AdminUsersTable({ items, currentUserId, busyId = null, onView, onLock, onUnlock }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="bg-primary-50/60">
          <tr>
            <th className={TH}>Người dùng</th>
            <th className={TH}>Số điện thoại</th>
            <th className={TH}>Vai trò</th>
            <th className={TH}>Trạng thái</th>
            <th className={TH}>Ngày tạo</th>
            <th className={TH} />
          </tr>
        </thead>
        <tbody>
          {items.map((u) => {
            const name = u.fullName ?? "Chưa đặt tên";
            const isMe = u.id === currentUserId;
            const style = STATUS_STYLE[u.status];
            return (
              <tr key={u.id} className="border-t border-line transition hover:bg-primary-50/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={u.avatarUrl} fullName={name} className="h-10 w-10" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate font-semibold text-footer">
                        {name}
                        {isMe && <span className="rounded bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700">Bạn</span>}
                      </p>
                      <p className="truncate text-xs text-body">{u.email ?? "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-heading">{u.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{roleLabel(u.role?.name)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.pill}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {USER_STATUS_LABEL[u.status]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-body">{u.createdAt ? formatDate(u.createdAt) : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button type="button" onClick={() => onView(u)} aria-label={`Xem ${name}`} title="Xem chi tiết" className={`${btn} text-body hover:bg-primary-50`}>
                      <Eye size={16} />
                    </button>
                    <Link to={`/admin/users/${u.id}/edit`} aria-label={`Sửa ${name}`} title="Sửa người dùng" className={`${btn} text-body hover:bg-primary-50`}>
                      <Pencil size={16} />
                    </Link>
                    {u.status === "LOCKED" ? (
                      <button
                        type="button"
                        onClick={() => onUnlock(u)}
                        disabled={busyId === u.id}
                        aria-label={`Mở khóa ${name}`}
                        title="Mở khóa tài khoản"
                        className={`${btn} bg-success/10 text-success hover:bg-success/20`}
                      >
                        <LockOpen size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onLock(u)}
                        disabled={busyId === u.id || isMe}
                        aria-label={`Khóa ${name}`}
                        title={isMe ? "Không thể tự khóa chính mình" : "Khóa tài khoản"}
                        className={`${btn} bg-danger/10 text-danger hover:bg-danger/20`}
                      >
                        <Lock size={16} />
                      </button>
                    )}
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
