import PostImageGrid from "../../Social/PostImageGrid";
import PostContent from "../../Social/post/PostContent";
import PostHeader from "../../Social/post/PostHeader";
import PostVideo from "../../Social/post/PostVideo";
import type { PostScope, SocialUser } from "../../../types/social/social.types";

type Props = {
  title?: string;
  author: SocialUser;
  createdAt: string;
  scope: PostScope;
  content: string; // chữ thuần hoặc HTML; rỗng thì không hiện phần chữ
  images: string[];
  videoSrc: string | null;
  hidden?: boolean; // bài đang ẩn: không hiện trên bảng tin
};

// Xem trước một bài đúng như trên trang cộng đồng (cùng header, nội dung, video, lưới ảnh), không có thích / bình luận
export default function PostPreview({ title, author, createdAt, scope, content, images, videoSrc, hidden }: Props) {
  const empty = !content && images.length === 0 && !videoSrc;

  return (
    <div>
      {(title || hidden) && (
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-footer">
          {title}
          {hidden && <span className="rounded-full bg-line px-2 py-0.5 text-[11px] font-semibold text-body">Đang ẩn khỏi bảng tin</span>}
        </p>
      )}
      <div className="rounded-xl bg-gray-100 p-3">
        <article className="rounded-xl bg-white p-4 shadow-sm">
          <PostHeader user={author} createdAt={createdAt} scope={scope} />
          {empty ? (
            <p className="py-6 text-center text-sm italic text-muted">Bài viết chưa có nội dung, ảnh hay video.</p>
          ) : (
            <>
              <PostContent content={content} />
              <PostVideo src={videoSrc} />
              {images.length > 0 && (
                <div className="mb-1">
                  <PostImageGrid images={images} />
                </div>
              )}
            </>
          )}
        </article>
      </div>
    </div>
  );
}
