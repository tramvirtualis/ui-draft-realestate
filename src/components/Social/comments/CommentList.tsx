import { Loader2 } from "lucide-react";
import CommentSection from "../CommentSection";
import type { PostCommentsState } from "../../../hooks/social/usePostComments";
import type { SocialComment } from "../../../types/social/social.types";

type Props = {
  thread: PostCommentsState;
  onReply: (comment: SocialComment) => void;
};

// Danh sách bình luận kèm trạng thái đang tải / lỗi / "Xem thêm bình luận"
export default function CommentList({ thread, onReply }: Props) {
  if (thread.loading) {
    return (
      <div className="flex justify-center py-6 text-gray-500">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (thread.error && thread.comments.length === 0) {
    return <p className="py-6 text-center text-sm text-danger">{thread.error}</p>;
  }

  return (
    <>
      <CommentSection
        comments={thread.comments}
        replies={thread.replies}
        onLoadReplies={thread.loadReplies}
        onReply={onReply}
      />
      {thread.hasMore && (
        <button
          onClick={thread.loadMore}
          disabled={thread.loadingMore}
          className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:underline"
        >
          {thread.loadingMore && <Loader2 size={14} className="animate-spin" />}
          Xem thêm bình luận
        </button>
      )}
    </>
  );
}
