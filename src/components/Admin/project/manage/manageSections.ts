import {
  Building,
  Building2,
  Compass,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Home,
  Images,
  Map as MapIcon,
  MapPin,
  Percent,
  Sparkles,
  TrendingUp,
  UserCog,
  Video,
  type LucideIcon,
} from "lucide-react";

export type ManageSection = {
  key: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  // Đường dẫn của mục; nhận id dự án đang chọn
  to: (projectId: number) => string;
  // Trang nhận dự án qua ?project= (các trang quản lý theo bộ chọn dự án)
  match: string;
  // Mục chỉ có ở một loại hình xây dựng; không ghi = mọi dự án đều có
  only?: "high-rise" | "low-rise";
};

const byQuery = (base: string) => (id: number) => `${base}?project=${id}`;

// Các mục quản lý nội dung của một dự án, dùng chung cho thanh tab và trang chi tiết dự án
export const MANAGE_SECTIONS: ManageSection[] = [
  {
    key: "info",
    label: "Thông tin",
    desc: "Hồ sơ, loại hình xây dựng",
    icon: Building2,
    to: (id) => `/admin/projects/${id}`,
    match: "/admin/projects/",
  },
  {
    key: "staff",
    label: "Nhân sự",
    desc: "Admin và giám đốc dự án",
    icon: UserCog,
    to: byQuery("/admin/project-staff"),
    match: "/admin/project-staff",
  },
  {
    key: "location",
    label: "Vị trí",
    desc: "Bản đồ, điểm thuận lợi, bài viết",
    icon: MapPin,
    to: byQuery("/admin/project-location"),
    match: "/admin/project-location",
  },
  {
    key: "images",
    label: "Ảnh dự án",
    desc: "Thư viện hình ảnh",
    icon: Images,
    to: byQuery("/admin/project-images"),
    match: "/admin/project-images",
  },
  {
    key: "buildings",
    label: "Tòa nhà",
    desc: "Các tòa theo phân khu",
    icon: Building,
    to: byQuery("/admin/project-buildings"),
    match: "/admin/project-buildings",
    only: "high-rise",
  },
  {
    key: "sales-sheets",
    label: "Bảng hàng",
    desc: "Bảng hàng PDF theo tòa",
    icon: FileSpreadsheet,
    to: byQuery("/admin/project-sales-sheets"),
    match: "/admin/project-sales-sheets",
    only: "high-rise",
  },
  {
    key: "properties",
    label: "Quỹ căn",
    desc: "Danh sách căn của dự án",
    icon: Home,
    to: (id) => `/admin/properties/${id}`,
    match: "/admin/properties",
  },
  {
    key: "floorplan",
    label: "Mặt bằng",
    desc: "Ảnh mặt bằng, vị trí căn / tòa",
    icon: MapIcon,
    to: byQuery("/admin/project-floor-plan"),
    match: "/admin/project-floor-plan",
  },
  {
    key: "amenities",
    label: "Tiện ích",
    desc: "Tiện ích nội khu",
    icon: Sparkles,
    to: byQuery("/admin/project-amenities"),
    match: "/admin/project-amenities",
  },
  {
    key: "tours",
    label: "Tour 360°",
    desc: "Tham quan ảnh 360°",
    icon: Compass,
    to: byQuery("/admin/project-tours"),
    match: "/admin/project-tours",
  },
  {
    key: "videos",
    label: "Video",
    desc: "Video giới thiệu",
    icon: Video,
    to: byQuery("/admin/project-videos"),
    match: "/admin/project-videos",
  },
  {
    key: "policies",
    label: "Chính sách",
    desc: "Ảnh chính sách bán hàng",
    icon: Percent,
    to: byQuery("/admin/project-policies"),
    match: "/admin/project-policies",
  },
  {
    key: "progress",
    label: "Tiến độ",
    desc: "Báo cáo tiến độ xây dựng",
    icon: TrendingUp,
    to: byQuery("/admin/project-progress"),
    match: "/admin/project-progress",
  },
  {
    key: "documents",
    label: "Tài liệu",
    desc: "Tài liệu, brochure",
    icon: FileText,
    to: byQuery("/admin/project-documents"),
    match: "/admin/project-documents",
  },
  {
    key: "questions",
    label: "Hỏi đáp",
    desc: "Câu hỏi thường gặp",
    icon: HelpCircle,
    to: byQuery("/admin/project-questions"),
    match: "/admin/project-questions",
  },
];

// Các mục của một dự án theo loại hình xây dựng: chỉ dự án cao tầng có Tòa nhà + Bảng hàng
export const sectionsFor = (highRise: boolean) =>
  MANAGE_SECTIONS.filter(
    (s) => !s.only || s.only === (highRise ? "high-rise" : "low-rise")
  );
