import type { RefCallback } from "react";
import { Loader2 } from "lucide-react";
import PostCard from "../PostCard";
import PostCardSkeleton from "../skeleton/PostCardSkeleton";
import type { PostScope, SharePostRequest, SocialPost, SocialUser } from "../../../types/social/social.types";

type Props = {
  posts: SocialPost[];
  currentUser: SocialUser | null;
  loading: boolean;
  loadingMore: boolean;
  // false: đã tải hết bài, hiện dòng "đã xem hết" ở cuối danh sách
  hasMore?: boolean;
  error: string | null;
  onRetry: () => void;
  sentinelRef: RefCallback<HTMLDivElement>;
  onUserClick?: (user: SocialUser) => void;
  // Chủ bài đổi phạm vi bài của mình (công khai / riêng tư)
  onScopeChange?: (postId: number, scope: PostScope) => Promise<void>;
  // Đăng bài chia sẻ (modal chia sẻ của từng bài)
  onShare?: (postId: number, request: SharePostRequest) => Promise<unknown>;
  // Đang xem bài của 1 người: đổi câu báo khi chưa có bài nào
  emptyMessage?: string;
};

// Bảng tin: đang tải / lỗi + thử lại / trống / danh sách bài + tải thêm khi cuộn
export default function PostFeed({
  posts,
  currentUser,
  loading,
  loadingMore,
  hasMore = true,
  error,
  onRetry,
  sentinelRef,
  onUserClick,
  onScopeChange,
  onShare,
  emptyMessage = "Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!",
}: Props) {
  return (
    <>
      {loading ? (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton withMedia={false} />
        </>
      ) : error && posts.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-danger">{error}</p>
          <button
            onClick={onRetry}
            className="mt-3 rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            Thử lại
          </button>
        </div>
      ) : posts.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          {emptyMessage}
        </p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onUserClick={onUserClick}
            onScopeChange={onScopeChange}
            onShare={onShare}
          />
        ))
      )}

      <div ref={sentinelRef} />
      {loadingMore && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500" role="status">
          <Loader2 size={22} className="animate-spin text-primary-600" aria-hidden />
          Đang tải thêm bài viết...
        </div>
      )}
      {!loading && !loadingMore && !hasMore && posts.length > 0 && (
        <p className="flex items-center gap-3 py-4 text-sm text-gray-500" role="status">
          <span className="h-px flex-1 bg-gray-200" aria-hidden />
          Bạn đã xem hết bài đăng
          <span className="h-px flex-1 bg-gray-200" aria-hidden />
        </p>
      )}
    </>
  );
}
