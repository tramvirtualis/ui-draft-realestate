import { useCallback, useState } from "react";

// Bấm "Xem n phản hồi": tải phản hồi của 1 bình luận gốc, có trạng thái đang tải
export function useReplyLoader(commentId: number, onLoadReplies: (commentId: number) => Promise<void>) {
  const [loading, setLoading] = useState(false);

  const loadReplies = useCallback(async () => {
    setLoading(true);
    try {
      await onLoadReplies(commentId);
    } catch {
      /* lỗi tải phản hồi: giữ nút để người dùng bấm lại */
    } finally {
      setLoading(false);
    }
  }, [commentId, onLoadReplies]);

  return { loading, loadReplies };
}
