import { ChevronRight } from "lucide-react";
import ChangePasswordCard from "../../components/Account/ChangePasswordCard";
import ProfileInfoCard from "../../components/Account/ProfileInfoCard";
import { selectCurrentUser, useAppSelector } from "../../store";

export default function ProfilePage() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <div>
      <nav className="flex items-center gap-3 text-xs text-muted">
        <span>Tài khoản</span> <ChevronRight size={12} />
        <span className="font-semibold text-primary-600">Hồ sơ cá nhân</span>
      </nav>
      <h1 className="mt-4 text-4xl font-bold text-heading">Hồ sơ cá nhân</h1>
      <p className="mt-2 text-sm text-body">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</p>

      {/* Thông tin lấy từ store (GET /users/me lúc đăng nhập); chưa nạp xong thì hiện khung chờ */}
      {user ? (
        <div className="mt-6 space-y-6">
          {/* key: đổi tài khoản thì form khởi tạo lại theo người mới */}
          <ProfileInfoCard key={user.id} user={user} />
          <ChangePasswordCard hasPassword={user.hasPassword ?? true} />
        </div>
      ) : (
        <div className="mt-6 animate-pulse space-y-6" aria-busy="true">
          <div className="h-96 rounded-3xl bg-primary-50" />
          <div className="h-64 rounded-3xl bg-primary-50" />
        </div>
      )}
    </div>
  );
}
