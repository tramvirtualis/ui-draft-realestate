import { Lock } from "lucide-react";
import PostImageGrid from "../PostImageGrid";
import PostBackgroundText from "./PostBackgroundText";
import PostContent from "./PostContent";
import PostHeader from "./PostHeader";
import PostVideo from "./PostVideo";
import type { SocialPost, SocialUser } from "../../../types/social/social.types";

type Props = {
  // null = bài gốc đã bị ẩn / chuyển riêng tư
  post: SocialPost | null;
  // Có thì bấm ảnh sẽ mở bài gốc (modal bình luận của bài gốc)
  onImageClick?: (index: number) => void;
  onUserClick?: (user: SocialUser) => void;
  // false: hiện đủ nội dung (trong modal bài viết)
  collapsible?: boolean;
};

// Bài gốc nhúng bên trong bài chia sẻ, giống Facebook: khung viền, ảnh tràn mép trên, người đăng + nội dung bên dưới
export default function SharedPostEmbed({ post, onImageClick, onUserClick, collapsible = true }: Props) {
  if (!post) {
    return (
      <div className="mb-3 flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <Lock size={20} className="mt-0.5 shrink-0 text-gray-500" />
        <div>
          <p className="text-sm font-semibold text-gray-800">Nội dung này hiện không hiển thị</p>
          <p className="text-xs text-gray-500">
            Có thể người đăng đã chuyển bài viết sang chỉ mình tôi hoặc bài viết đã bị gỡ.
          </p>
        </div>
      </div>
    );
  }

  const hasMedia = post.imageUrls.length > 0 || post.videoUrl;

  return (
    <div className="mb-3 overflow-hidden rounded-lg border border-gray-200">
      {hasMedia && (
        // Bỏ bo góc / lề dưới của video & lưới ảnh để ảnh tràn sát khung như Facebook
        <div className="[&>*]:mb-0 [&>*]:rounded-none">
          <PostVideo src={post.videoUrl} />
          <PostImageGrid images={post.imageUrls} onImageClick={onImageClick} />
        </div>
      )}
      <div className={`px-4 pt-3 ${hasMedia ? "border-t border-gray-200" : ""}`}>
        <PostHeader user={post.user} createdAt={post.createdAt} scope={post.scope} onUserClick={onUserClick} />
        {post.background ? (
          <PostBackgroundText background={post.background} content={post.content} />
        ) : (
          <PostContent content={post.content} collapsible={collapsible} />
        )}
      </div>
    </div>
  );
}
