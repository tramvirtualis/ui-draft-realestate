import BaseService from "../base/BaseService";
import type { AuthorResponse } from "../../types/social/social.types";

// GET /social/users/search — tìm người dùng theo tên cho ô tìm kiếm trang Cộng đồng, khách cũng dùng được
class SocialUserService extends BaseService {
  constructor() {
    super("/social/users", { auth: false });
  }

  search(keyword: string, size = 8): Promise<AuthorResponse[]> {
    return this.getList<AuthorResponse>({ keyword, size }, "search");
  }
}

const socialUserService = new SocialUserService();
export default socialUserService;
