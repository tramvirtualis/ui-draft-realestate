// Khớp SocialAdResponse bên BE: quảng cáo ở cột phải trang Cộng đồng
export interface SocialAd {
  id: number;
  slot: number; // 1, 2 = ô nhỏ "Được tài trợ"; 3 = thẻ lớn dính khi cuộn
  title: string; // tên dự án
  imageUrl: string;
  linkUrl: string;
  updatedAt: string | null;
}

export const SOCIAL_AD_SLOTS = [
  { slot: 1, label: "Vị trí 1 · Ô nhỏ phía trên", desc: "Ô đầu tiên trong mục “Được tài trợ”.", large: false },
  { slot: 2, label: "Vị trí 2 · Ô nhỏ phía dưới", desc: "Ô thứ hai trong mục “Được tài trợ”.", large: false },
  { slot: 3, label: "Vị trí 3 · Thẻ lớn", desc: "Thẻ lớn bên dưới, dính lại khi người dùng cuộn trang.", large: true },
] as const;

export type SocialAdSlot = (typeof SOCIAL_AD_SLOTS)[number];

// Link ra trang web khác thì mở tab mới; đường dẫn trong web (/projects/1) thì chuyển trang luôn
export const isExternalLink = (url: string): boolean => /^https?:\/\//i.test(url);

// Khớp SocialAdServiceImpl.isValidLink bên BE
export const isValidAdLink = (url: string): boolean =>
  (/^https?:\/\/\S+$/i.test(url) || (url.startsWith("/") && !url.startsWith("//"))) && url.length <= 1000;
