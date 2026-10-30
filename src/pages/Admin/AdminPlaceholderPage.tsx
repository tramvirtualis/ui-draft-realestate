import { Link } from "react-router-dom";
import { Construction } from "lucide-react";

// Các mục menu quản trị chưa làm: hiển thị trang tạm thay vì 404
export default function AdminPlaceholderPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Construction size={28} />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-heading">Trang đang được phát triển</h1>
      <p className="mt-2 max-w-sm text-sm text-body">Chức năng này sẽ sớm có trong hệ thống quản trị.</p>
      <Link to="/admin/projects" className="mt-6 rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">
        Về Quản lý dự án
      </Link>
    </div>
  );
}
