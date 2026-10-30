import { Lock } from "lucide-react";
import Avatar from "../../common/Avatar";
import PostScopeMenu from "./PostScopeMenu";
import {
  POST_SCOPE,
  POST_SCOPE_LABEL,
  type PostScope,
  type SocialUser,
} from "../../../types/social/social.types";

type Props = {
  user: SocialUser;
  createdAt: string;
  scope?: PostScope;
  // Chữ xám sau tên người đăng, ví dụ "đã chia sẻ một bài viết"
  action?: string;
  // Có thì bấm vào người đăng sẽ xem các bài viết của họ
  onUserClick?: (user: SocialUser) => void;
  // Có thì hiện nút đổi phạm vi (chỉ truyền cho bài của chính người đang đăng nhập)
  onScopeChange?: (scope: PostScope) => Promise<void>;
};

export default function PostHeader({ user, createdAt, scope, action, onUserClick, onScopeChange }: Props) {
  const userClass = onUserClick ? "cursor-pointer hover:opacity-80" : "";

  return (
    <header className="mb-3 flex items-center gap-3">
      <button
        type="button"
        disabled={!onUserClick}
        onClick={() => onUserClick?.(user)}
        aria-label={`Xem bài viết của ${user.fullName}`}
        className={`shrink-0 rounded-full ${userClass}`}
      >
        <Avatar src={user.avatarUrl} fullName={user.fullName} className="h-10 w-10" />
      </button>
      <div>
        <p className="text-left">
          <button
            type="button"
            disabled={!onUserClick}
            onClick={() => onUserClick?.(user)}
            className={`text-left font-semibold ${onUserClick ? "cursor-pointer hover:underline" : ""}`}
          >
            {user.fullName}
          </button>
          {action && <span className="text-gray-500"> {action}</span>}
        </p>
        <p className="flex items-center gap-1 text-xs text-gray-500">
          {new Date(createdAt).toLocaleString("vi-VN")}
          {onScopeChange ? (
            // Bài của chính mình: luôn có nút (khóa / địa cầu) để đổi phạm vi
            <>
              <span aria-hidden>·</span>
              <PostScopeMenu scope={scope ?? POST_SCOPE.PUBLIC} onChange={onScopeChange} />
            </>
          ) : (
            scope === POST_SCOPE.PRIVATE && (
              <span title={POST_SCOPE_LABEL.PRIVATE} className="flex items-center">
                · <Lock size={12} className="ml-1" />
              </span>
            )
          )}
        </p>
      </div>
    </header>
  );
}
