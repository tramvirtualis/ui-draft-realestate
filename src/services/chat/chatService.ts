import BaseService from "../base/BaseService";
import type { ChatRequest, ChatResponse } from "../../types/chat.types";

/**
 Chatbot tư vấn: /chat (công khai, khách vãng lai cũng hỏi được).
 Dùng authHttp để người đã đăng nhập được tính lượt hỏi theo tài khoản thay vì theo IP.
 */
class ChatService extends BaseService {
  constructor() {
    super("/chat");
  }

  // POST /chat/ask — RAG tìm dữ liệu rồi gọi LLM nên có thể mất vài giây
  async ask(request: ChatRequest): Promise<ChatResponse> {
    // Khung chat tự hiện hiệu ứng đang trả lời → không bật lớp loading toàn màn hình
    const res = await this.http.post<ChatResponse>(this.url("ask"), request, { timeout: 60_000, silentLoading: true });
    return { ...res, sources: res.sources ?? [], projects: res.projects ?? [] };
  }
}

const chatService = new ChatService();
export default chatService;
