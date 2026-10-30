import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { enablePush, getPushStatus, type PushStatus } from "../../services/notification/pushService";

/**
 * Nút bật FCM push trong ngăn kéo Thông báo.
 * Ẩn khi đã bật / trình duyệt không hỗ trợ; đã chặn thì hướng dẫn mở lại quyền.
 * Không tự hỏi quyền khi vào trang: trình duyệt dễ chặn và người dùng hay bấm từ chối.
 */
export default function PushToggle() {
  const [status, setStatus] = useState<PushStatus | "loading">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let ignore = false;
    getPushStatus().then((s) => !ignore && setStatus(s));
    return () => {
      ignore = true;
    };
  }, []);

  if (status === "loading" || status === "unsupported" || status === "granted") return null;

  if (status === "denied") {
    return (
      <p className="mx-5 mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
        Bạn đã chặn thông báo của trang này. Bấm biểu tượng ổ khóa trên thanh địa chỉ → Thông báo → Cho phép.
      </p>
    );
  }

  const enable = async () => {
    setBusy(true);
    try {
      setStatus(await enablePush(true));
    } catch {
      setStatus("default");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={enable}
      disabled={busy}
      className="mx-5 mt-3 flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-2.5 text-left text-sm font-semibold text-primary-700 transition hover:bg-primary-100 disabled:opacity-60"
    >
      <BellRing size={16} className="shrink-0" />
      {busy ? "Đang bật thông báo..." : "Bật thông báo trên trình duyệt (nhận cả khi đã đóng web)"}
    </button>
  );
}
