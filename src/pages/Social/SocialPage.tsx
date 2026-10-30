import { Lightbulb, MessagesSquare, Users } from "lucide-react";
import Breadcrumb from "../../components/common/Breadcrumb";
import { useToast } from "../../components/common/toastContext";
import { getErrorMessage } from "../../api";
import type { PostScope, SharePostRequest } from "../../types/social/social.types";
import PostComposer from "../../components/Social/PostComposer";
import PostModal from "../../components/Social/PostModal";
import SocialLeftSidebar from "../../components/Social/SocialLeftSidebar";
import SocialRightSidebar from "../../components/Social/SocialRightSidebar";
import PostFeed from "../../components/Social/feed/PostFeed";
import UserSearchBox from "../../components/Social/feed/UserSearchBox";
import ViewingUserBanner from "../../components/Social/feed/ViewingUserBanner";
import SocialPageSkeleton from "../../components/Social/skeleton/SocialPageSkeleton";
import { SOCIAL_GRID } from "../../components/Social/socialLayout";
import { usePostFromUrl } from "../../hooks/social/usePostFromUrl";
import { useSocialFeed } from "../../hooks/social/useSocialFeed";

const COMMUNITY_BANNER = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80";

const COMMUNITY_FEATURES = [
  { icon: MessagesSquare, title: "Thảo luận", desc: "Hỏi đáp về dự án", box: "bg-linear-to-br from-sky-400 to-sky-600", card: "hover:border-sky-200" },
  { icon: Lightbulb, title: "Kinh nghiệm", desc: "Chia sẻ góc nhìn", box: "bg-linear-to-br from-amber-400 to-orange-500", card: "hover:border-amber-200" },
  { icon: Users, title: "Kết nối", desc: "Gặp người cùng mối quan tâm", box: "bg-linear-to-br from-violet-400 to-fuchsia-500", card: "hover:border-violet-200" },
];

export default function SocialPage() {
  const feed = useSocialFeed();
  const toast = useToast();
  // Mở link chia sẻ /social?post=<mã> thì hiện modal của bài đó
  const linkedPost = usePostFromUrl();
  const { currentUser, viewUser } = feed;
  const viewingMe = viewUser !== null && viewUser.id === currentUser?.id;

  // Chủ bài đổi phạm vi bài của mình; báo kết quả bằng toast
  const changeScope = async (postId: number, scope: PostScope) => {
    try {
      await feed.updateScope(postId, scope);
      toast.show(scope === "PRIVATE" ? "Đã chuyển bài viết sang chỉ mình tôi" : "Đã chuyển bài viết sang công khai");
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    }
  };

  // Đăng bài chia sẻ; lỗi ném tiếp để modal chia sẻ giữ lời nhắn và hiện lỗi
  const sharePost = async (postId: number, request: SharePostRequest) => {
    await feed.sharePost(postId, request);
    toast.show("Đã chia sẻ bài viết lên trang của bạn");
  };

  return (
    <div className="min-h-screen bg-page">
      {/* Banner đầu trang: ảnh nền cộng đồng phủ navy, tiêu đề serif trắng, 3 ô tính năng kính mờ có icon màu */}
      <header className="relative isolate overflow-hidden bg-ink-900 text-white">
        <img src={COMMUNITY_BANNER} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" aria-hidden />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-ink-900/95 via-ink-900/70 to-ink-900/25" aria-hidden />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink-900/70 via-transparent to-transparent" aria-hidden />

        <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 md:pb-16">
          <div className="[&_a]:text-white/60 [&_a:hover]:text-white [&_nav]:text-white/60 [&_[aria-current]]:text-white">
            <Breadcrumb items={[{ label: "Trang chủ", to: "/" }, { label: "Cộng đồng" }]} />
          </div>
          <div className="mt-10 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-300">
                <span className="h-px w-10 bg-primary-300" aria-hidden /> Mạng lưới bất động sản
              </p>
              <h1 className="heading-display mt-4 text-4xl text-white md:text-6xl">Cộng đồng</h1>
              <p className="mt-4 max-w-xl text-white/75">
                Chia sẻ kinh nghiệm, hỏi đáp và kết nối với những người cùng quan tâm bất động sản.
              </p>
            </div>
            <ul className="grid grid-cols-3 gap-3">
              {COMMUNITY_FEATURES.map(({ icon: Icon, title, desc, box }) => (
                <li
                  key={title}
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/15 lg:w-40"
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md ${box}`}>
                    <Icon size={17} aria-hidden />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 hidden text-xs text-white/60 sm:block">{desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {/* Chờ xác định khách / người dùng + trang bài viết đầu tiên thì hiện khung 3 cột */}
      {!feed.authReady || !feed.initialized ? (
        <SocialPageSkeleton />
      ) : (
        <div className={SOCIAL_GRID}>
          <SocialLeftSidebar user={currentUser} activeId={feed.activeMenu} onSelect={feed.selectMenu} />

          <main className="mx-auto w-full max-w-2xl space-y-4">
            <UserSearchBox onSelect={feed.showUserPosts} />
            {viewUser && (
              <ViewingUserBanner user={viewUser} isMe={viewingMe} onBack={() => feed.showUserPosts(null)} />
            )}
            {/* Xem bài của người khác thì không đăng bài ở đây */}
            {(!viewUser || viewingMe) && <PostComposer user={currentUser} onSubmit={feed.createPost} />}
            <PostFeed
              onUserClick={feed.showUserPosts}
              onScopeChange={changeScope}
              onShare={sharePost}
              emptyMessage={viewUser ? "Chưa có bài viết nào." : undefined}
              posts={feed.posts}
              currentUser={currentUser}
              loading={feed.loading}
              loadingMore={feed.loadingMore}
              hasMore={feed.hasMore}
              error={feed.error}
              onRetry={feed.refetch}
              sentinelRef={feed.sentinelRef}
            />
          </main>

          <SocialRightSidebar />
        </div>
      )}

      {feed.authReady && linkedPost.post && (
        <PostModal post={linkedPost.post} currentUser={currentUser} onClose={linkedPost.close} />
      )}
    </div>
  );
}
