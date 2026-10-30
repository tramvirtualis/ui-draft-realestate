import { FolderOpen, GraduationCap, Map, ImagePlay, BadgePercent, House, LayoutPanelTop, BookOpen, FileCheck } from "lucide-react";

// TODO: thay bằng dữ liệu gọi từ API theo :id (bảng project_documents: title, url, created_at)
export const PROJECT = {
  name: "Aurelia Riverside",
  image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=80",
};

export const CATEGORIES = [
  { icon: FolderOpen, title: "Thông tin dự án", desc: "Hồ sơ tổng quan, câu chuyện thương hiệu và bộ thông tin chuẩn dành cho tư vấn." },
  { icon: GraduationCap, title: "Đào tạo dự án", desc: "Slide đào tạo, kịch bản tư vấn và tài liệu onboarding dành cho đội ngũ kinh doanh." },
  { icon: Map, title: "Tổng mặt bằng", desc: "Quy hoạch tổng thể, sơ đồ phân khu và bản vẽ định vị tiện ích toàn dự án." },
  { icon: ImagePlay, title: "Hình ảnh & video", desc: "Phối cảnh chất lượng cao, flycam, video truyền thông và hình ảnh tiện ích." },
  { icon: BadgePercent, title: "Chính sách bán hàng", desc: "Chính sách hiện hành, tiến độ thanh toán, ưu đãi và hướng dẫn booking." },
  { icon: House, title: "Các mẫu nhà & biệt thự", desc: "Bộ sưu tập căn hộ, duplex, penthouse và biệt thự với thông số chi tiết." },
  { icon: LayoutPanelTop, title: "Layout", desc: "Mặt bằng điển hình, layout từng loại căn và phương án bố trí nội thất tham khảo." },
  { icon: BookOpen, title: "Leaflet & Brochure", desc: "Brochure chính thức, leaflet bán hàng và bộ ấn phẩm truyền thông được phê duyệt." },
  { icon: FileCheck, title: "Pháp lý dự án", desc: "Văn bản pháp lý, giấy phép, thông báo và hồ sơ công bố theo từng giai đoạn." },
];
