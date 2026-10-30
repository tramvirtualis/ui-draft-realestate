import { useState } from "react";
import { ChevronDown } from "lucide-react";
import AdminModal from "../AdminModal";
import Avatar from "../../common/Avatar";
import { formatDate, formatTime } from "../../../utils/formatDate";
import {
  SUPER_ADMIN_ROLE_NAME, USER_STATUS_LABEL, isProjectRole, roleLabel, type AdminUser, type RoleOption,
} from "../../../types/admin/adminUser.types";
import { selectIsSuperAdmin, useAppSelector } from "../../../store";

type Props = {
  user: AdminUser;
  roles: RoleOption[];
  isMe: boolean; // không tự đổi vai trò của chính mình
  onChangeRole: (user: AdminUser, roleId: number) => Promise<void>;
  onClose: () => void;
};

const select =
  "h-11 w-full appearance-none rounded-xl border border-line bg-white pl-4 pr-10 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100 disabled:opacity-60";

// Thông tin tài khoản + đổi vai trò
export default function UserDetailModal({ user, roles, isMe, onChangeRole, onClose }: Props) {
  const [roleId, setRoleId] = useState<number>(user.role?.id ?? 0);
  const [saving, setSaving] = useState(false);
  // Tài khoản Quản trị hệ thống chỉ Quản trị hệ thống mới đổi vai trò được (BE cũng chặn)
  const viewerIsSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const superAdminLocked = user.role?.name === SUPER_ADMIN_ROLE_NAME && !viewerIsSuperAdmin;
  // Đang phụ trách dự án: vai trò đổi qua trang Nhân sự dự án, không đổi ở đây
  const locked = superAdminLocked || user.projectStaff;
  const name = user.fullName ?? "Chưa đặt tên";
  const changed = roleId !== (user.role?.id ?? 0) && roleId !== 0;

  const save = async () => {
    setSaving(true);
    try {
      await onChangeRole(user, roleId);
    } finally {
      setSaving(false);
    }
  };

  const rows: [string, string][] = [
    ["Email", user.email ?? "—"],
    ["Số điện thoại", user.phone ?? "—"],
    ["Trạng thái", USER_STATUS_LABEL[user.status]],
    ["Ngày tạo", user.createdAt ? `${formatDate(user.createdAt)} · ${formatTime(user.createdAt)}` : "—"],
  ];

  return (
    <AdminModal title="Chi tiết người dùng" onClose={onClose}>
      <div className="space-y-5 px-6 py-5">
        <div className="flex items-center gap-3">
          <Avatar src={user.avatarUrl} fullName={name} className="h-14 w-14" />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-footer">{name}</p>
            <p className="text-sm text-body">{roleLabel(user.role?.name)}</p>
          </div>
        </div>

        <dl className="divide-y divide-line rounded-xl border border-line">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
              <dt className="text-body">{k}</dt>
              <dd className="text-right font-medium text-heading">{v}</dd>
            </div>
          ))}
        </dl>

        <div>
          <label className="block text-sm font-semibold text-footer" htmlFor="user-role">
            Vai trò
          </label>
          <div className="mt-1.5 flex gap-3">
            <span className="relative block flex-1">
              {locked ? (
                // Chỉ hiện chữ, không có ô chọn
                <input id="user-role" value={roleLabel(user.role?.name)} readOnly disabled className={select} />
              ) : (
                <>
                  <select id="user-role" value={roleId} onChange={(e) => setRoleId(Number(e.target.value))} disabled={isMe || saving} className={select}>
                    {!user.role && <option value={0}>— Chọn vai trò —</option>}
                    {/* Vai trò dự án không có trong danh sách chọn: vẫn hiện vai trò hiện tại */}
                    {user.role && isProjectRole(user.role.name) && (
                      <option value={user.role.id} disabled>
                        {roleLabel(user.role.name)}
                      </option>
                    )}
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {roleLabel(r.name)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
                </>
              )}
            </span>
            <button
              type="button"
              onClick={() => void save()}
              disabled={!changed || isMe || locked || saving}
              className="rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
          {!user.projectStaff && (
            <p className="mt-1.5 text-xs text-muted">
              {isMe
                ? "Bạn không thể tự đổi vai trò của chính mình."
                : superAdminLocked
                  ? "Chỉ Quản trị hệ thống mới đổi được vai trò của tài khoản Quản trị hệ thống."
                  : "Đổi vai trò sẽ đăng xuất người này khỏi mọi thiết bị để nhận quyền mới."}
            </p>
          )}
        </div>
      </div>
    </AdminModal>
  );
}
