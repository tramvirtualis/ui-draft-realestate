import CommentModal from "./CommentModal";
import PostActions from "./PostActions";
import PostImageGrid from "./PostImageGrid";
import PostModal from "./PostModal";
import ShareModal from "./ShareModal";
import PostBackgroundText from "./post/PostBackgroundText";
import PostContent from "./post/PostContent";
import PostHeader from "./post/PostHeader";
import PostVideo from "./post/PostVideo";
import SharedPostEmbed from "./post/SharedPostEmbed";
import { usePostCard } from "../../hooks/social/usePostCard";
import type { PostScope, SharePostRequest, SocialPost, SocialUser } from "../../types/social/social.types";

type Props = {
  post: SocialPost;
  // null = khách
  currentUser: SocialUser | null;
  onUserClick?: (user: SocialUser) => void;
  // Đổi phạm vi bài; chỉ chủ bài mới thấy nút này
  onScopeChange?: (postId: number, scope: PostScope) => Promise<void>;
  // Đăng bài chia sẻ từ modal chia sẻ
  onShare?: (postId: number, request: SharePostRequest) => Promise<unknown>;
};

export default function PostCard({ post, currentUser, onUserClick, onScopeChange, onShare }: Props) {
  const card = usePostCard(post.id, currentUser === null);
  const isOwner = currentUser !== null && post.user.id === currentUser.id;
  const isShare = post.sharedPostId !== null;

  return (
    <article className="rounded-2xl border border-line bg-white p-4">
      <PostHeader
        user={post.user}
        createdAt={post.createdAt}
        scope={post.scope}
        action={isShare ? "đã chia sẻ một bài viết" : undefined}
        onUserClick={onUserClick}
        onScopeChange={isOwner && onScopeChange ? (scope) => onScopeChange(post.id, scope) : undefined}
      />
      {post.background ? (
        <PostBackgroundText background={post.background} content={post.content} />
      ) : (
        <PostContent content={post.content} />
      )}
      <PostVideo src={post.videoUrl} />
      {post.imageUrls.length > 0 && (
        <div className="mb-3">
          <PostImageGrid images={post.imageUrls} onImageClick={card.openImage} />
        </div>
      )}
      {isShare && (
        <SharedPostEmbed post={post.sharedPost} onImageClick={card.openSharedImage} onUserClick={onUserClick} />
      )}

      <PostActions
        likeCount={card.likeCount}
        commentCount={card.thread.total}
        shareCount={post.shareCount}
        liked={card.liked}
        onToggleLike={card.toggleLike}
        onComment={card.openComments}
        onShare={card.openShare}
      />

      {card.commentsOpen && (
        <CommentModal
          post={post}
          startIndex={card.startIndex}
          currentUser={currentUser}
          liked={card.liked}
          likeCount={card.likeCount}
          onToggleLike={card.toggleLike}
          thread={card.thread}
          onClose={card.closeComments}
        />
      )}
      {card.sharedImageIndex !== null && post.sharedPost && (
        <PostModal
          post={post.sharedPost}
          startIndex={card.sharedImageIndex}
          currentUser={currentUser}
          onClose={card.closeSharedPost}
        />
      )}
      {card.shareOpen && (
        <ShareModal post={post} currentUser={currentUser} onShare={onShare} onClose={card.closeShare} />
      )}
    </article>
  );
}
