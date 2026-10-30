import { CornerDownRight, Loader2 } from "lucide-react";
import CommentItem from "./CommentItem";
import { useReplyLoader } from "../../../hooks/social/useReplyLoader";
import type { SocialComment } from "../../../types/social/social.types";

type Props = {
  comment: SocialComment;
  replies: SocialComment[];
  onLoadReplies: (commentId: number) => Promise<void>;
  onReply?: (comment: SocialComment) => void;
};

// 1 bình luận gốc + các phản hồi bên dưới
export default function CommentThread({ comment, replies, onLoadReplies, onReply }: Props) {
  const { loading, loadReplies } = useReplyLoader(comment.id, onLoadReplies);
  const remaining = comment.replyCount - replies.length;

  return (
    <div className="space-y-2">
      <CommentItem comment={comment} onReply={onReply} />

      {(replies.length > 0 || remaining > 0) && (
        <div className="ml-10 space-y-2">
          {replies.map((r) => (
            <CommentItem key={r.id} comment={r} small onReply={onReply} />
          ))}
          {remaining > 0 && (
            <button
              onClick={loadReplies}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:underline"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <CornerDownRight size={14} />}
              Xem {remaining} phản hồi
            </button>
          )}
        </div>
      )}
    </div>
  );
}
