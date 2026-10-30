import { Building2, Layers, CalendarCheck, ShieldCheck, Trees, TrainFront, GraduationCap, Hospital, ShoppingBag, FileText, LayoutPanelTop, CircleDollarSign, BookCheck } from "lucide-react";

// TODO: thay bằng dữ liệu gọi từ API theo :id
// Bám theo các bảng: projects, project_types, project_images, zones, property,
// policy_images, progress(+progress_images), project_documents, news
export const PROJECT = {
  name: "Aurelia Riverside",
  location: "Đại lộ Vòng Cung, Thủ Thiêm, TP. Hồ Chí Minh",
  status: "Đang mở bán",
  updated: "Cập nhật 5 phút trước",
  price: "Từ 168 triệu/m²",
  overview: "Aurelia Riverside kết hợp kiến trúc khí hậu nhiệt đới, hệ tiện ích wellness và tầm nhìn toàn cảnh trung tâm trong một cộng đồng riêng tư tại lõi Thủ Thiêm.",
  facts: [
    { icon: Building2, label: "Loại hình", value: "Căn hộ · Duplex · Penthouse" },
    { icon: Trees, label: "Quy mô", value: "8,6 ha · 3 tòa tháp" },
    { icon: Layers, label: "Số sản phẩm", value: "1.248 căn hộ" },
    { icon: CalendarCheck, label: "Bàn giao dự kiến", value: "Quý IV / 2028" },
    { icon: ShieldCheck, label: "Pháp lý", value: "Sở hữu lâu dài" },
  ],
  storyTitle: "Nơi nhịp sống đô thị chạm vào khoảng thở ven sông",
  story: [
    "Lấy cảm hứng từ dải ánh sáng phản chiếu trên mặt nước, Aurelia Riverside được thiết kế như ba cánh buồm vươn lên trên đường chân trời Thủ Thiêm. Mỗi căn hộ ưu tiên gió tự nhiên, ban công sâu và tầm nhìn không bị che chắn.",
    "Tầng đế cảnh quan liên kết hơn 35 tiện ích nội khu, từ hồ bơi điện phân muối, vườn trị liệu đến lounge làm việc và bến đón khách riêng.",
  ],
  highlights: [
    "100% căn hộ có ban công và cửa kính toàn chiều cao",
    "Hơn 70% diện tích dành cho cảnh quan và tiện ích",
    "Sảnh riêng, thang máy tốc độ cao theo cụm căn",
    "Vận hành thông minh bằng ứng dụng cư dân Aurelia",
    "Cam kết tiêu chuẩn công trình xanh EDGE Advanced",
  ],
};

