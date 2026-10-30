import BaseService from "../base/BaseService";
import type { CvData, CvStyle } from "../../types/job/cv.types";

/** Bản nháp CV lưu trên tài khoản (BE lưu nguyên JSON, FE quản lý cấu trúc) */
export interface RemoteCvDraft {
  data: CvData;
  style: CvStyle;
  /** Lúc người dùng lưu (ISO, UTC) */
  savedAt: string;
}

/** Bản nháp CV đang soạn ở trang Tạo CV của người đang đăng nhập: /me/cv-draft */
class CvDraftService extends BaseService {
  constructor() {
    super("/me/cv-draft");
  }

  // GET /me/cv-draft → null nếu chưa có
  async get(): Promise<RemoteCvDraft | null> {
    return (await this.http.get<RemoteCvDraft | null>(this.url())) ?? null;
  }

  // PUT /me/cv-draft: tạo mới hoặc ghi đè
  save(draft: RemoteCvDraft): Promise<RemoteCvDraft> {
    // Tự lưu nháp ngầm (debounce) → không bật lớp loading
    return this.http.put<RemoteCvDraft>(this.url(), draft, { silentLoading: true });
  }

  // DELETE /me/cv-draft
  async remove(): Promise<void> {
    await this.http.delete(this.url(), { silentLoading: true });
  }
}

const cvDraftService = new CvDraftService();
export default cvDraftService;
