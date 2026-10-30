import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

const pad = (n: number) => String(n).padStart(2, "0");

// Đồng hồ đếm ngược hạn giữ chỗ (theo giờ backend trả về); hết giờ thì báo đang chờ hệ thống mở lại căn
export default function HoldCountdown({ until, onElapsed }: { until: string; onElapsed?: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  const end = new Date(until).getTime();
  const left = Math.max(0, Math.floor((end - now) / 1000));

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (left === 0) onElapsed?.();
    // chỉ báo một lần khi vừa hết giờ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left === 0]);

  if (left === 0) return <span className="text-xs text-muted">Đã hết thời hạn giữ chỗ</span>;
  const h = Math.floor(left / 3600);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold tabular-nums text-warning">
      <Timer size={13} aria-hidden /> Còn {h > 0 ? `${h}:` : ""}{pad(Math.floor((left % 3600) / 60))}:{pad(left % 60)}
    </span>
  );
}
