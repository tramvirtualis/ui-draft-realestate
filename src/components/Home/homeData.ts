// Nội dung tĩnh của trang chủ (chưa nối API)
const img = (id: string, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// Video mẫu (Pexels #38675652, giấy phép Pexels: dùng thương mại miễn phí) — thay bằng video giới thiệu thật của dự án / công ty khi có
export const HERO_VIDEO = "https://videos.pexels.com/video-files/38675652/16428540_1920_1080_30fps.mp4";

// Ảnh chờ của video hero: ảnh xem trước của chính video biệt thự (hiện trong lúc video đang tải)
export const HERO_IMAGE =
  "https://images.pexels.com/videos/38675652/architecture-blue-sky-contemporary-architecture-elegant-home-38675652.jpeg?auto=compress&cs=tinysrgb&w=1920";

// Các mảng tính năng chính của nền tảng; path: trang thật tương ứng
export type HomeService = { no: string; title: string; desc: string; path: string };

export const SERVICES: HomeService[] = [
  { no: "01", title: "Bất động sản", desc: "Mua bán, dự án mới, bảng hàng thời gian thực, tour 360° và giữ chỗ trực tuyến — tất cả trên một bản đồ.", path: "/projects" },
  { no: "02", title: "Tuyển dụng", desc: "Việc làm ngành bất động sản, ứng tuyển nhanh, kết nối trực tiếp nhà tuyển dụng.", path: "/jobs" },
  { no: "03", title: "Tạo CV trực tuyến", desc: "Mẫu CV chuyên nghiệp, chỉnh sửa trực quan, xuất PDF trong vài phút.", path: "/jobs/create-cv" },
  { no: "04", title: "Kiến thức & tài liệu", desc: "Kho tài liệu pháp lý, cẩm nang mua nhà và kiến thức đầu tư được cập nhật.", path: "/knowledge" },
  { no: "05", title: "Cộng đồng", desc: "Chia sẻ kinh nghiệm, hỏi đáp và kết nối với môi giới, nhà đầu tư.", path: "/social" },
  { no: "06", title: "Tin tức & sự kiện", desc: "Thị trường mỗi ngày, lễ mở bán và sự kiện dự án — không bỏ lỡ cơ hội nào.", path: "/news" },
];

export type HomeProject = {
  code: string;
  name: string;
  tagline: string[]; // từng dòng của khẩu hiệu
  desc: string;
  category: string;
  location: string;
  image: string;
  thumb: string;
};

export const PROJECTS: HomeProject[] = [
  {
    code: "01",
    name: "LUMEN",
    tagline: ["Tương lai", "thức dậy bên", "dòng sông Sài Gòn"],
    desc: "Tổ hợp căn hộ hạng sang ven sông, nơi kiến trúc kính và ánh sáng hòa vào nhịp sống đô thị.",
    category: "Cao tầng · Căn hộ hạng sang",
    location: "Thủ Thiêm, TP.HCM",
    image: img("photo-1545324418-cc1a3fa10c00"),
    thumb: img("photo-1600607687939-ce8a6c25118c", 600),
  },
  {
    code: "02",
    name: "AURELIA",
    tagline: ["Biệt thự", "giữa lòng", "phân khu xanh"],
    desc: "Quần thể biệt thự thấp tầng với hồ cảnh quan, đường dạo bộ và tiện ích nghỉ dưỡng khép kín.",
    category: "Thấp tầng · Biệt thự",
    location: "Đại lộ Vòng Cung, Thủ Thiêm",
    image: img("photo-1613490493576-7fde63acd811"),
    thumb: img("photo-1600585154340-be6161a56a0c", 600),
  },
  {
    code: "03",
    name: "METROPOLE",
    tagline: ["Thành phố", "trên những", "tầng mây"],
    desc: "Tòa tháp biểu tượng với sky-lounge, hồ bơi vô cực và hệ thống nhà thông minh trong từng căn.",
    category: "Cao tầng · Tòa tháp hỗn hợp",
    location: "Trung tâm TP.HCM",
    image: img("photo-1480714378408-67cf0d13bc1b"),
    thumb: img("photo-1512453979798-5ea266f8880c", 600),
  },
];

export const STATS = [
  { value: 12, suffix: "+", label: "Dự án đang phân phối" },
  { value: 4800, suffix: "+", label: "Căn hộ đã bàn giao" },
  { value: 98, suffix: "%", label: "Khách hàng hài lòng" },
  { value: 15, suffix: " năm", label: "Kinh nghiệm thị trường" },
];
