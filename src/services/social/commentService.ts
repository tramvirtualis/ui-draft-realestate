import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type { CommentResponse, CreateCommentRequest } from "../../types/social/social.types";

// Khách đọc được bình luận; viết bình luận cần đăng nhập → dùng authHttp (mặc định của BaseService)
class CommentService extends BaseService {
  constructor() {
    super("/comments");
  }

  // GET /comments/post/{postId}?page=&size= — bình luận gốc, cũ nhất trước
  async getCommentsByPost(postId: number, page = 0, size = 10): Promise<PageResponse<CommentResponse>> {
    return toPage(await this.getPage<CommentResponse>({ page, size }, `post/${postId}`));
  }

  // GET /comments/{commentId}/replies?page=&size=
  async getReplies(commentId: number, page = 0, size = 10): Promise<PageResponse<CommentResponse>> {
    return toPage(await this.getPage<CommentResponse>({ page, size }, `${commentId}/replies`));
  }

  // POST /comments — có parentId là trả lời bình luận
  async createComment(request: CreateCommentRequest): Promise<CommentResponse> {
    // Ô bình luận tự hiện trạng thái gửi → không bật lớp loading toàn màn hình
    return this.http.post<CommentResponse>(this.url(), request, { silentLoading: true });
  }
}

const commentService = new CommentService();
export default commentService;
