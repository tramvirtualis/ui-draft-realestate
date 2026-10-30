import Avatar from "../../common/Avatar";
import { useToggle } from "../../../hooks/social/useToggle";
import { formatShortRelativeTime } from "../../../utils/formatDate";
import type { SocialComment } from "../../../types/social/social.types";

type Props = {
  comment: SocialComment;
  /** Phản hồi thì avatar nhỏ hơn */
  small?: boolean;
  onReply?: (comment: SocialComment) => void;
};

export default function CommentItem({ comment, small, onReply }: Props) {
  // TODO: chưa có API thích bình luận, mới đổi màu trên client
  const liked = useToggle(false);

  return (
    <div className="flex gap-2">
      <Avatar
        src={comment.user.avatarUrl}
        fullName={comment.user.fullName}
        className={`${small ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs"} shrink-0`}
      />
      <div className="min-w-0">
        <div className="rounded-2xl bg-gray-100 px-3 py-2">
          <p className="text-sm font-semibold">{comment.user.fullName}</p>
          <p className="whitespace-pre-line break-words text-sm text-gray-800">{comment.content}</p>
        </div>
        <div className="mt-0.5 flex items-center gap-3 px-3 text-xs text-gray-500">
          <span title={new Date(comment.createdAt).toLocaleString("vi-VN")}>
            {formatShortRelativeTime(comment.createdAt)}
          </span>
          <button
            onClick={liked.toggle}
            className={`font-semibold hover:underline ${liked.value ? "text-primary-600" : ""}`}
          >
            Thích
          </button>
          <button onClick={() => onReply?.(comment)} className="font-semibold hover:underline">
            Trả lời
          </button>
        </div>
      </div>
    </div>
  );
}
