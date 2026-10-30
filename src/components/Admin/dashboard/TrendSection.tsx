import { useState } from "react";
import { useDashboardTrend } from "../../../hooks/admin/useDashboardTrend";
import { CHART } from "./chartColors";
import LineChart from "./LineChart";

const nf = new Intl.NumberFormat("vi-VN");
const RANGES = [6, 12] as const;

type Props = { usersTotal: number };

// Xu hướng theo tháng: người dùng & bài đăng mới (2 đường) + tổng người dùng tích lũy (vùng)
export default function TrendSection({ usersTotal }: Props) {
  const [months, setMonths] = useState<(typeof RANGES)[number]>(6);
  const { points, loading, error } = useDashboardTrend(months);

  const labels = points.map((p) => p.label);
  const newUsers = points.map((p) => p.users);
  const newPosts = points.map((p) => p.posts);
  // Tổng cuối mỗi tháng = tổng hiện tại − số tạo ở các tháng sau đó
  const cumulative = newUsers.map(
    (_, i) => usersTotal - newUsers.slice(i + 1).reduce((s, v) => s + v, 0)
  );
  const sumUsers = newUsers.reduce((s, v) => s + v, 0);
  const sumPosts = newPosts.reduce((s, v) => s + v, 0);

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-footer">Xu hướng theo tháng</h2>
          <p className="text-sm text-body">
            Người dùng và bài đăng cộng đồng được tạo mới mỗi tháng
          </p>
        </div>
        {/* Bộ lọc khoảng thời gian: một hàng, áp cho cả hai biểu đồ */}
        <div
          className="inline-flex rounded-xl bg-slate-100 p-1 text-sm"
          role="group"
          aria-label="Khoảng thời gian"
        >
          {RANGES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMonths(m)}
              aria-pressed={months === m}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                months === m
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-body hover:text-heading"
              }`}
            >
              {m} tháng
            </button>
          ))}
        </div>
      </div>

      {error && points.length === 0 ? (
        <p role="alert" className="py-16 text-center text-sm text-body">
          Không tải được số liệu theo tháng.
        </p>
      ) : points.length === 0 ? (
        <div className="mt-5 grid animate-pulse gap-5 xl:grid-cols-[1.4fr_1fr]">
          <div className="h-72 rounded-xl bg-primary-50" />
          <div className="h-72 rounded-xl bg-primary-50" />
        </div>
      ) : (
        // Đang tải lại khi đổi khoảng: giữ biểu đồ cũ, chỉ làm mờ (không nháy khung trống)
        <div
          className={`mt-5 grid gap-6 transition-opacity xl:grid-cols-[1.4fr_1fr] ${
            loading ? "opacity-50" : ""
          }`}
        >
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-6">
              <p>
                <span className="block text-xs text-body">Người dùng mới</span>
                <span className="text-2xl font-bold text-footer">
                  {nf.format(sumUsers)}
                </span>
              </p>
              <p>
                <span className="block text-xs text-body">Bài đăng mới</span>
                <span className="text-2xl font-bold text-footer">
                  {nf.format(sumPosts)}
                </span>
              </p>
            </div>
            <LineChart
              labels={labels}
              series={[
                { name: "Người dùng mới", color: CHART.blue, values: newUsers },
                { name: "Bài đăng mới", color: CHART.orange, values: newPosts },
              ]}
            />
          </div>

          <div className="min-w-0 xl:border-l xl:border-line xl:pl-6">
            <div className="mb-3">
              <span className="block text-xs text-body">
                Tổng người dùng (cuối mỗi tháng)
              </span>
              <span className="text-2xl font-bold text-footer">
                {nf.format(usersTotal)}
              </span>
            </div>
            <LineChart
              area
              labels={labels}
              series={[
                {
                  name: "Tổng người dùng",
                  color: CHART.primary,
                  values: cumulative,
                },
              ]}
            />
          </div>
        </div>
      )}
    </section>
  );
}
