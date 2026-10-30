import { ArrowLeft, FileText, UserRound } from "lucide-react";
import Avatar from "../../common/Avatar";
import type { SocialUser } from "../../../types/social/social.types";

type Props = {
  user: SocialUser;
  isMe: boolean;
  onBack: () => void;
};

// Header trang cá nhân khi bảng tin đang lọc theo bài của 1 người: bìa navy có quầng vàng + lưới mờ,
// avatar lớn đè mép bìa, tên + nhãn, nút quay về bảng tin
export default function ViewingUserBanner({ user, isMe, onBack }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="relative h-28 bg-linear-to-r from-ink-900 via-indigo-900 to-violet-800 md:h-32">
        <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgba(232,185,58,0.5),transparent_60%)]" aria-hidden />
        <span
          className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:28px_28px]"
          aria-hidden
        />
        <button
          type="button"
          onClick={onBack}
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-white/20"
        >
          <ArrowLeft size={14} /> Bảng tin
        </button>
      </div>
      <div className="flex flex-wrap items-end gap-4 px-5 pb-5">
        <Avatar src={user.avatarUrl} fullName={user.fullName} className="relative z-10 -mt-10 h-20 w-20 shrink-0 text-2xl ring-4 ring-white md:-mt-12 md:h-24 md:w-24" />
        <div className="min-w-0 flex-1 pb-1">
          <h2 className="heading-display truncate text-2xl text-heading md:text-3xl">{user.fullName}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <UserRound size={13} className="text-violet-500" /> {isMe ? "Trang của bạn" : "Trang cá nhân"}
            </span>
            <span className="flex items-center gap-1.5">
              <FileText size={13} className="text-sky-500" /> Bài viết đã đăng
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
