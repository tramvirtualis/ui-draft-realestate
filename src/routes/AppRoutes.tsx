import { Routes, Route, Navigate } from "react-router-dom";
import ProjectsPage from "../pages/Project/List/ProjectsPage";
import ProjectDetailPage from "../pages/Project/Detail/ProjectDetailPage";
import ProjectLocationPage from "../pages/Project/Detail/ProjectLocationPage";
import ProjectZonesPage from "../pages/Project/Detail/ProjectZonesPage";
import ProjectFloorPlanPage from "../pages/Project/Detail/ProjectFloorPlanPage";
import ProjectInventoryPage from "../pages/Project/Detail/ProjectInventoryPage";
import ProjectComparePage from "../pages/Project/Detail/ProjectComparePage";
import ProjectPolicyPage from "../pages/Project/Detail/ProjectPolicyPage";
import ProjectProgressPage from "../pages/Project/Detail/ProjectProgressPage";
import ProjectDocumentsPage from "../pages/Project/Detail/ProjectDocumentsPage";
import ProjectNewsPage from "../pages/Project/Detail/ProjectNewsPage";
import ProjectTourPage from "../pages/Project/Detail/ProjectTourPage";
import ProjectSalesSheetsPage from "../pages/Project/Detail/ProjectSalesSheetsPage";
import ProjectBuildingsPage from "../pages/Project/Detail/ProjectBuildingsPage";
import EventsPage from "../pages/Event/EventsPage";
import KnowledgePage from "../pages/Knowledge/KnowledgePage";
import KnowledgeDetailPage from "../pages/Knowledge/KnowledgeDetailPage";
import KnowledgeCategoriesPage from "../pages/Knowledge/KnowledgeCategoriesPage";
import KnowledgeCategoryPage from "../pages/Knowledge/KnowledgeCategoryPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import MyBookingsPage from "../pages/Account/MyBookingsPage";
import FavoritesPage from "../pages/Account/FavoritesPage";
import ProfilePage from "../pages/Account/ProfilePage";
import ApplicationHistoryPage from "../pages/Account/ApplicationHistoryPage";
import NotificationsPage from "../pages/Account/NotificationsPage";
import SavedJobsPage from "../pages/Account/SavedJobsPage";
import MyCvsPage from "../pages/Account/MyCvsPage";
import RecruitmentPage from "../pages/Recruitment/RecruitmentPage";
import CvBuilderPage from "../pages/CvBuilder/CvBuilderPage";
import JobDetailPage from "../pages/JobDetail/JobDetailPage";
import UserLayout from "../layouts/UserLayout";
import AuthLayout from "../layouts/AuthLayout";
import EventDetailPage from "../pages/Event/EventDetailPage";
import AccountLayout from "../layouts/AccountLayout";
import NewsPage from "../pages/News/NewsPage";
import NewsDetailPage from "../pages/News/NewsDetailPage";
import SocialPage from "../pages/Social/SocialPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AdminLayout from "../layouts/AdminLayout";
import AdminProjectsPage from "../pages/Admin/Project/AdminProjectsPage";
import AdminDashboardPage from "../pages/Admin/AdminDashboardPage";
import AdminUsersPage from "../pages/Admin/User/AdminUsersPage";
import AdminUserFormPage from "../pages/Admin/User/AdminUserFormPage";
import AdminRolesPage from "../pages/Admin/User/AdminRolesPage";
import AdminProjectDetailPage from "../pages/Admin/Project/AdminProjectDetailPage";
import AdminProjectFormPage from "../pages/Admin/Project/AdminProjectFormPage";
import ProjectImagesPage from "../pages/Admin/Project/ProjectImagesPage";
import AmenitiesManagementPage from "../pages/Admin/Project/AmenitiesManagementPage";
import BookingsManagementPage from "../pages/Admin/Project/BookingsManagementPage";
import FloorPlanManagementPage from "../pages/Admin/Project/FloorPlanManagementPage";
import BuildingsManagementPage from "../pages/Admin/Project/BuildingsManagementPage";
import SalesSheetsManagementPage from "../pages/Admin/Project/SalesSheetsManagementPage";
import VideosManagementPage from "../pages/Admin/Project/VideosManagementPage";
import ToursManagementPage from "../pages/Admin/Project/ToursManagementPage";
import LocationManagementPage from "../pages/Admin/Project/LocationManagementPage";
import StaffManagementPage from "../pages/Admin/Project/StaffManagementPage";
import QuestionsManagementPage from "../pages/Admin/Project/QuestionsManagementPage";
import ProjectPoliciesPage from "../pages/Admin/Project/ProjectPoliciesPage";
import ProgressManagementPage from "../pages/Admin/Project/ProgressManagementPage";
import ProjectDocumentsManagementPage from "../pages/Admin/Project/ProjectDocumentsManagementPage";
import PropertyProjectsPage from "../pages/Admin/Project/PropertyProjectsPage";
import PropertyManagementPage from "../pages/Admin/Project/PropertyManagementPage";
import AdminNewsPage from "../pages/Admin/AdminNewsPage";
import AdminNewsFormPage from "../pages/Admin/AdminNewsFormPage";
import AdminDocumentsPage from "../pages/Admin/Document/AdminDocumentsPage";
import AdminDocumentFormPage from "../pages/Admin/Document/AdminDocumentFormPage";
import AdminDocumentCategoriesPage from "../pages/Admin/Document/AdminDocumentCategoriesPage";
import AdminEventsPage from "../pages/Admin/AdminEventsPage";
import AdminEventFormPage from "../pages/Admin/AdminEventFormPage";
import AdminJobsPage from "../pages/Admin/AdminJobsPage";
import AdminJobFormPage from "../pages/Admin/AdminJobFormPage";
import AdminJobTypesPage from "../pages/Admin/AdminJobTypesPage";
import AdminApplicationsPage from "../pages/Admin/AdminApplicationsPage";
import AdminPostsPage from "../pages/Admin/Social/AdminPostsPage";
import AdminPostFormPage from "../pages/Admin/Social/AdminPostFormPage";
import AdminSocialAdsPage from "../pages/Admin/Social/AdminSocialAdsPage";
import AdminPostBackgroundsPage from "../pages/Admin/Social/AdminPostBackgroundsPage";
import AdminNotificationsPage from "../pages/Admin/AdminNotificationsPage";
import AdminNotificationTypesPage from "../pages/Admin/AdminNotificationTypesPage";
import AdminPlaceholderPage from "../pages/Admin/AdminPlaceholderPage";
import AdminChatbotPage from "../pages/Admin/AdminChatbotPage";
import AdminCvTemplatesPage from "../pages/Admin/AdminCvTemplatesPage";
import AdminCvTemplateFormPage from "../pages/Admin/AdminCvTemplateFormPage";
import AdminCompaniesPage from "../pages/Admin/AdminCompaniesPage";
import AdminCompanyDetailPage from "../pages/Admin/AdminCompanyDetailPage";
import AdminAuditLogsPage from "../pages/Admin/AdminAuditLogsPage";
import EmployerPage from "../pages/Account/EmployerPage";
import EmployerLayout from "../layouts/EmployerLayout";
import EmployerJobsPage from "../pages/Employer/EmployerJobsPage";
import EmployerJobFormPage from "../pages/Employer/EmployerJobFormPage";
import EmployerApplicationsPage from "../pages/Employer/EmployerApplicationsPage";
import ToastProvider from "../components/common/Toast";
import NotificationRealtime from "../components/Notification/NotificationRealtime";
import GlobalLoadingOverlay from "../components/common/GlobalLoadingOverlay";
import HomePage from "../pages/Home/HomePage";
import HomeDraftPage from "../pages/HomeDraft/HomeDraftPage";
import SoftDraftPage from "../pages/HomeDraft/SoftDraftPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Trang chủ (src/pages/Home): chuyển động theo cuộn bằng GSAP ScrollTrigger + Lenis, có header / footer riêng.
          Tự bọc Toast + thông báo realtime + vòng loading vì không nằm trong UserLayout. */}
      <Route
        path="/"
        element={
          <ToastProvider>
            <NotificationRealtime />
            <GlobalLoadingOverlay />
            <HomePage />
          </ToastProvider>
        }
      />
      {/* Trang chủ nháp (giao diện home-draft-3): đứng riêng, không đụng trang chủ thật */}
      <Route path="/home-draft-3" element={<HomeDraftPage />} />
      {/* Trang chủ nháp phong cách mềm (serif, thẻ kính bo tròn) */}
      <Route path="/home-draft-4" element={<SoftDraftPage />} />

      {/* Chung một khung: đổi trang chỉ lật thẻ, nền + khu 3D giữ nguyên */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      <Route element={<UserLayout />}>
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route
          path="/projects/:id/location"
          element={<ProjectLocationPage />}
        />
        <Route path="/projects/:id/zones" element={<ProjectZonesPage />} />
        <Route
          path="/projects/:id/buildings"
          element={<ProjectBuildingsPage />}
        />
        <Route
          path="/projects/:id/floor-plans"
          element={<ProjectFloorPlanPage />}
        />
        <Route
          path="/projects/:id/sales-sheets"
          element={<ProjectSalesSheetsPage />}
        />
        <Route
          path="/projects/:id/sales-sheet"
          element={<ProjectSalesSheetsPage />}
        />
        <Route
          path="/projects/:id/inventory"
          element={<ProjectInventoryPage />}
        />
        <Route path="/projects/:id/compare" element={<ProjectComparePage />} />
        <Route path="/projects/:id/tour-360" element={<ProjectTourPage />} />
        <Route path="/projects/:id/policy" element={<ProjectPolicyPage />} />
        <Route
          path="/projects/:id/progress"
          element={<ProjectProgressPage />}
        />
        <Route
          path="/projects/:id/documents"
          element={<ProjectDocumentsPage />}
        />
        <Route path="/projects/:id/news" element={<ProjectNewsPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route
          path="/knowledge/danh-muc"
          element={<KnowledgeCategoriesPage />}
        />
        <Route
          path="/knowledge/danh-muc/:slug"
          element={<KnowledgeCategoryPage />}
        />
        <Route path="/knowledge/:slug" element={<KnowledgeDetailPage />} />
        <Route path="/jobs" element={<RecruitmentPage />} />
        <Route path="/jobs/create-cv" element={<CvBuilderPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        {/* Khách xem được bảng tin; đăng bài / thích / bình luận mới cần đăng nhập */}
        <Route path="/social" element={<SocialPage />} />
        {/* Các trang cần đăng nhập: chưa đăng nhập → về /login */}
        <Route element={<ProtectedRoute />}>
          {/* Trang tài khoản: nằm trong UserLayout để có Header/Footer, AccountLayout thêm sidebar */}
          <Route element={<AccountLayout />}>
            <Route path="/account" element={<ProfilePage />} />
            <Route path="/account/bookings" element={<MyBookingsPage />} />
            <Route path="/account/favorites" element={<FavoritesPage />} />
            <Route path="/applications" element={<ApplicationHistoryPage />} />
            <Route path="/account/saved-jobs" element={<SavedJobsPage />} />
            <Route path="/account/cvs" element={<MyCvsPage />} />
            <Route path="/account/employer" element={<EmployerPage />} />
            <Route
              path="/account/notifications"
              element={<NotificationsPage />}
            />
          </Route>
          {/* Khu nhà tuyển dụng: EmployerLayout tự chặn nếu công ty chưa được duyệt */}
          <Route path="/employer" element={<EmployerLayout />}>
            <Route index element={<Navigate to="jobs" replace />} />
            <Route path="jobs" element={<EmployerJobsPage />} />
            <Route path="jobs/new" element={<EmployerJobFormPage />} />
            <Route path="jobs/:id/edit" element={<EmployerJobFormPage />} />
            <Route path="applications" element={<EmployerApplicationsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Khu quản trị: SUPER_ADMIN hoặc role có quyền; từng trang cần quyền gì xem config/adminAccess */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:id/edit" element={<AdminUserFormPage />} />
          <Route path="roles" element={<AdminRolesPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          <Route path="posts" element={<AdminPostsPage />} />
          <Route path="posts/new" element={<AdminPostFormPage />} />
          <Route path="posts/:id/edit" element={<AdminPostFormPage />} />
          <Route path="social-ads" element={<AdminSocialAdsPage />} />
          <Route
            path="post-backgrounds"
            element={<AdminPostBackgroundsPage />}
          />
          <Route path="news" element={<AdminNewsPage />} />
          <Route path="news/new" element={<AdminNewsFormPage />} />
          <Route path="news/:id/edit" element={<AdminNewsFormPage />} />
          <Route path="documents" element={<AdminDocumentsPage />} />
          <Route path="documents/new" element={<AdminDocumentFormPage />} />
          <Route
            path="documents/:id/edit"
            element={<AdminDocumentFormPage />}
          />
          <Route
            path="document-categories"
            element={<AdminDocumentCategoriesPage />}
          />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="events/new" element={<AdminEventFormPage />} />
          <Route path="events/:id/edit" element={<AdminEventFormPage />} />
          <Route path="jobs" element={<AdminJobsPage />} />
          <Route path="jobs/new" element={<AdminJobFormPage />} />
          <Route path="jobs/:id/edit" element={<AdminJobFormPage />} />
          <Route path="job-types" element={<AdminJobTypesPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route
            path="notification-types"
            element={<AdminNotificationTypesPage />}
          />
          <Route path="cv-templates" element={<AdminCvTemplatesPage />} />
          <Route path="chatbot" element={<AdminChatbotPage />} />
          <Route
            path="cv-templates/new"
            element={<AdminCvTemplateFormPage />}
          />
          <Route
            path="cv-templates/:id/edit"
            element={<AdminCvTemplateFormPage />}
          />
          <Route path="companies" element={<AdminCompaniesPage />} />
          <Route path="companies/:id" element={<AdminCompanyDetailPage />} />
          <Route path="projects" element={<AdminProjectsPage />} />
          <Route path="projects/new" element={<AdminProjectFormPage />} />
          <Route path="projects/:id" element={<AdminProjectDetailPage />} />
          <Route path="projects/:id/edit" element={<AdminProjectFormPage />} />
          <Route path="project-images" element={<ProjectImagesPage />} />

          <Route
            path="project-floor-plan"
            element={<FloorPlanManagementPage />}
          />
          <Route
            path="project-buildings"
            element={<BuildingsManagementPage />}
          />
          <Route
            path="project-sales-sheets"
            element={<SalesSheetsManagementPage />}
          />
          <Route path="bookings" element={<BookingsManagementPage />} />
          <Route
            path="project-amenities"
            element={<AmenitiesManagementPage />}
          />
          <Route path="project-videos" element={<VideosManagementPage />} />
          <Route path="project-tours" element={<ToursManagementPage />} />
          <Route path="project-location" element={<LocationManagementPage />} />
          <Route path="project-staff" element={<StaffManagementPage />} />
          <Route
            path="project-questions"
            element={<QuestionsManagementPage />}
          />
          <Route path="project-policies" element={<ProjectPoliciesPage />} />

          <Route path="project-progress" element={<ProgressManagementPage />} />
          <Route
            path="project-documents"
            element={<ProjectDocumentsManagementPage />}
          />
          <Route path="properties" element={<PropertyProjectsPage />} />
          <Route path="properties/:id" element={<PropertyManagementPage />} />
          <Route path="*" element={<AdminPlaceholderPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
