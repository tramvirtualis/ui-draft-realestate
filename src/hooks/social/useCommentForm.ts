import { useCallback, useRef, useState } from "react";
import { getErrorMessage } from "../../api/http";
import { insertAtCursor } from "../../utils/text";
import {
  COMMENT_MAX_CONTENT_LENGTH,
  type SocialComment,
} from "../../types/social/social.types";

type AddComment = (content: string, parentId?: number | null) => Promise<unknown>;

// Ô nhập bình luận: nội dung, đang trả lời ai, gửi + báo lỗi
export function useCommentForm(addComment: AddComment) {
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<SocialComment | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startReply = useCallback((comment: SocialComment) => {
    setReplyTo(comment);
    inputRef.current?.focus();
  }, []);

  const cancelReply = useCallback(() => setReplyTo(null), []);

  const insertEmoji = useCallback(
    (emoji: string) =>
      setText((t) => insertAtCursor(inputRef.current, t, emoji, COMMENT_MAX_CONTENT_LENGTH)),
    [],
  );

  const submit = useCallback(async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setError(null);
    try {
      // BE chỉ có 2 cấp: trả lời một phản hồi thì gắn vào bình luận gốc
      await addComment(value, replyTo ? (replyTo.parentId ?? replyTo.id) : null);
      setText("");
      setReplyTo(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }, [text, sending, replyTo, addComment]);

  return { text, setText, replyTo, startReply, cancelReply, insertEmoji, sending, error, submit, inputRef };
}

export type CommentFormState = ReturnType<typeof useCommentForm>;
