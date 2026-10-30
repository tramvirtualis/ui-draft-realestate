import { CalendarDays, Newspaper, Rss, UserRound, type LucideIcon } from "lucide-react";

// Màu riêng từng mục: ô icon thường (nền nhạt + icon đậm), ô icon khi đang chọn (nền đậm), vạch bên trái
export type SocialTone = { soft: string; solid: string; bar: string };

export const TONES = {
  sky: { soft: "bg-sky-50 text-sky-600", solid: "bg-sky-500 text-white", bar: "before:bg-sky-500" },
  violet: { soft: "bg-violet-50 text-violet-600", solid: "bg-violet-500 text-white", bar: "before:bg-violet-500" },
  orange: { soft: "bg-orange-50 text-orange-600", solid: "bg-orange-500 text-white", bar: "before:bg-orange-500" },
  emerald: { soft: "bg-emerald-50 text-emerald-600", solid: "bg-emerald-500 text-white", bar: "before:bg-emerald-500" },
} satisfies Record<string, SocialTone>;

export type SocialMenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  tone: SocialTone;
  // Có path: bấm là chuyển trang; không có: chọn mục ngay trong trang Cộng đồng
  path?: string;
  // true: chỉ hiện khi đã đăng nhập
  requiresAuth?: boolean;
};

// Menu bên trái trang Cộng đồng
export const SOCIAL_MENU: SocialMenuItem[] = [
  { id: "feed", label: "Bảng tin", icon: Rss, tone: TONES.sky },
  { id: "profile", label: "Bài đăng cá nhân", icon: UserRound, tone: TONES.violet, requiresAuth: true },
  // { id: "friends", label: "người theo dõi" },
  { id: "events", label: "Sự kiện", icon: CalendarDays, tone: TONES.orange, path: "/events" },
  { id: "news", label: "Tin tức", icon: Newspaper, tone: TONES.emerald, path: "/news" },
];
