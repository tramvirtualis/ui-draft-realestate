import { useCallback, useState } from "react";
import { getErrorMessage } from "../../api/http";
import { useToast } from "../../components/common/toastContext";
import { useCopyToClipboard } from "./useCopyToClipboard";
import { postShareUrl } from "../../utils/postCode";
import { POST_SCOPE, type PostScope, type SharePostRequest } from "../../types/social/social.types";

// Modal chia sẻ: lời nhắn kèm theo + phạm vi, đăng bài chia sẻ, sao chép link bài viết
// onShare lỗi thì giữ modal + lời nhắn và báo lỗi bằng toast; thành công thì gọi onDone (đóng modal)
export function useSharePost(
  postId: number,
  onShare?: (postId: number, request: SharePostRequest) => Promise<unknown>,
  onDone?: () => void,
) {
  const [text, setText] = useState("");
  const [scope, setScope] = useState<PostScope>(POST_SCOPE.PUBLIC);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const { copied, copy } = useCopyToClipboard();
  // Link chia sẻ dùng mã thay cho id, trỏ tới trang xem trước của BE (hiện khung xem trước trên Zalo / Messenger);
  // mở link thì về trang Cộng đồng và hiện modal của bài
  const postLink = postShareUrl(postId);

  const insertEmoji = useCallback((emoji: string) => setText((t) => t + emoji), []);
  const copyLink = useCallback(() => copy(postLink), [copy, postLink]);

  const submit = useCallback(async () => {
    if (!onShare || submitting) return;
    setSubmitting(true);
    try {
      await onShare(postId, { content: text, scope });
      onDone?.();
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }, [onShare, onDone, postId, text, scope, submitting, toast]);

  return { text, setText, scope, setScope, insertEmoji, copied, copyLink, submitting, submit };
}
