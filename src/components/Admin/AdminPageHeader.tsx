import type { ReactNode } from "react";
import Breadcrumb, { type BreadcrumbItem } from "../common/Breadcrumb";

type Props = {
  breadcrumb: BreadcrumbItem[];
  title: string;
  titleExtra?: ReactNode; // ví dụ badge trạng thái cạnh tiêu đề
  desc?: string;
  action?: ReactNode;
  children?: ReactNode; // nội dung phụ dưới tiêu đề (ví dụ banner cảnh báo)
  soft?: boolean; // kiểu nhẹ: không chừa khoảng dưới cho thẻ nội dung đè lên
};

// Phần đầu trang quản trị (cùng kiểu trang web): nền kem, breadcrumb, tiêu đề serif, nút hành động.
// Kiểu thường chừa khoảng dưới (pb-24) để thẻ nội dung bên dưới đè lên
export default function AdminPageHeader({ breadcrumb, title, titleExtra, desc, action, children, soft = false }: Props) {
  return (
    <div className={`bg-page-glow px-4 pt-6 md:px-8 ${soft ? "pb-6" : "pb-24"}`}>
      <Breadcrumb items={breadcrumb} />
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="heading-display flex flex-wrap items-center gap-3 text-3xl text-heading md:text-4xl">
            {title} {titleExtra}
          </h1>
          {desc && <p className="mt-2 text-sm text-body">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
