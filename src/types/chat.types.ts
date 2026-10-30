// Trợ lý AI (chatbot RAG): POST /chat/ask

export type ChatRole = "user" | "assistant";

export interface ChatHistoryItem {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  question: string;
  // Đang ở trang chi tiết dự án: chỉ trả lời về dự án đó
  projectId?: number;
  documentId?: number;
  // Tin nhắn trước (cũ trước, mới sau), tối đa 20
  history?: ChatHistoryItem[];
}

// index khớp số [n] trong answer
export interface ChatSource {
  index: number;
  type: "DOCUMENT" | "PROJECT";
  id: number;
  title: string;
  slug?: string | null;
  section?: string | null;
  heading?: string | null;
  page?: number | null;
  score: number;
}

// Thẻ dự án được nhắc tới trong câu trả lời: ảnh + link sang trang dự án
export interface ChatProject {
  id: number;
  name: string;
  image: string | null;
  location: string | null;
}

export interface ChatResponse {
  answer: string;
  // BE đã lọc: chỉ còn các nguồn được trích [n] trong answer
  sources: ChatSource[];
  projects: ChatProject[];
  usedLlm: boolean;
}

// Tin nhắn hiển thị trong khung chat
export interface ChatMessage {
  id: number;
  role: ChatRole;
  content: string;
  sources?: ChatSource[];
  projects?: ChatProject[];
  // Tin báo lỗi: hiện khác màu, không gửi kèm vào lịch sử
  error?: boolean;
}
