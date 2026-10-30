import CommentThread from "./comments/CommentThread";
import type { SocialComment } from "../../types/social/social.types";

type Props = {
  comments: SocialComment[];
  replies: Record<number, SocialComment[]>;
  onLoadReplies: (commentId: number) => Promise<void>;
  onReply?: (comment: SocialComment) => void;
};

export default function CommentSection({ comments, replies, onLoadReplies, onReply }: Props) {
  if (comments.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <CommentThread
          key={c.id}
          comment={c}
          replies={replies[c.id] ?? []}
          onLoadReplies={onLoadReplies}
          onReply={onReply}
        />
      ))}
    </div>
  );
}
