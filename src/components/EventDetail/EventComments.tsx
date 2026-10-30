import { useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { MessageCircleMore, Send, Trash2 } from "lucide-react";
import { formatRelativeTime } from "../../utils/formatDate";
import type { EventComment, UserSummary } from "../../types/event/event.types";

const MAX_LENGTH = 500;
const PAGE_SIZE = 5;

interface AvatarProps {
  user: UserSummary;
  size?: string;
}

const Avatar = ({ user, size = "h-15 w-15" }: AvatarProps) =>
  user.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt={user.fullName}
      className={`${size} shrink-0 rounded-full object-cover`}
    />
  ) : (
    <span
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-600`}
    >
      {user.fullName.charAt(0)}
    </span>
  );

interface EventCommentsProps {
  comments: EventComment[];
  currentUser: UserSummary | null;
  onAdd: (content: string) => Promise<void>;
  onDelete: (commentId: number) => void | Promise<void>;
}

export default function EventComments({
  comments,
  currentUser,
  onAdd,
  onDelete,
}: EventCommentsProps) {
  const [text, setText] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [visible, setVisible] = useState<number>(PAGE_SIZE);

  const submit = async () => {
    const content = text.trim();
    if (!content || sending) return;

    setSending(true);
    try {
      await onAdd(content);
      setText("");
    } catch {
      // Lỗi đã được bên gọi hiển thị, giữ nguyên nội dung để gửi lại
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div>
      <h2 className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.25em] text-heading">
        <MessageCircleMore size={15} className="text-primary-600" />
        Bình luận ({comments.length})
        <span className="h-px flex-1 bg-heading/80" />
      </h2>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
          <Avatar user={currentUser} />
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="Đặt câu hỏi hoặc chia sẻ cảm nhận về sự kiện..."
              className="w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-sm text-heading outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-body">
                {text.length}/{MAX_LENGTH} · Ctrl + Enter để gửi
              </span>
              <button
                type="submit"
                disabled={!text.trim() || sending}
                className="flex items-center gap-2 bg-ink-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "Đang gửi..." : "Gửi"} <Send size={14} />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="mt-6 bg-white p-4 text-sm text-body">
          <Link to="/login" className="font-semibold text-primary-600">
            Đăng nhập
          </Link>{" "}
          để bình luận.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="py-10 text-center text-sm text-body">
          Chưa có bình luận nào. Hãy là người đầu tiên!
        </p>
      ) : (
        <ul className="mt-8 space-y-6">
          {comments.slice(0, visible).map((c) => {
            const isMine = currentUser?.id === c.user.id;
            return (
              <li key={c.id} className="group flex gap-3">
                <Avatar user={c.user} />
                <div className="flex-1">
                  <div className="border-l-2 border-line bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-heading">
                        {c.user.fullName}
                      </span>
                      {isMine && (
                        <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-medium text-white">
                          Bạn
                        </span>
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed text-heading">
                      {c.content}
                    </p>
                  </div>
                  <div className="mt-1.5 flex items-center gap-4 px-2 text-xs text-body">
                    <span>{formatRelativeTime(c.createdAt)}</span>
                    {isMine && (
                      <button
                        onClick={() => onDelete(c.id)}
                        className="flex items-center gap-1 opacity-0 transition hover:text-danger group-hover:opacity-100"
                      >
                        <Trash2 size={12} /> Xóa
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {visible < comments.length && (
        <button
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="mt-6 w-full border border-line bg-white py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50"
        >
          Xem thêm {comments.length - visible} bình luận
        </button>
      )}
    </div>
  );
}
