import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import DocumentCategoryManager from "../../../components/Admin/documents/DocumentCategoryManager";

// Quản lý danh mục tài liệu (tách khỏi trang Quản lý tài liệu)
export default function AdminDocumentCategoriesPage() {
  return (
    <>
      <AdminPageHeader
        breadcrumb={[{ label: "Tổng quan", to: "/admin/dashboard" }, { label: "Danh mục tài liệu" }]}
        title="Danh mục tài liệu"
        desc="Thêm, đổi tên, ẩn/hiện các danh mục của Thư viện kiến thức."
      />
      <div className="-mt-16 px-4 pb-10 md:px-8">
        <DocumentCategoryManager />
      </div>
    </>
  );
}
