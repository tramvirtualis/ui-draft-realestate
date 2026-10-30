import { useEffect, useState } from "react";
import { adminUserService } from "../../services/user/adminUserService";
import { adminPostService } from "../../services/social/adminPostService";

export interface MonthPoint {
  label: string; // "T5/26"
  users: number; // người dùng tạo trong tháng
  posts: number; // bài đăng tạo trong tháng
}

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// `months` tháng gần nhất (tính cả tháng này), cũ → mới
function lastMonths(months: number) {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const first = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
    return {
      from: ymd(first),
      to: ymd(last),
      label: `T${first.getMonth() + 1}/${String(first.getFullYear()).slice(2)}`,
    };
  });
}

/**
 Số người dùng / bài đăng mới theo từng tháng.
 BE chưa có API thống kê theo thời gian → mỗi tháng gọi danh sách lọc from–to với size 1 rồi đọc totalElements (số chính xác).
 */
export function useDashboardTrend(months: number) {
  const [points, setPoints] = useState<MonthPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    const count = (p: Promise<{ totalElements: number }>) => p.then((r) => r.totalElements);
    Promise.all(
      lastMonths(months).map(async ({ from, to, label }) => {
        const [users, posts] = await Promise.all([
          count(adminUserService.search({ from, to, page: 0, size: 1 })),
          count(adminPostService.search({ from, to, page: 0, size: 1 })),
        ]);
        return { label, users, posts };
      }),
    )
      .then((res) => !cancelled && setPoints(res))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [months]);

  return { points, loading, error };
}
