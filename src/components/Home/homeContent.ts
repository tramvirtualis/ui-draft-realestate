// Nội dung tĩnh dùng ở trang chủ (cảm nhận khách hàng, tuyên ngôn, đối tác, một ngày ở đây…)
const img = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// Tuyên ngôn: từ có dấu * được tô màu nhấn
export const MANIFESTO =
  "Chúng tôi không chỉ xây những tòa nhà, chúng tôi kiến tạo *nơi* *bắt* *đầu* của mỗi gia đình, nơi *ánh* *sáng*, *cây* *xanh* và con người gặp nhau mỗi ngày.";

export const DAY_IN_LIFE = [
  { time: "06:00", title: "Bình minh bên sông", desc: "Chạy bộ trên đường dạo ven sông, đón nắng sớm từ ban công.", image: img("photo-1545324418-cc1a3fa10c00") },
  { time: "09:00", title: "Làm việc tại gia", desc: "Góc làm việc ngập sáng, internet tốc độ cao tới từng căn.", image: img("photo-1600210492486-724fe5c67fb0") },
  { time: "12:30", title: "Bữa trưa gia đình", desc: "Bếp mở nối phòng khách, không gian cho cả nhà quây quần.", image: img("photo-1600566753190-17f0baa2a6c3") },
  { time: "16:00", title: "Giờ của trẻ nhỏ", desc: "Sân chơi an toàn ngay dưới tòa nhà, có người trông giữ.", image: img("photo-1600596542815-ffad4c1539a9") },
  { time: "19:00", title: "Hồ bơi vô cực", desc: "Ngắm thành phố lên đèn từ hồ bơi trên tầng thượng.", image: img("photo-1613490493576-7fde63acd811") },
  { time: "22:00", title: "Giấc ngủ yên", desc: "Cách âm chuẩn khách sạn, an ninh 3 lớp suốt đêm.", image: img("photo-1505693416388-ac5ce068fe85") },
];

export const STORY = {
  image: img("photo-1600607687939-ce8a6c25118c", 1400),
  lines: ["Mỗi căn nhà", "là một câu chuyện", "được kể bằng ánh sáng"],
  desc: "Từ hướng nắng, luồng gió đến vật liệu hoàn thiện — mọi chi tiết được tính toán để ngôi nhà thở cùng nhịp sống của bạn.",
  points: ["Hướng Đông Nam đón gió mát quanh năm", "Trần cao 3,2 m, kính Low-E tiết kiệm năng lượng", "Vật liệu nhập khẩu, bàn giao hoàn thiện cao cấp"],
  stats: [
    { value: 70, suffix: "%", label: "Mật độ cây xanh" },
    { value: 3, suffix: " lớp", label: "An ninh" },
    { value: 45, suffix: "+", label: "Tiện ích nội khu" },
  ],
};

export const AMENITIES = [
  { icon: "waves", title: "Hồ bơi vô cực", desc: "Tầng thượng, view toàn thành phố" },
  { icon: "trees", title: "Công viên ven sông", desc: "2 ha cây xanh và đường dạo" },
  { icon: "dumbbell", title: "Gym & Yoga", desc: "Mở cửa 24/7 cho cư dân" },
  { icon: "baby", title: "Khu vui chơi trẻ em", desc: "Trong nhà và ngoài trời" },
  { icon: "shield", title: "An ninh 3 lớp", desc: "Thẻ từ, camera AI, bảo vệ 24/7" },
  { icon: "car", title: "Hầm xe thông minh", desc: "Trạm sạc xe điện mỗi tầng" },
  { icon: "bag", title: "Trung tâm thương mại", desc: "Siêu thị, cửa hàng ngay chân tòa" },
  { icon: "coffee", title: "Sky lounge", desc: "Cà phê và không gian tiếp khách" },
] as const;

export const TESTIMONIALS = [
  { name: "Chị Minh Anh", role: "Cư dân LUMEN", quote: "Từ lúc xem tour 360° tới khi nhận nhà chỉ mất vài tuần. Mọi thứ minh bạch và nhanh hơn mình nghĩ." },
  { name: "Anh Quốc Bảo", role: "Nhà đầu tư AURELIA", quote: "Bảng hàng cập nhật tức thì giúp tôi chọn được căn góc đẹp nhất trước khi mở bán chính thức." },
  { name: "Cô Thu Hà", role: "Cư dân METROPOLE", quote: "Con cháu về chơi ai cũng mê hồ bơi trên tầng thượng. Đội ngũ chăm sóc khách hàng rất chu đáo." },
];

export const PARTNERS = ["Ngân hàng Vietcombank", "Techcombank", "Savills", "CBRE", "Coteccons", "Hòa Bình", "VinaCapital", "Knight Frank"];
