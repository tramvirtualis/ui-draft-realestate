import { useCallback, useRef, useState } from "react";
import { getErrorMessage } from "../../api";
import chatService from "../../services/chat/chatService";
import type { ChatHistoryItem, ChatMessage } from "../../types/chat.types";

export const MAX_QUESTION_LENGTH = 1000;
// RAG service chỉ dùng 6 tin gần nhất, gửi nhiều hơn cũng bỏ
const HISTORY_LIMIT = 6;

const GREETING: ChatMessage = {
  id: 0,
  role: "assistant",
  content:
    "Xin chào! Mình là trợ lý AI của Đất Việt Group. Bạn cần tìm hiểu về dự án, căn hộ hay tài liệu nào, cứ hỏi mình nhé.",
};

// Hội thoại với chatbot. projectId: đang ở trang dự án thì chỉ hỏi trong phạm vi dự án đó
export function useChatbot(projectId?: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [sending, setSending] = useState(false);
  const nextId = useRef(1);

  const ask = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || sending) return;

      // Lịch sử gửi kèm: bỏ câu chào và tin báo lỗi
      const history: ChatHistoryItem[] = messages
        .filter((m) => m.id !== GREETING.id && !m.error)
        .slice(-HISTORY_LIMIT)
        .map(({ role, content }) => ({ role, content }));

      setMessages((prev) => [...prev, { id: nextId.current++, role: "user", content: question }]);
      setSending(true);
      try {
        const res = await chatService.ask({ question, projectId, history });
        setMessages((prev) => [
          ...prev,
          {
            id: nextId.current++,
            role: "assistant",
            content: res.answer,
            sources: res.sources,
            projects: res.projects,
          },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { id: nextId.current++, role: "assistant", content: getErrorMessage(err), error: true },
        ]);
      } finally {
        setSending(false);
      }
    },
    [messages, projectId, sending],
  );

  const reset = useCallback(() => setMessages([GREETING]), []);

  return { messages, sending, ask, reset };
}
