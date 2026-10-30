import { Outlet, useLocation } from "react-router-dom";
// Hoạt hình khung chat + robot trợ lý (keyframes hd-chat-open, hd-msg-in, hd-mascot-*)
import "../../components/Home/home.css";
import HavenHeader from "../../components/Home/HavenHeader";
import Chatbot from "../../components/Home/Chatbot";
import SkylineFooter from "../../components/Home/SkylineFooter";
import { FONT } from "../../components/Home/urbanUi";
import ToastProvider from "../../components/common/Toast";
import NotificationRealtime from "../../components/Notification/NotificationRealtime";
import GlobalLoadingOverlay from "../../components/common/GlobalLoadingOverlay";

// Khung chung của mọi trang người dùng, cùng giao diện với trang chủ Hubtech:
// header (HavenHeader), chân trang chữ "hubtech" khổng lồ (SkylineFooter), trợ lý AI kiểu phẳng, font Inter Tight
export default function UserLayout() {
  const { pathname } = useLocation();
  return (
    // ToastProvider ở đây để mọi trang người dùng hiển thị được thông báo (lưu dự án, lỗi API...)
    <ToastProvider>
      <NotificationRealtime />
      {/* Gửi form / tạo / sửa / xoá tự hiện vòng loading (gồm cả khu tài khoản, nhà tuyển dụng);
          thao tác nhỏ như thích, bình luận, lưu tin, chatbot đánh dấu silentLoading ở service */}
      <GlobalLoadingOverlay />
      <div className="flex min-h-screen flex-col bg-page" style={{ fontFamily: FONT }}>
        <HavenHeader font={FONT} />
        {/* Header cố định (fixed): chừa đúng chiều cao header để nội dung không bị che */}
        <div className="h-18 shrink-0" aria-hidden />
        <main className="flex-grow">
          {/* key theo đường dẫn: mỗi lần sang trang nội dung hiện dần lại */}
          <div key={pathname} className="animate-page-in">
            <Outlet />
          </div>
        </main>
        <SkylineFooter />
      </div>
      {/* Trợ lý AI: nằm ở layout nên trang người dùng nào cũng có; z-[60] để nằm trên nội dung trang */}
      <div className="relative z-[60]">
        <Chatbot variant="urban" />
      </div>
    </ToastProvider>
  );
}
