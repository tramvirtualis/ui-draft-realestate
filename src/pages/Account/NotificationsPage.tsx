import Breadcrumb from "../../components/common/Breadcrumb";
import Pagination from "../../components/common/Pagination";
import MarkAllReadButton from "../../components/Notification/MarkAllReadButton";
import NotificationFeed from "../../components/Notification/NotificationFeed";
import NotificationTabs from "../../components/Notification/NotificationTabs";
import useNotifications from "../../hooks/notification/useNotifications";

const TITLE = "Thông báo | NovaLand Hub";

/**
 * Trang "Thông báo" trong khu vực tài khoản (dùng chung giao diện với ngăn kéo ở Header).
 * Dữ liệu lấy từ API /me/notifications.
 */
export default function NotificationsPage() {
  const {
    types,
    tab,
    setTab,
    unreadOf,
    items,
    loading,
    error,
    page,
    totalPages,
    goToPage,
    markRead,
    markAllRead,
  } = useNotifications();

  return (
    <>
      <title>{TITLE}</title>
      <meta name="robots" content="noindex" />

      <Breadcrumb
        items={[{ label: "Tài khoản", to: "/account" }, { label: "Thông báo" }]}
      />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-heading md:text-4xl">
            Thông báo
          </h1>
          <p className="mt-2 text-sm text-body">
            Cập nhật mới nhất về dự án, sự kiện và hoạt động của bạn.
          </p>
        </div>
        <MarkAllReadButton unread={unreadOf("ALL")} onClick={markAllRead} />
      </div>

      <section
        className="mt-5 overflow-hidden rounded-3xl border border-line bg-white shadow-sm"
        aria-label="Danh sách thông báo"
      >
        <NotificationTabs
          types={types}
          value={tab}
          unreadOf={unreadOf}
          onChange={setTab}
        />
        <div className="px-5 pb-6 pt-1">
          <NotificationFeed
            items={items}
            loading={loading}
            error={error}
            hasMore={false}
            onLoadMore={() => undefined}
            onView={markRead}
          />
          {totalPages > 1 && (
            <div className="mt-5 flex justify-center">
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={goToPage}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
