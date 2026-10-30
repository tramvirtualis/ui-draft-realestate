import { useState } from "react";
import { ImagePlus, Palette, PenLine, Video } from "lucide-react";
import Avatar from "../common/Avatar";
import AuthRequiredModal from "../common/AuthRequiredModal";
import PostComposerModal from "./composer/PostComposerModal";
import { usePostComposer } from "../../hooks/social/usePostComposer";
import type { CreatePostRequest, SocialUser } from "../../types/social/social.types";

type Props = {
  // null = khách: bấm vào thì mời đăng nhập
  user: SocialUser | null;
  onSubmit: (request: CreatePostRequest) => Promise<unknown>;
};

// Thẻ "Bạn đang nghĩ gì?" đầu bảng tin: bấm vào mở modal tạo bài viết (giống Facebook).
// Bài nháp giữ ở đây nên đóng modal rồi mở lại vẫn còn
export default function PostComposer({ user, onSubmit }: Props) {
  const c = usePostComposer(onSubmit);
  const [open, setOpen] = useState(false);
  const [askLogin, setAskLogin] = useState(false);

  const draft = c.content.trim();
  const hasDraft = draft.length > 0 || c.hasMedia;

  const openComposer = () => (user ? setOpen(true) : setAskLogin(true));
  const quick = [
    { icon: ImagePlus, label: "Ảnh", className: "text-success" },
    { icon: Video, label: "Video", className: "text-primary-600" },
    { icon: Palette, label: "Nền màu", className: "text-[#5b86b8]" },
  ];

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center gap-3">
        {user ? (
          <Avatar src={user.avatarUrl} fullName={user.fullName} className="h-11 w-11 shrink-0 ring-2 ring-primary-100" />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <PenLine size={18} />
          </span>
        )}
        <button
          type="button"
          onClick={openComposer}
          aria-haspopup="dialog"
          className={`min-w-0 flex-1 truncate rounded-full border border-line bg-page px-5 py-3 text-left text-sm transition hover:border-primary-200 hover:bg-primary-50 ${
            draft ? "text-heading" : "text-muted"
          }`}
        >
          {draft || (hasDraft ? "Bài viết nháp có ảnh / video — bấm để tiếp tục" : user ? `${user.fullName} ơi, bạn đang nghĩ gì?` : "Bạn đang nghĩ gì?")}
        </button>
      </div>

      {/* Lối tắt: đều mở hộp soạn bài */}
      <div className="mt-3 flex items-center gap-1 border-t border-line pt-3">
        {quick.map(({ icon: Icon, label, className }) => (
          <button
            key={label}
            type="button"
            onClick={openComposer}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-body transition hover:bg-primary-50 hover:text-heading"
          >
            <Icon size={18} className={className} aria-hidden /> {label}
          </button>
        ))}
      </div>

      {open && user && <PostComposerModal user={user} composer={c} onClose={() => setOpen(false)} />}
      {askLogin && (
        <AuthRequiredModal message="Đăng nhập để đăng bài viết lên cộng đồng." onClose={() => setAskLogin(false)} />
      )}
    </div>
  );
}
