import { createPortal } from "react-dom";
import { Check, Link, Loader2, Smile, X } from "lucide-react";
import Avatar from "../common/Avatar";
import EmojiPickerButton from "../common/EmojiPickerButton";
import PostScopeMenu from "./post/PostScopeMenu";
import SharedPostEmbed from "./post/SharedPostEmbed";
import { useLoginRedirect } from "../../hooks/auth/useLoginRedirect";
import { useModalBehavior } from "../../hooks/social/useModalBehavior";
import { useSharePost } from "../../hooks/social/useSharePost";
import {
  POST_MAX_CONTENT_LENGTH,
  POST_SCOPE,
  type PostScope,
  type SharePostRequest,
  type SocialPost,
  type SocialUser,
} from "../../types/social/social.types";

type Props = {
  post: SocialPost;
  // null = khách: ẩn dòng avatar + tên, bấm "Chia sẻ ngay" thì sang đăng nhập
  currentUser: SocialUser | null;
  // Đăng bài chia sẻ; không truyền thì chỉ sao chép được liên kết
  onShare?: (postId: number, request: SharePostRequest) => Promise<unknown>;
  onClose: () => void;
};

export default function ShareModal({ post, currentUser, onShare, onClose }: Props) {
  // Chia sẻ một bài chia sẻ thì thực chất là chia sẻ bài gốc (BE cũng trỏ thẳng về bài gốc)
  const target = post.sharedPostId ? post.sharedPost : post;
  const share = useSharePost(target?.id ?? post.id, onShare, onClose);
  const goLogin = useLoginRedirect();
  useModalBehavior(onClose, false);

  // Bài của chính mình (với bài chia sẻ thì xét bài gốc): không đăng lại được, chỉ sao chép liên kết
  const isOwnPost = currentUser !== null && target?.user.id === currentUser.id;
  const blockedReason = !target
    ? "Bài viết gốc hiện không hiển thị nên không thể chia sẻ."
    : target.scope === POST_SCOPE.PRIVATE
      ? "Bài viết đang ở chế độ chỉ mình tôi nên không thể chia sẻ."
      : null;
  const canShare = !!onShare && !blockedReason && !share.submitting;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="relative border-b border-gray-200 py-3 text-center">
          <h2 className="text-lg font-bold">Chia sẻ</h2>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 p-1.5 hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </header>

        <div className="overflow-y-auto p-4">
          {isOwnPost ? (
            <p className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
              Đây là bài viết của bạn. Bạn có thể sao chép liên kết để gửi cho người khác.
            </p>
          ) : (
            <>
              {currentUser && (
                <div className="mb-3 flex items-center gap-3">
                  <Avatar src={currentUser.avatarUrl} fullName={currentUser.fullName} className="h-10 w-10" />
                  <div>
                    <p className="font-semibold">{currentUser.fullName}</p>
                    <PostScopeMenu scope={share.scope} onChange={async (s: PostScope) => share.setScope(s)} />
                  </div>
                </div>
              )}

              <textarea
                autoFocus
                value={share.text}
                onChange={(e) => share.setText(e.target.value)}
                maxLength={POST_MAX_CONTENT_LENGTH}
                disabled={share.submitting}
                placeholder="Hãy nói gì đó về nội dung này..."
                rows={3}
                className="w-full resize-none text-sm outline-none"
              />

              <div className="mb-3 flex justify-end">
                <EmojiPickerButton
                  placement="top"
                  align="right"
                  onSelect={share.insertEmoji}
                  className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                >
                  <Smile size={22} />
                </EmojiPickerButton>
              </div>
            </>
          )}

          {/* Xem trước: bài gốc sẽ hiện y như vậy bên trong bài chia sẻ */}
          <div className="pointer-events-none max-h-64 overflow-hidden">
            <SharedPostEmbed post={target} />
          </div>

          {blockedReason && !isOwnPost && <p className="mb-3 text-sm text-gray-500">{blockedReason}</p>}

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={share.copyLink}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold hover:bg-gray-200"
            >
              {share.copied ? <Check size={18} className="text-green-600" /> : <Link size={18} />}
              {share.copied ? "Đã sao chép" : "Sao chép liên kết"}
            </button>
            {!isOwnPost && (
              <button
                onClick={currentUser ? share.submit : goLogin}
                disabled={currentUser !== null && !canShare}
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {share.submitting && <Loader2 size={16} className="animate-spin" />}
                Chia sẻ ngay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
