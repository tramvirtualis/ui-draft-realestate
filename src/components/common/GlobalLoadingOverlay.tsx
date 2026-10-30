import { useEffect, useState, useSyncExternalStore } from "react";
import LoadingOverlay from "./LoadingOverlay";
import { getPendingCount, subscribePending } from "../../api/core/pendingRequests";

// Request xong nhanh hơn mốc này thì không hiện, tránh màn hình nháy
const SHOW_DELAY_MS = 250;

// Tự hiện LoadingOverlay khi có request tạo/sửa/ẩn/xoá (POST/PUT/PATCH/DELETE) đang chạy
export default function GlobalLoadingOverlay({ message = "Đang xử lý" }: { message?: string }) {
  const busy = useSyncExternalStore(subscribePending, () => getPendingCount() > 0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!busy) return;
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => {
      clearTimeout(timer);
      setVisible(false);
    };
  }, [busy]);

  return <LoadingOverlay open={busy && visible} message={message} />;
}
