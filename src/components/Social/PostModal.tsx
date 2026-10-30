import CommentModal from "./CommentModal";
import { usePostCard } from "../../hooks/social/usePostCard";
import type { SocialPost, SocialUser } from "../../types/social/social.types";

type Props = {
  post: SocialPost;
  startIndex?: number;
  currentUser: SocialUser | null;
  onClose: () => void;
};

// Modal của 1 bài viết khi không có PostCard đi kèm: bấm ảnh bài gốc trong bài chia sẻ, hoặc mở link chia sẻ.
// Tự tải lượt thích + bình luận của bài, chỉ khi thật sự mở
export default function PostModal({ post, startIndex = 0, currentUser, onClose }: Props) {
  const card = usePostCard(post.id, currentUser === null);

  return (
    <CommentModal
      post={post}
      startIndex={startIndex}
      currentUser={currentUser}
      liked={card.liked}
      likeCount={card.likeCount}
      onToggleLike={card.toggleLike}
      thread={card.thread}
      onClose={onClose}
    />
  );
}
