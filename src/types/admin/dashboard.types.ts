// Khớp AdminDashboardResponse bên BE. "newLast30Days" = tạo trong 30 ngày gần nhất
export interface AdminDashboard {
  users: { total: number; active: number; inactive: number; locked: number; newLast30Days: number };
  // Dự án chưa có trạng thái: underConstruction = số dự án có phân khu đang xây dựng
  projects: { total: number; underConstruction: number; zones: number; properties: number; availableProperties: number };
  // active = sắp diễn ra + đang diễn ra
  events: { total: number; active: number; upcoming: number; ongoing: number; completed: number; cancelled: number };
  posts: { total: number; visible: number; hidden: number; privatePosts: number; newLast30Days: number };
  documents: { total: number; newLast30Days: number };
  generatedAt: string;
}
