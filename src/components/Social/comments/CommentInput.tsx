import { Loader2, SendHorizontal, Smile, X } from "lucide-react";
import Avatar from "../../common/Avatar";
import EmojiPickerButton from "../../common/EmojiPickerButton";
import { useLoginRedirect } from "../../../hooks/auth/useLoginRedirect";
import type { CommentFormState } from "../../../hooks/social/useCommentForm";
import {
  COMMENT_MAX_CONTENT_LENGTH,
  type SocialUser,
} from "../../../types/social/social.types";

type Props = {
  // null = khách: thay ô nhập bằng lời mời đăng nhập
  currentUser: SocialUser | null;
  form: CommentFormState;
};

// Ô nhập bình luận ở đáy modal bài viết
export default function CommentInput({ currentUser, form }: Props) {
  const goLogin = useLoginRedirect();

  if (!currentUser) {
    return (
      <footer className="border-t border-gray-200 p-3 text-center text-sm text-gray-500">
        <button type="button" onClick={goLogin} className="font-semibold text-primary-600 hover:text-primary-700">
          Đăng nhập
        </button>{" "}
        để bình luận.
      </footer>
    );
  }

  return (
    <footer className="border-t border-gray-200 p-3">
      {form.replyTo && (
        <div className="mb-2 flex items-center gap-2 px-1 text-xs text-gray-500">
          Đang trả lời <span className="font-semibold text-gray-700">{form.replyTo.user.fullName}</span>
          <button
            onClick={form.cancelReply}
            aria-label="Huỷ trả lời"
            className="rounded-full p-0.5 hover:bg-gray-200"
          >
            <X size={12} />
          </button>
        </div>
      )}
      {form.error && <p className="mb-2 px-1 text-xs text-danger">{form.error}</p>}

      <div className="flex items-center gap-2">
        <Avatar src={currentUser.avatarUrl} fullName={currentUser.fullName} className="h-9 w-9" />
        <div className="flex flex-1 items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5">
          <input
            ref={form.inputRef}
            autoFocus
            value={form.text}
            onChange={(e) => form.setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && form.submit()}
            maxLength={COMMENT_MAX_CONTENT_LENGTH}
            disabled={form.sending}
            placeholder={form.replyTo ? `Trả lời ${form.replyTo.user.fullName}...` : "Viết bình luận..."}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          {/* <button type="button" aria-label="Thêm ảnh" className="rounded-full p-1 text-gray-500 hover:bg-gray-200">
            <ImagePlus size={20} />
          </button> */}
          <EmojiPickerButton
            placement="top"
            align="right"
            disabled={form.sending}
            onSelect={form.insertEmoji}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-200"
          >
            <Smile size={20} />
          </EmojiPickerButton>
        </div>
        <button
          type="button"
          aria-label="Gửi"
          onClick={form.submit}
          disabled={!form.text.trim() || form.sending}
          className="rounded-full bg-primary-600 p-2.5 text-white transition hover:bg-primary-700 disabled:bg-primary-200"
        >
          {form.sending ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
        </button>
      </div>
    </footer>
  );
}
