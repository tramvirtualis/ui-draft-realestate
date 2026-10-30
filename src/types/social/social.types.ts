// Khớp AuthorResponse bên BE
export interface AuthorResponse {
  id: number;
  fullName: string | null;
  avatarUrl: string | null;
}

// Khớp PostScope bên BE: PUBLIC ai cũng xem, PRIVATE chỉ người đăng xem
export type PostScope = "PUBLIC" | "PRIVATE";

export const POST_SCOPE = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
} as const;

export const POST_SCOPE_LABEL: Record<PostScope, string> = {
  PUBLIC: "Công khai",
  PRIVATE: "Chỉ mình tôi",
};

// Khớp PostBackgroundResponse bên BE: màu nền cho bài chỉ có chữ (giống Facebook)
export interface PostBackground {
  id: number;
  name: string;
  // Giá trị CSS background: mã màu hoặc gradient
  value: string;
  textColor: string;
}

// Khớp AdminPostBackgroundResponse bên BE (trang quản trị)
export interface AdminPostBackground extends PostBackground {
  sortOrder: number;
  active: boolean;
  // Số bài đang dùng; > 0 thì không xóa được, chỉ tắt
  usageCount: number;
  createdAt: string;
}

// Khớp PostBackgroundRequest bên BE
export interface PostBackgroundInput {
  name: string;
  value: string;
  textColor: string;
  active?: boolean;
}

// Khớp PostResponse bên BE
export interface PostResponse {
  id: number;
  author: AuthorResponse;
  content: string | null;
  imageUrls: string[];
  videoUrl: string | null;
  scope: PostScope;
  createdAt: string;
  // Bài chia sẻ: id bài gốc; null = bài thường
  sharedPostId: number | null;
  // Bài gốc nhúng bên trong; sharedPostId có mà sharedPost null = bài gốc đã bị ẩn / chuyển riêng tư
  sharedPost: PostResponse | null;
  shareCount: number;
  // Màu nền của bài chỉ có chữ; null = bài thường
  background: PostBackground | null;
}

// Khớp PostShareRequest bên BE
export interface SharePostRequest {
  content?: string;
  scope?: PostScope;
}

// Khớp AdminPostResponse bên BE (trang quản trị): thêm trạng thái ẩn/hiện
export interface AdminPost extends Omit<PostResponse, "sharedPost" | "shareCount" | "background"> {
  active: boolean;
  // Ảnh kèm id để trang sửa biết ảnh nào cần xóa
  images: AdminPostImage[];
}

// Khớp AdminPostImageResponse bên BE
export interface AdminPostImage {
  id: number;
  imageUrl: string;
}

// Khớp AdminPostStatsResponse bên BE
export interface AdminPostStats {
  all: number;
  publicPosts: number;
  privatePosts: number;
  hidden: number;
}

// Khớp CommentResponse bên BE
export interface CommentResponse {
  id: number;
  postId: number;
  parentId: number | null;
  author: AuthorResponse;
  content: string;
  replyCount: number;
  createdAt: string;
}

// Khớp CommentCreateRequest bên BE
export interface CreateCommentRequest {
  postId: number;
  parentId?: number | null;
  content: string;
}

// Khớp PostReactionResponse bên BE
export interface PostReactionResponse {
  postId: number;
  likeCount: number;
  liked: boolean;
}

export interface CreatePostRequest {
  content?: string;
  images?: File[];
  video?: File | null;
  scope?: PostScope;
  // Màu nền (chỉ cho bài chỉ có chữ, không kèm ảnh / video)
  backgroundId?: number | null;
}

export interface SocialUser {
  id: number;
  fullName: string;
  avatarUrl?: string | null;
}

export interface SocialComment {
  id: number;
  parentId: number | null;
  user: SocialUser;
  content: string;
  replyCount: number;
  createdAt: string;
}

// Dạng bài viết mà UI hiển thị (đã gắn thông tin người đăng)
export interface SocialPost {
  id: number;
  user: SocialUser;
  content: string;
  imageUrls: string[];
  videoUrl: string | null;
  scope: PostScope;
  createdAt: string;
  sharedPostId: number | null;
  sharedPost: SocialPost | null;
  shareCount: number;
  background: PostBackground | null;
}

export const toSocialUser = (author: AuthorResponse): SocialUser => ({
  id: author.id,
  fullName: author.fullName ?? "Người dùng",
  avatarUrl: author.avatarUrl,
});

export const toSocialPost = (post: PostResponse): SocialPost => ({
  id: post.id,
  user: toSocialUser(post.author),
  content: post.content ?? "",
  imageUrls: post.imageUrls,
  videoUrl: post.videoUrl,
  scope: post.scope,
  createdAt: post.createdAt,
  sharedPostId: post.sharedPostId,
  sharedPost: post.sharedPost && toSocialPost(post.sharedPost),
  shareCount: post.shareCount,
  background: post.background,
});

export const toSocialComment = (c: CommentResponse): SocialComment => ({
  id: c.id,
  parentId: c.parentId,
  user: toSocialUser(c.author),
  content: c.content,
  replyCount: c.replyCount,
  createdAt: c.createdAt,
});

// Giới hạn khớp PostServiceImpl / CommentServiceImpl bên BE
export const POST_MAX_IMAGES = 10;
export const POST_MAX_CONTENT_LENGTH = 1000;
export const COMMENT_MAX_CONTENT_LENGTH = 500;
// Bài có màu nền: chữ to giữa khung nên giới hạn ngắn (khớp MAX_BACKGROUND_CONTENT_LENGTH bên BE)
export const POST_BACKGROUND_MAX_CONTENT_LENGTH = 130;
// Khớp CloudinaryServiceImpl.uploadVideo bên BE
export const POST_MAX_VIDEO_SIZE = 20 * 1024 * 1024;
export const POST_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
