import { useCallback, useEffect, useState } from "react";
import eventService from "../../services/event/eventService";
import { getErrorMessage } from "../../api/http";
import type { EventComment } from "../../types/event/event.types";

export function useEventComments(eventId: number, size = 50) {
  const [comments, setComments] = useState<EventComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(eventId) || eventId <= 0) {
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);
    setError(null);

    eventService
      .getComments(eventId, 0, size)
      .then((res) => !ignore && setComments(res.content))
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [eventId, size]);

  // Lỗi được ném ra để bên gọi hiển thị (form giữ nguyên nội dung đang gõ)
  const addComment = useCallback(
    async (content: string) => {
      const created = await eventService.addComment(eventId, { content });
      setComments((prev) => [created, ...prev]);
    },
    [eventId]
  );

  const deleteComment = useCallback(
    async (commentId: number) => {
      await eventService.deleteComment(eventId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    },
    [eventId]
  );

  return { comments, loading, error, addComment, deleteComment };
}
