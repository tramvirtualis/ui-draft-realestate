import { useCallback, useState } from "react";
import { useLoginRedirect } from "../auth/useLoginRedirect";
import { usePostComments } from "./usePostComments";
import { usePostReaction } from "./usePostReaction";

// Mọi state của 1 bài trên bảng tin: thích, bình luận, mở modal bình luận / chia sẻ / bài gốc (với bài chia sẻ)
// isGuest: khách bấm thích → sang đăng nhập
export function usePostCard(postId: number, isGuest = false) {
  const reaction = usePostReaction(postId);
  const thread = usePostComments(postId);
  const goLogin = useLoginRedirect();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  // Bài chia sẻ: đang xem ảnh thứ mấy của bài gốc (null = chưa mở modal bài gốc)
  const [sharedImageIndex, setSharedImageIndex] = useState<number | null>(null);

  const openComments = useCallback(() => {
    setStartIndex(0);
    setCommentsOpen(true);
  }, []);

  // Bấm vào 1 ảnh: mở modal và xem đúng ảnh đó
  const openImage = useCallback((index: number) => {
    setStartIndex(index);
    setCommentsOpen(true);
  }, []);

  const closeComments = useCallback(() => setCommentsOpen(false), []);
  const openShare = useCallback(() => setShareOpen(true), []);
  const closeShare = useCallback(() => setShareOpen(false), []);
  const openSharedImage = useCallback((index: number) => setSharedImageIndex(index), []);
  const closeSharedPost = useCallback(() => setSharedImageIndex(null), []);

  return {
    ...reaction,
    toggleLike: isGuest ? goLogin : reaction.toggleLike,
    thread,
    commentsOpen,
    startIndex,
    openComments,
    openImage,
    closeComments,
    shareOpen,
    openShare,
    closeShare,
    sharedImageIndex,
    openSharedImage,
    closeSharedPost,
  };
}
