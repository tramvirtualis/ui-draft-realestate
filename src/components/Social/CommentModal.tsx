import { createPortal } from "react-dom";
import ImageViewer from "./comments/ImageViewer";
import PostDetailPanel from "./comments/PostDetailPanel";
import { useModalBehavior } from "../../hooks/social/useModalBehavior";
import type { PostCommentsState } from "../../hooks/social/usePostComments";
import type { SocialPost, SocialUser } from "../../types/social/social.types";

type Props = {
  post: SocialPost;
  startIndex?: number;
  currentUser: SocialUser | null;
  liked: boolean;
  likeCount: number;
  onToggleLike: () => void;
  thread: PostCommentsState;
  onClose: () => void;
};

// Portal ra body: ancestor animate-page-in có transform làm "fixed" bị định vị sai
export default function CommentModal({ post, startIndex = 0, onClose, ...panelProps }: Props) {
  useModalBehavior(onClose);
  const hasImages = post.imageUrls.length > 0;

  // Không có ảnh: modal nhỏ ở giữa
  if (!hasImages) {
    return createPortal(
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div
          className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <PostDetailPanel post={post} onClose={onClose} {...panelProps} />
        </div>
      </div>,
      document.body,
    );
  }

  // Có ảnh: toàn màn hình, ảnh bên trái, nội dung + bình luận bên phải
  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col bg-black md:flex-row">
      <ImageViewer images={post.imageUrls} startIndex={startIndex} onClose={onClose} />
      <aside className="flex h-[50vh] w-full flex-col bg-white md:h-full md:w-[28rem]">
        <PostDetailPanel post={post} {...panelProps} />
      </aside>
    </div>,
    document.body,
  );
}