export const GALLERY = [
  { src: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=80", label: "Phối cảnh tổng thể", caption: "Ba tòa tháp bên công viên ven sông 3,2 ha" },
  { src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", label: "Hồ bơi vô cực", caption: "Hồ bơi vô cực tầng đế" },
  { src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", label: "Tòa tháp Aurelia", caption: "Tòa tháp Aurelia về đêm" },
  { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", label: "Căn hộ mẫu", caption: "Căn hộ mẫu 3 phòng ngủ" },
];

export const NEARBY = [
  { icon: TrainFront, name: "Metro Thủ Thiêm", distance: "450 m" },
  { icon: GraduationCap, name: "Trường quốc tế EMASI", distance: "1,2 km" },
  { icon: Hospital, name: "BV Quốc tế Vinmec", distance: "3,4 km" },
  { icon: ShoppingBag, name: "Thiso Mall Sala", distance: "1,8 km" },
  { icon: Trees, name: "Công viên bờ sông", distance: "120 m" },
];

export const ZONES = [
  { name: "Aurelia Sol", description: "Tầm nhìn trung tâm · 38 tầng", status: "Đang mở bán", tone: "success", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=80" },
  { name: "Aurelia Aqua", description: "Tầm nhìn sông · 42 tầng", status: "Sắp mở bán", tone: "warning", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80" },
  { name: "Aurelia Terra", description: "Tầm nhìn công viên · 36 tầng", status: "Đã bán 88%", tone: "primary", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=80" },
];

export const BUILDINGS = [
  { code: "S1", name: "Aurelia Sol", note: "Căn hộ 1–3PN · 52–128 m²", meta: "126 căn", active: true },
  { code: "A2", name: "Aurelia Aqua", note: "Căn hộ 2–4PN · 76–156 m²", meta: "Mở Q2/2027" },
  { code: "T3", name: "Aurelia Terra", note: "Duplex · Penthouse · 168–320 m²", meta: "Còn 18 căn" },
  { code: "V", name: "Riverside Villas", note: "Biệt thự sân vườn · 280–420 m²", meta: "24 căn" },
];

export const PINS = [
  { code: "S1", left: "33%", top: "18%", color: "bg-success" },
  { code: "A2", left: "56%", top: "26%", color: "bg-warning" },
  { code: "T3", left: "43%", top: "58%", color: "bg-success" },
  { code: "V", left: "79%", top: "70%", color: "bg-danger" },
];

export const FACILITIES = [
  { icon: GraduationCap, label: "Trường học", value: "1,2 km" },
  { icon: Hospital, label: "Bệnh viện", value: "3,4 km" },
  { icon: ShoppingBag, label: "TT thương mại", value: "1,8 km" },
  { icon: Trees, label: "Công viên", value: "120 m" },
  { icon: TrainFront, label: "Metro", value: "450 m" },
];

// bảng property
export const PROPERTIES = [
  { code: "S1-1806", zone: "Sol", floor: 18, area: "78,4 m²", type: "Căn hộ", direction: "Đông Nam", price: "13,9 tỷ", status: "Còn hàng" },
  { code: "S1-2312", zone: "Sol", floor: 23, area: "98,2 m²", type: "Căn hộ", direction: "Tây Bắc", price: "17,2 tỷ", status: "Giữ chỗ" },
  { code: "T3-1203", zone: "Terra", floor: 12, area: "126,8 m²", type: "Căn hộ", direction: "Đông Bắc", price: "22,8 tỷ", status: "Còn hàng" },
  { code: "T3-3501", zone: "Terra", floor: 35, area: "214,6 m²", type: "Duplex", direction: "Nam", price: "42,5 tỷ", status: "Còn hàng" },
  { code: "A2-2708", zone: "Aqua", floor: 27, area: "86,0 m²", type: "Căn hộ", direction: "Đông Nam", price: "Liên hệ", status: "Sắp mở" },
];

export const POLICIES = [
  { title: "Thanh toán chuẩn", big: "10 đợt", desc: "Thanh toán 30% đến khi nhận nhà", items: ["Chiết khấu 1%", "Ân hạn gốc đến bàn giao", "Hỗ trợ thủ tục vay"] },
  { title: "Thanh toán sớm", big: "95%", desc: "Tối ưu giá trị đầu tư ngay hôm nay", items: ["Chiết khấu đến 8%", "Tặng 2 năm phí quản lý", "Ưu tiên chọn chỗ đậu xe"], featured: true },
  { title: "Vay linh hoạt", big: "70%", desc: "Ngân hàng hỗ trợ tối đa giá trị căn", items: ["Lãi suất 0% trong 24 tháng", "Miễn phí trả nợ trước hạn", "Thẩm định trong 48 giờ"] },
];

export const PROGRESS = [
  { date: "Q2/2025", title: "Khởi công", desc: "Hoàn tất cọc thử và tường vây", state: "done" },
  { date: "Q4/2025", title: "Phần ngầm", desc: "Hoàn thành 3 tầng hầm", state: "done" },
  { date: "Q3/2026", title: "Kết cấu thân", desc: "Đang thi công đến tầng 18", state: "current" },
  { date: "Q4/2027", title: "Hoàn thiện", desc: "Mặt ngoài, MEP và cảnh quan", state: "todo" },
  { date: "Q4/2028", title: "Bàn giao", desc: "Nghiệm thu và đón cư dân", state: "todo" },
];

export const DOCUMENTS = [
  { icon: FileText, title: "Brochure Aurelia Riverside", size: "PDF · 18,4 MB", note: "Cập nhật 20/09/2026" },
  { icon: LayoutPanelTop, title: "Mặt bằng điển hình", size: "PDF · 12,6 MB", note: "Cập nhật 18/09/2026" },
  { icon: CircleDollarSign, title: "Bảng giá & chính sách", size: "PDF · 4,8 MB", note: "Cập nhật hôm nay" },
  { icon: BookCheck, title: "Thông tin pháp lý", size: "PDF · 26,2 MB", note: "Đã xác thực" },
];

export const NEWS = [
  { category: "Hạ tầng", title: "Cầu Thủ Thiêm 4 tạo lực đẩy mới cho trục ven sông", meta: "28/09/2026 · 6 phút đọc", image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=900&q=80" },
  { category: "Dự án", title: "Aurelia Riverside ra mắt bộ sưu tập căn hộ Sol", meta: "24/09/2026 · 4 phút đọc", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80" },
  { category: "Góc chuyên gia", title: "5 tiêu chí chọn căn hộ cao cấp tại Thủ Thiêm", meta: "18/09/2026 · 8 phút đọc", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=80" },
];

export type ProjectOverview = typeof PROJECT;
export type GalleryImage = (typeof GALLERY)[number];
export type NearbyItem = (typeof NEARBY)[number];
export type ZoneItem = (typeof ZONES)[number];
export type BuildingItem = (typeof BUILDINGS)[number];
export type PinItem = (typeof PINS)[number];
export type FacilityItem = (typeof FACILITIES)[number];
export type PropertyRow = (typeof PROPERTIES)[number];
export type PolicyPlan = (typeof POLICIES)[number];
export type ProgressStep = (typeof PROGRESS)[number];
export type DocumentItem = (typeof DOCUMENTS)[number];
export type NewsItem = (typeof NEWS)[number];
