import { useCallback, useEffect, useRef, useState } from "react";
import commentService from "../../services/social/commentService";
import { getErrorMessage } from "../../api/http";
import { toSocialComment, type SocialComment } from "../../types/social/social.types";

// Gộp trang mới vào danh sách, bỏ trùng id (bình luận vừa gửi làm lệch offset phân trang)
const mergeUnique = (prev: SocialComment[], next: SocialComment[]) => {
  const ids = new Set(prev.map((c) => c.id));
  return [...prev, ...next.filter((c) => !ids.has(c.id))];
};

export function usePostComments(postId: number, size = 10) {
  const [comments, setComments] = useState<SocialComment[]>([]);
  // Phản hồi đã tải, theo id bình luận gốc
  const [replies, setReplies] = useState<Record<number, SocialComment[]>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    let ignore = false;
    busy.current = true;
    setLoading(true);
    setError(null);

    commentService
      .getCommentsByPost(postId, 0, size)
      .then((res) => {
        if (ignore) return;
        setComments(res.content.map(toSocialComment));
        setTotal(res.totalElements);
        setPage(0);
        setHasMore(res.number + 1 < res.totalPages);
      })
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => {
        if (ignore) return;
        busy.current = false;
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [postId, size]);

  const loadMore = useCallback(async () => {
    if (busy.current || !hasMore) return;
    busy.current = true;
    setLoadingMore(true);
    try {
      const res = await commentService.getCommentsByPost(postId, page + 1, size);
      setComments((prev) => mergeUnique(prev, res.content.map(toSocialComment)));
      setPage(res.number);
      setHasMore(res.number + 1 < res.totalPages);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      busy.current = false;
      setLoadingMore(false);
    }
  }, [postId, page, size, hasMore]);

  // Tải toàn bộ phản hồi của 1 bình luận gốc (BE giới hạn 50/trang)
  const loadReplies = useCallback(async (commentId: number) => {
    const res = await commentService.getReplies(commentId, 0, 50);
    setReplies((prev) => ({ ...prev, [commentId]: res.content.map(toSocialComment) }));
  }, []);

  // Lỗi được ném ra để bên gọi hiển thị (ô nhập giữ nguyên nội dung)
  const addComment = useCallback(
    async (content: string, parentId?: number | null) => {
      const created = toSocialComment(
        await commentService.createComment({ postId, parentId, content }),
      );

      if (created.parentId == null) {
        setComments((prev) => [...prev, created]);
        setTotal((t) => t + 1);
        return created;
      }

      const rootId = created.parentId;
      setReplies((prev) => ({ ...prev, [rootId]: [...(prev[rootId] ?? []), created] }));
      setComments((prev) =>
        prev.map((c) => (c.id === rootId ? { ...c, replyCount: c.replyCount + 1 } : c)),
      );
      return created;
    },
    [postId],
  );

  return {
    comments,
    replies,
    total,
    hasMore,
    loading,
    loadingMore,
    error,
    loadMore,
    loadReplies,
    addComment,
  };
}

export type PostCommentsState = ReturnType<typeof usePostComments>;
