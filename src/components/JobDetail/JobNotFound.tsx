import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

/** Hiển thị khi không có tin tuyển dụng tương ứng với đường dẫn */
export default function JobNotFound() {
  return (
    <div
      role="status"
      className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-dashed border-line bg-white px-6 py-20 text-center"
    >
      <SearchX size={44} className="text-primary-300" aria-hidden />
      <h1 className="mt-5 text-xl font-medium text-heading">Không tìm thấy việc làm</h1>
      <p className="mt-2 text-sm text-body">Tin tuyển dụng này không tồn tại hoặc đã bị gỡ.</p>
      <Link
        to="/jobs"
        className="mt-6 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-5 py-2.5 text-sm font-medium text-white"
      >
        Xem việc làm khác
      </Link>
    </div>
  );
}
