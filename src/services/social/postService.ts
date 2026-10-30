import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type {
  CreatePostRequest,
  PostReactionResponse,
  PostResponse,
  PostScope,
  SharePostRequest,
} from "../../types/social/social.types";

const withImages = (post: PostResponse): PostResponse => ({
  ...post,
  imageUrls: post.imageUrls ?? [],
  videoUrl: post.videoUrl ?? null,
  scope: post.scope ?? "PUBLIC",
  sharedPostId: post.sharedPostId ?? null,
  sharedPost: post.sharedPost ? withImages(post.sharedPost) : null,
  shareCount: post.shareCount ?? 0,
  background: post.background ?? null,
});

// Khách đọc được bài viết / lượt thích; vẫn dùng authHttp để có token thì BE trả đúng "tôi đã thích chưa"
class PostService extends BaseService {
  constructor() {
    super("/posts");
  }

  // GET /posts?page=&size=&userId= (mới nhất trước); có userId thì chỉ lấy bài của người đó
  async getPosts(page = 0, size = 10, userId?: number): Promise<PageResponse<PostResponse>> {
    const res = toPage(await this.getPage<PostResponse>({ page, size, userId }));
    return { ...res, content: res.content.map(withImages) };
  }

  // GET /posts/{id}
  async getPost(id: number): Promise<PostResponse> {
    return withImages(await this.getById<PostResponse>(id));
  }

  // POST /posts (multipart: content, images[], video, scope, backgroundId) — cần ít nhất nội dung, 1 ảnh hoặc video
  async createPost({ content, images = [], video, scope = "PUBLIC", backgroundId }: CreatePostRequest): Promise<PostResponse> {
    const form = new FormData();
    form.append("scope", scope);
    if (backgroundId != null) form.append("backgroundId", String(backgroundId));
    const text = content?.trim();
    if (text) form.append("content", text);
    images.forEach((file) => form.append("images", file));
    if (video) form.append("video", video);
    return withImages(await this.http.post<PostResponse>(this.url(), form));
  }

  // POST /posts/{id}/share (JSON: content, scope) — tạo bài chia sẻ nhúng bài gốc, giống Facebook
  async sharePost(postId: number, { content, scope = "PUBLIC" }: SharePostRequest): Promise<PostResponse> {
    const text = content?.trim();
    return withImages(await this.http.post<PostResponse>(this.url(postId, "share"), { content: text || undefined, scope }));
  }

  // PATCH /posts/{id}/scope — chỉ người đăng đổi được phạm vi bài của mình
  async updateScope(postId: number, scope: PostScope): Promise<PostResponse> {
    return withImages(await this.http.patch<PostResponse>(this.url(postId, "scope"), { scope }));
  }

  // GET /posts/{id}/reactions — tổng lượt thích + tôi đã thích chưa
  async getReaction(postId: number): Promise<PostReactionResponse> {
    return this.http.get<PostReactionResponse>(this.url(postId, "reactions"));
  }

  // POST /posts/{id}/reactions — bật/tắt thích
  async toggleLike(postId: number): Promise<PostReactionResponse> {
    return this.http.post<PostReactionResponse>(this.url(postId, "reactions"), undefined, { silentLoading: true });
  }
}

const postService = new PostService();
export default postService;
