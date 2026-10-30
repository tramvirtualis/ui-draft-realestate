// Chữ càng ngắn càng to, giống Facebook (dùng chung cho ô đăng bài và bài trên bảng tin)
export const backgroundTextSize = (length: number) =>
  length <= 40 ? "text-3xl" : length <= 85 ? "text-2xl" : "text-xl";

// Khung màu nền: chữ canh giữa
export const backgroundBoxClass = "flex min-h-64 items-center justify-center rounded-lg px-6 py-10";
