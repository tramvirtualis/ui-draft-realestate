import { PenLine, UserRound } from "lucide-react";
import Avatar from "../../common/Avatar";
import type { SocialUser } from "../../../types/social/social.types";

type Props = {
  user: SocialUser;
  // Bấm vào thẻ: xem các bài viết của mình
  onClick?: () => void;
};

// Thẻ hồ sơ ở cột trái: dải bìa navy có quầng vàng, avatar đè mép bìa, tên + nút xem trang cá nhân
export default function UserCard({ user, onClick }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="relative h-16 bg-linear-to-r from-ink-900 via-indigo-900 to-violet-800">
        <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgba(251,191,36,0.45),transparent_65%)]" aria-hidden />
      </div>
      <div className="px-4 pb-4">
        <Avatar src={user.avatarUrl} fullName={user.fullName} className="relative z-10 -mt-8 h-16 w-16 text-lg ring-4 ring-white" />
        <p className="mt-2 truncate font-semibold text-heading">{user.fullName}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <PenLine size={12} className="text-violet-500" /> Thành viên cộng đồng
        </p>
        <button
          type="button"
          onClick={onClick}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-500 hover:text-white"
        >
          <UserRound size={14} /> Trang cá nhân
        </button>
      </div>
    </div>
  );
}
