const avatar = (n: number) => `https://i.pravatar.cc/100?img=${n}`;
const photo = (id: string) => `https://images.unsplash.com/${id}?w=800&q=80`;

export const MOCK_SOCIAL_CONTACTS = [
  { id: 1, fullName: "Nguyễn Minh Anh", avatarUrl: avatar(47) },
  { id: 2, fullName: "Trần Quốc Huy", avatarUrl: avatar(12) },
  { id: 3, fullName: "Phạm Thu Hà", avatarUrl: avatar(5) },
  { id: 4, fullName: "NovaLand Hub", avatarUrl: avatar(68) },
];

export const MOCK_SOCIAL_ADS = [
  {
    id: 1,
    title: "Vinhomes Grand Park",
    description: "Căn hộ từ 1.8 tỷ, hỗ trợ vay 70%.",
    imageUrl: photo("photo-1512917774080-9991f1c4c750"),
    link: "#",
  },
  {
    id: 2,
    title: "Đất nền Long An",
    description: "Sổ hồng riêng, pháp lý rõ ràng.",
    imageUrl: photo("photo-1500382017468-9049fed747ef"),
    link: "#",
  },
];

export const MOCK_SOCIAL_TRENDING = [
  { id: 1, tag: "#canhoThuDuc", postCount: 1240 },
  { id: 2, tag: "#laisuatvay", postCount: 890 },
  { id: 3, tag: "#datnenvenSaiGon", postCount: 640 },
];

export const MOCK_SOCIAL_SUGGESTIONS = [
  { id: 11, fullName: "Lê Hoàng Nam", role: "Môi giới BĐS", avatarUrl: avatar(15) },
  { id: 12, fullName: "Võ Thanh Trúc", role: "Chuyên gia tài chính", avatarUrl: avatar(9) },
  { id: 13, fullName: "Đặng Gia Bảo", role: "Nhà đầu tư", avatarUrl: avatar(52) },
];

export const MOCK_SOCIAL_PROJECT_AD = {
  id: 1,
  name: "The Horizon Riverside",
  tagline: "Căn hộ ven sông chuẩn resort",
  imageUrl: photo("photo-1486406146926-c627a92ad1ab"),
  priceFrom: "Từ 2.9 tỷ",
  highlights: ["View sông trực diện", "Hỗ trợ vay 70%, ân hạn gốc 24 tháng", "Bàn giao Q4/2027"],
  link: "#",
};
