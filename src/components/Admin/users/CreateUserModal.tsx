import { useState } from "react";
import { Eye, EyeOff, Mail, Phone, User as UserIcon, UserPlus } from "lucide-react";
import UserModalShell from "./UserModalShell";
import type { AdminUserCreateInput } from "../../../services/user/adminUserService";
import { EMAIL_RULE, PASSWORD_RULE, PHONE_RULE, roleLabel, type RoleOption } from "../../../types/admin/adminUser.types";

type Props = {
  roles: RoleOption[];
  submitting: boolean;
  onSubmit: (input: AdminUserCreateInput) => void;
  onClose: () => void;
};

type Field = "fullName" | "email" | "phone" | "password" | "confirmPassword" | "roleId";

const input =
  "h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100 aria-[invalid=true]:border-danger";
const cancelBtn = "rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50";
const primaryBtn =
  "flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95 disabled:opacity-60";

// Mặc định chọn vai trò "Người dùng" nếu có
const defaultRoleId = (roles: RoleOption[]) => (roles.find((r) => r.name === "ROLE_USER") ?? roles[0])?.id ?? 0;

// Admin tạo tài khoản mới: dùng được ngay, không cần xác thực OTP như khi tự đăng ký
export default function CreateUserModal({ roles, submitting, onSubmit, onClose }: Props) {
  const [values, setValues] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [roleId, setRoleId] = useState(() => defaultRoleId(roles));
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = () => {
    const next: typeof errors = {};
    if (!values.fullName.trim()) next.fullName = "Nhập họ và tên";
    if (!EMAIL_RULE.test(values.email.trim())) next.email = "Email không hợp lệ";
    if (values.phone.trim() && !PHONE_RULE.test(values.phone.trim())) next.phone = "Số điện thoại không hợp lệ";
    if (!PASSWORD_RULE.test(values.password)) next.password = "Tối thiểu 8 ký tự, gồm chữ cái và số";
    if (values.confirmPassword !== values.password) next.confirmPassword = "Mật khẩu xác nhận không khớp";
    if (!roleId) next.roleId = "Chọn vai trò";
    setErrors(next);
    if (Object.keys(next).length === 0) onSubmit({ ...values, roleId });
  };

  const field = (key: Field, label: string, required: boolean, control: React.ReactNode) => (
    <label className="block">
      <span className="text-sm font-semibold text-footer">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      <span className="relative mt-1.5 block">{control}</span>
      {errors[key] && <span role="alert" className="mt-1 block text-xs text-danger">{errors[key]}</span>}
    </label>
  );

  const icon = "absolute left-3.5 top-1/2 -translate-y-1/2 text-muted";
  const passwordType = showPassword ? "text" : "password";

  return (
    <UserModalShell
      title="Thêm người dùng"
      desc="Tài khoản do quản trị viên tạo được kích hoạt sẵn, người dùng đăng nhập được ngay."
      icon={UserPlus}
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <button type="button" onClick={onClose} className={cancelBtn}>Hủy</button>
          <button type="submit" disabled={submitting} className={primaryBtn}>
            <UserPlus size={16} /> {submitting ? "Đang tạo..." : "Thêm người dùng"}
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {field("fullName", "Họ và tên", true, <>
          <UserIcon size={15} className={icon} />
          <input value={values.fullName} onChange={set("fullName")} maxLength={100} placeholder="Nguyễn Minh Anh" aria-invalid={errors.fullName ? true : undefined} className={`${input} pl-10`} />
        </>)}
        {field("email", "Email", true, <>
          <Mail size={15} className={icon} />
          <input type="email" value={values.email} onChange={set("email")} maxLength={100} placeholder="ten@congty.vn" aria-invalid={errors.email ? true : undefined} className={`${input} pl-10`} />
        </>)}
        {field("phone", "Số điện thoại", false, <>
          <Phone size={15} className={icon} />
          <input type="tel" value={values.phone} onChange={set("phone")} maxLength={11} placeholder="0901234567" aria-invalid={errors.phone ? true : undefined} className={`${input} pl-10`} />
        </>)}
        {field("roleId", "Vai trò", true,
          <select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))} aria-invalid={errors.roleId ? true : undefined} className={input}>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{roleLabel(r.name)}</option>
            ))}
          </select>,
        )}
        {field("password", "Mật khẩu", true,
          <>
            <input type={passwordType} value={values.password} onChange={set("password")} autoComplete="new-password" aria-invalid={errors.password ? true : undefined} className={`${input} pr-11`} />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition hover:bg-primary-50"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </>,
        )}
        {field("confirmPassword", "Xác nhận mật khẩu", true,
          <input type={passwordType} value={values.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" aria-invalid={errors.confirmPassword ? true : undefined} className={input} />,
        )}
      </div>
      <p className="mt-3 text-xs text-body">Mật khẩu tối thiểu 8 ký tự, gồm cả chữ cái và số. Hãy gửi mật khẩu này cho người dùng để họ đăng nhập.</p>
    </UserModalShell>
  );
}
