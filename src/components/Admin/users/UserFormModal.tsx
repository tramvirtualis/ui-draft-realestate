import { useState } from "react";
import { HelpCircle, Mail, Save, ShieldCheck, User as UserIcon, UserPlus } from "lucide-react";
import UserModalShell from "./UserModalShell";
import {
  ROLES, ROLE_LABEL, STATUSES, STATUS_LABEL, STATUS_OPTION_LABEL,
  type AdminUser, type UserRole, type UserStatus,
} from "../../../data/mockAdminUsers";

export type UserFormValues = { name: string; email: string; role: UserRole; status: UserStatus; sendInvite: boolean };

type Props = {
  user: AdminUser | null; // null = thêm mới
  onSave: (values: UserFormValues) => void;
  onClose: () => void;
};

const input =
  "h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100 aria-[invalid=true]:border-danger";
const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0]).join("").toUpperCase();

const cancelBtn = "rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50";
const primaryBtn = "flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95";

// Một form dùng cho cả "Thêm người dùng" và "Chỉnh sửa người dùng"
export default function UserFormModal({ user, onSave, onClose }: Props) {
  const editing = user !== null;
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<UserRole>(user?.role ?? "recruiter");
  const [status, setStatus] = useState<UserStatus>(user?.status ?? "active");
  const [sendInvite, setSendInvite] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const submit = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Nhập họ và tên";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Email không hợp lệ";
    setErrors(next);
    if (Object.keys(next).length === 0) onSave({ name: name.trim(), email: email.trim(), role, status, sendInvite });
  };

  return (
    <UserModalShell
      title={editing ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
      desc={editing ? "Cập nhật thông tin hồ sơ, vai trò và trạng thái tài khoản." : "Tạo tài khoản mới hoặc gửi lời mời tham gia không gian làm việc."}
      icon={ShieldCheck}
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <button type="button" onClick={onClose} className={cancelBtn}>Hủy</button>
          <button type="submit" className={primaryBtn}>
            {editing ? <Save size={16} /> : <UserPlus size={16} />} {editing ? "Lưu thay đổi" : "Thêm người dùng"}
          </button>
        </>
      }
    >
      {editing && user && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-xs font-bold text-primary-700">{initials(user.name)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-footer">{user.name}</p>
            <p className="truncate text-xs text-body">{user.email}</p>
          </div>
          <span className="rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">{STATUS_LABEL[user.status]}</span>
        </div>
      )}

      {editing && <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Thông tin cơ bản</p>}
      <div className={`grid gap-4 sm:grid-cols-2 ${editing ? "mt-3" : ""}`}>
        <label className="block">
          <span className="text-sm font-semibold text-footer">Họ và tên <span className="text-danger">*</span></span>
          <span className="relative mt-1.5 block">
            {!editing && <UserIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Minh Anh"
              aria-invalid={errors.name ? true : undefined}
              className={`${input} ${editing ? "" : "pl-10"}`}
            />
          </span>
          {errors.name && <span role="alert" className="mt-1 block text-xs text-danger">{errors.name}</span>}
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-footer">Email <span className="text-danger">*</span></span>
          <span className="relative mt-1.5 block">
            {!editing && <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ten@congty.vn"
              aria-invalid={errors.email ? true : undefined}
              className={`${input} ${editing ? "" : "pl-10"}`}
            />
          </span>
          {errors.email && <span role="alert" className="mt-1 block text-xs text-danger">{errors.email}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-footer">Vai trò <span className="text-danger">*</span></span>
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={`${input} mt-1.5`}>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
        </label>

        {!editing && (
          <label className="block">
            <span className="text-sm font-semibold text-footer">Trạng thái tài khoản</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as UserStatus)} className={`${input} mt-1.5`}>
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_OPTION_LABEL[s]}</option>)}
            </select>
            <span className="mt-1.5 block text-xs text-body">Người dùng có thể đăng nhập ngay sau khi tài khoản được tạo.</span>
          </label>
        )}
      </div>

      {editing && (
        <fieldset className="mt-5">
          <legend className="text-[11px] font-semibold uppercase tracking-wide text-muted">Trạng thái tài khoản</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {(["active", "locked", "pending"] as UserStatus[]).map((s) => (
              <label
                key={s}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  status === s ? "border-primary-500 bg-primary-50 text-primary-700" : "border-line bg-white text-footer hover:bg-primary-50/50"
                }`}
              >
                <input type="radio" name="user-status" checked={status === s} onChange={() => setStatus(s)} className="accent-primary-600" />
                {STATUS_OPTION_LABEL[s]}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {!editing && (
        <>
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-primary-50 px-4 py-3">
            <HelpCircle size={18} className="mt-0.5 shrink-0 text-primary-600" />
            <div>
              <p className="text-sm font-semibold text-primary-700">Gửi lời mời qua email</p>
              <p className="mt-0.5 text-xs text-body">Hệ thống sẽ gửi liên kết thiết lập mật khẩu, có hiệu lực trong 72 giờ.</p>
            </div>
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={sendInvite} onChange={(e) => setSendInvite(e.target.checked)} className="mt-1 h-4 w-4 accent-primary-600" />
            <span>
              <span className="block text-sm font-semibold text-footer">Gửi email mời ngay sau khi tạo</span>
              <span className="block text-xs text-body">Bạn có thể gửi lại lời mời từ danh sách người dùng.</span>
            </span>
          </label>
        </>
      )}
    </UserModalShell>
  );
}
