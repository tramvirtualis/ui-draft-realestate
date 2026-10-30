/**
 Trang quản trị nào cần quyền gì — nơi DUY NHẤT khai báo, AdminRoute và AdminSidebar cùng dùng.
 Khớp SecurityConfig bên BE: vào trang (GET) cần quyền XXX_VIEW.
 Trang không có trong bảng (Tổng quan, Dự án, Phân quyền...) chỉ SUPER_ADMIN vào được.
 Chỉ là lớp ẩn/hiện giao diện, BE vẫn chặn ở từng API.
 */
const PAGE_PERMISSIONS: Array<[prefix: string, permission: string]> = [
  ["/admin/users", "USER_VIEW"],
  ["/admin/posts", "POST_VIEW"],
  ["/admin/social-ads", "POST_VIEW"],
  ["/admin/post-backgrounds", "POST_VIEW"],
  ["/admin/news", "NEWS_VIEW"],
  ["/admin/documents", "DOCUMENT_VIEW"],
  ["/admin/document-categories", "DOCUMENT_VIEW"],
  ["/admin/jobs", "JOB_VIEW"],
  ["/admin/job-types", "JOB_VIEW"],
  ["/admin/applications", "JOB_VIEW"],
  ["/admin/cv-templates", "JOB_VIEW"],
  ["/admin/companies", "COMPANY_VIEW"],
  ["/admin/events", "EVENT_VIEW"],
  ["/admin/notifications", "NOTIFICATION_VIEW"],
  ["/admin/notification-types", "NOTIFICATION_VIEW"],
  // Quản trị dự án: admin dự án chỉ thấy dự án được giao (BE lọc / chặn theo dự án)
  ...[
    "/admin/projects",
    "/admin/properties",
    "/admin/bookings",
    "/admin/project-staff",
    "/admin/project-images",
    "/admin/project-floor-plan",
    "/admin/project-buildings",
    "/admin/project-sales-sheets",
    "/admin/project-amenities",
    "/admin/project-videos",
    "/admin/project-location",
    "/admin/project-tours",
    "/admin/project-questions",
    "/admin/project-policies",
    "/admin/project-progress",
    "/admin/project-documents",
  ].map((prefix): [string, string] => [prefix, "PROJECT_VIEW"]),
  ["/admin/chatbot", "RAG_VIEW"],
];
const LANDING_PAGES = [
  "/admin/projects",
  "/admin/news",
  "/admin/documents",
  "/admin/events",
  "/admin/posts",
  "/admin/jobs",
  "/admin/companies",
  "/admin/users",
  "/admin/notifications",
];

// "/admin/news/5/edit" khớp "/admin/news"; "/admin/news-x" thì không
const matches = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(prefix + "/");

export function canAccessAdminPath(
  pathname: string,
  permissions: string[],
  isSuperAdmin: boolean
): boolean {
  if (isSuperAdmin) return true;
  const rule = PAGE_PERMISSIONS.find(([prefix]) => matches(pathname, prefix));
  return !!rule && permissions.includes(rule[1]);
}

// Trang admin đầu tiên user được vào (sau đăng nhập / khi mở trang không có quyền); null = không vào được trang nào
export function firstAdminPath(
  permissions: string[],
  isSuperAdmin: boolean
): string | null {
  if (isSuperAdmin) return "/admin/dashboard";
  return (
    LANDING_PAGES.find((p) => canAccessAdminPath(p, permissions, false)) ?? null
  );
}
