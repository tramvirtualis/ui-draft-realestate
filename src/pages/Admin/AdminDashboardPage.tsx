import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  FileText,
  MessageSquareText,
  RefreshCw,
  Users,
} from "lucide-react";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import { CHART } from "../../components/Admin/dashboard/chartColors";
import ColumnChart from "../../components/Admin/dashboard/ColumnChart";
import DonutChart from "../../components/Admin/dashboard/DonutChart";
import GaugeMeter from "../../components/Admin/dashboard/GaugeMeter";
import OverviewStatCard from "../../components/Admin/dashboard/OverviewStatCard";
import TrendSection from "../../components/Admin/dashboard/TrendSection";
import { adminDashboardService } from "../../services/admin/adminDashboardService";
import type { AdminDashboard } from "../../types/admin/dashboard.types";

type Load =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: AdminDashboard };

const nf = new Intl.NumberFormat("vi-VN");

// Khung một biểu đồ: tiêu đề + mô tả + nội dung
function ChartCard({
  title,
  desc,
  className = "",
  children,
}: {
  title: string;
  desc: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm ${className}`}
    >
      <h2 className="text-lg font-bold text-footer">{title}</h2>
      <p className="text-sm text-body">{desc}</p>
      <div className="mt-5 flex flex-1 flex-col justify-center">{children}</div>
    </section>
  );
}

// Trang Tổng quan quản trị (/admin/dashboard): số người dùng, dự án, sự kiện, bài đăng, tài liệu
export default function AdminDashboardPage() {
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoad({
        status: "ready",
        data: await adminDashboardService.overview(),
      });
    } catch {
      setLoad((cur) => (cur.status === "ready" ? cur : { status: "error" }));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminDashboardService
      .overview()
      .then((data) => !cancelled && setLoad({ status: "ready", data }))
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const data = load.status === "ready" ? load.data : null;
  const updatedAt = data
    ? new Date(data.generatedAt).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <div className="animate-page-in">
      <AdminPageHeader
        breadcrumb={[{ label: "Tổng quan" }]}
        title="Tổng quan"
        desc={
          updatedAt
            ? `Số liệu toàn hệ thống · Cập nhật lúc ${updatedAt}`
            : "Số liệu toàn hệ thống"
        }
        action={
          <button
            onClick={() => void refresh()}
            disabled={refreshing || load.status === "loading"}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />{" "}
            Làm mới
          </button>
        }
      />

      <div className="-mt-16 space-y-5 px-4 pb-10 md:px-8">
        {load.status === "loading" ? (
          <div
            className="animate-pulse space-y-5"
            aria-busy="true"
            aria-label="Đang tải số liệu"
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-48 rounded-2xl bg-primary-50" />
              ))}
            </div>
            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-primary-50" />
              ))}
            </div>
          </div>
        ) : load.status === "error" || !data ? (
          <div
            role="alert"
            className="rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-sm"
          >
            <p className="font-semibold text-heading">
              Không tải được số liệu tổng quan
            </p>
            <button
              onClick={() => {
                setLoad({ status: "loading" });
                void fetchData();
              }}
              className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <OverviewStatCard
                label="Người dùng"
                value={data.users.total}
                icon={Users}
                iconClass="bg-primary-100 text-primary-600"
                detail={`${nf.format(data.users.active)} đang hoạt động`}
                recent={data.users.newLast30Days}
                to="/admin/users"
              />
              <OverviewStatCard
                label="Dự án"
                value={data.projects.total}
                icon={Building2}
                iconClass="bg-primary-100 text-primary-600"
                detail={`${nf.format(
                  data.projects.underConstruction
                )} đang xây dựng`}
                to="/admin/projects"
              />
              <OverviewStatCard
                label="Sự kiện"
                value={data.events.total}
                icon={CalendarDays}
                iconClass="bg-amber-100 text-warning"
                detail={`${nf.format(data.events.active)} đang hoạt động`}
                to="/admin/events"
              />
              <OverviewStatCard
                label="Bài đăng cộng đồng"
                value={data.posts.total}
                icon={MessageSquareText}
                iconClass="bg-success/10 text-success"
                detail={`${nf.format(data.posts.visible)} đang hiển thị`}
                recent={data.posts.newLast30Days}
                to="/admin/posts"
              />
              <OverviewStatCard
                label="Tài liệu dự án"
                value={data.documents.total}
                icon={FileText}
                iconClass="bg-rose-100 text-rose-600"
                detail="Tài liệu đã tải lên"
                recent={data.documents.newLast30Days}
                to="/admin/project-documents"
              />
            </div>

            <TrendSection usersTotal={data.users.total} />

            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              <ChartCard title="Người dùng" desc="Trạng thái tài khoản">
                <DonutChart
                  totalLabel="tài khoản"
                  segments={[
                    {
                      label: "Đang hoạt động",
                      value: data.users.active,
                      color: CHART.aqua,
                    },
                    {
                      label: "Chưa kích hoạt",
                      value: data.users.inactive,
                      color: CHART.yellow,
                    },
                    {
                      label: "Bị khóa",
                      value: data.users.locked,
                      color: CHART.red,
                    },
                  ]}
                />
              </ChartCard>

              <ChartCard
                title="Sự kiện"
                desc={`"Đang hoạt động" gồm sắp diễn ra và đang diễn ra`}
              >
                <DonutChart
                  totalLabel="sự kiện"
                  segments={[
                    {
                      label: "Sắp diễn ra",
                      value: data.events.upcoming,
                      color: CHART.blue,
                    },
                    {
                      label: "Đang diễn ra",
                      value: data.events.ongoing,
                      color: CHART.aqua,
                    },
                    {
                      label: "Đã kết thúc",
                      value: data.events.completed,
                      color: CHART.yellow,
                    },
                    {
                      label: "Đã hủy",
                      value: data.events.cancelled,
                      color: CHART.red,
                    },
                  ]}
                />
              </ChartCard>

              <ChartCard
                title="Tạo mới trong 30 ngày"
                desc="Số bản ghi được tạo trong 30 ngày gần nhất"
                className="lg:col-span-2 2xl:col-span-1"
              >
                <ColumnChart
                  unit="mới"
                  columns={[
                    { label: "Người dùng", value: data.users.newLast30Days },
                    { label: "Bài đăng", value: data.posts.newLast30Days },
                    { label: "Tài liệu", value: data.documents.newLast30Days },
                  ]}
                />
              </ChartCard>

              <ChartCard
                title="Bài đăng cộng đồng"
                desc={`Tỉ lệ đang hiển thị trên bảng tin · ${nf.format(
                  data.posts.privatePosts
                )} bài ở chế độ chỉ mình tôi`}
              >
                <GaugeMeter
                  value={data.posts.visible}
                  total={data.posts.visible + data.posts.hidden}
                  label="đang hiển thị"
                  restLabel="đang ẩn"
                />
              </ChartCard>

              <ChartCard
                title="Quỹ căn"
                desc="Tỉ lệ căn còn trống trên tổng quỹ căn"
              >
                <GaugeMeter
                  value={data.projects.availableProperties}
                  total={data.projects.properties}
                  label="còn trống"
                  restLabel="đã giữ chỗ / bán / thuê"
                />
              </ChartCard>

              <ChartCard
                title="Dự án"
                desc="Phân khu và quỹ căn của tất cả dự án"
              >
                <dl className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Dự án", value: data.projects.total },
                    {
                      label: "Đang xây dựng",
                      value: data.projects.underConstruction,
                    },
                    { label: "Phân khu", value: data.projects.zones },
                    {
                      label: "Căn / sản phẩm",
                      value: data.projects.properties,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl bg-primary-50/60 px-4 py-3.5"
                    >
                      <dt className="text-xs text-body">{s.label}</dt>
                      <dd className="mt-1 text-2xl font-bold text-footer">
                        {nf.format(s.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </ChartCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
