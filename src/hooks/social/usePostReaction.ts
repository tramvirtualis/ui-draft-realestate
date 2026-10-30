import { useCallback, useEffect, useRef, useState } from "react";
import postService from "../../services/social/postService";

export function usePostReaction(postId: number) {
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const pending = useRef(false);

  useEffect(() => {
    let ignore = false;
    postService
      .getReaction(postId)
      .then((res) => {
        if (ignore) return;
        setLikeCount(res.likeCount);
        setLiked(res.liked);
      })
      .catch(() => {
        /* lỗi tải lượt thích: giữ 0, không chặn hiển thị bài */
      });
    return () => {
      ignore = true;
    };
  }, [postId]);

  // Đổi giao diện ngay, sai thì trả về trạng thái cũ; chặn bấm liên tục khi đang gửi
  const toggleLike = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevCount + (prevLiked ? -1 : 1));
    try {
      const res = await postService.toggleLike(postId);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      pending.current = false;
    }
  }, [postId, liked, likeCount]);

  return { likeCount, liked, toggleLike };
}
