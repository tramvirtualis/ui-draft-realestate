import { useRef } from "react";
import { Camera, Loader2, Mail, Phone, Trash2, User } from "lucide-react";
import AuthField from "../Auth/AuthField";
import Avatar from "../common/Avatar";
import { useToast } from "../common/toastContext";
import { useProfileForm } from "../../hooks/account/useProfileForm";
import type { AuthUser } from "../../types/auth/auth.types";
import { formatDate } from "../../utils/formatDate";
import { roleLabel } from "../../utils/user";

// Thẻ thông tin cá nhân: ảnh đại diện (xem trước, bấm Lưu mới upload) + họ tên, SĐT; email chỉ xem
export default function ProfileInfoCard({ user }: { user: AuthUser }) {
  const toast = useToast();
  const form = useProfileForm(user, () => toast.show("Đã cập nhật hồ sơ"));
  const fileRef = useRef<HTMLInputElement>(null);
  const displayName = form.fullName.trim() || user.fullName;

  return (
    <section className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-heading">Thông tin cá nhân</h2>
      <p className="mt-1 text-sm text-body">Tên và ảnh đại diện sẽ hiển thị trên bài viết, bình luận của bạn.</p>

      <form onSubmit={form.submit} className="mt-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative w-fit">
            <Avatar src={form.avatarUrl} fullName={displayName} className="h-24 w-24 text-2xl ring-4 ring-primary-50" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Đổi ảnh đại diện"
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary-600 text-white shadow hover:bg-primary-700"
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                form.pickAvatar(e.target.files?.[0]);
                e.target.value = ""; // chọn lại đúng file đó vẫn nhận
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-xl font-semibold text-heading">{displayName}</p>
              <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                {roleLabel(user.role)}
              </span>
            </div>
            {user.createdAt && <p className="mt-1 text-sm text-body">Thành viên từ {formatDate(user.createdAt)}</p>}
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-full border border-primary-200 px-4 py-1.5 font-medium text-primary-700 hover:bg-primary-50"
              >
                Chọn ảnh mới
              </button>
              {form.hasAvatar && (
                <button
                  type="button"
                  onClick={form.clearAvatar}
                  className="flex items-center gap-1.5 rounded-full px-4 py-1.5 font-medium text-body hover:bg-gray-100"
                >
                  <Trash2 size={14} /> Gỡ ảnh
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-body/80">JPG, PNG hoặc WEBP, tối đa 5MB.</p>
          </div>
        </div>

        <div className="my-6 h-px bg-line" />

        <div className="grid gap-5 sm:grid-cols-2">
          <AuthField
            label="Họ và tên"
            icon={User}
            value={form.fullName}
            onChange={(e) => form.setFullName(e.target.value)}
            maxLength={100}
            autoComplete="name"
            required
          />
          <AuthField
            label="Số điện thoại"
            icon={Phone}
            type="tel"
            value={form.phone}
            onChange={(e) => form.setPhone(e.target.value)}
            placeholder="VD: 0912345678"
            autoComplete="tel"
          />
          <AuthField
            label="Email"
            icon={Mail}
            value={user.email}
            disabled
            hint="Email dùng để đăng nhập nên không thể thay đổi."
            className="sm:col-span-2"
          />
        </div>

        {form.error && (
          <p role="alert" className="mt-5 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {form.error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {form.dirty && (
            <button
              type="button"
              onClick={form.reset}
              disabled={form.saving}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-body hover:bg-gray-100 disabled:opacity-50"
            >
              Hủy thay đổi
            </button>
          )}
          <button
            type="submit"
            disabled={!form.dirty || form.saving}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-2.5 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {form.saving && <Loader2 size={16} className="animate-spin" />}
            Lưu thay đổi
          </button>
        </div>
      </form>
    </section>
  );
}
