import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import ToastProvider from "../../components/common/Toast";
import GlobalLoadingOverlay from "../../components/common/GlobalLoadingOverlay";
import NotificationRealtime from "../../components/Notification/NotificationRealtime";

// Khung trang quản trị: sidebar trái + topbar + nội dung (Outlet)
export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ToastProvider>
      <NotificationRealtime />
      {/* Mọi thao tác tạo / sửa / ẩn / xoá trong trang quản trị đều tự hiện vòng loading */}
      <GlobalLoadingOverlay />
      <div className="flex min-h-screen bg-page">
        <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar onMenu={() => setMenuOpen(true)} />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
