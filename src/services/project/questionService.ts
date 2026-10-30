import BaseService from "../base/BaseService";
import { authHttp, toPage } from "../../api/http";
import type { QuestionDto } from "../../types/project/project.types";

const LIST_SIZE = 1000;

export interface QuestionInput {
  question: string;
  answer: string;
}

// Đọc công khai; thêm / sửa / xóa chỉ ADMIN (JSON)
class QuestionService extends BaseService {
  constructor() {
    super("/questions", { auth: false });
  }

  // GET /questions?projectId=
  async list(projectId: number): Promise<QuestionDto[]> {
    return toPage(await this.getPage<QuestionDto>({ projectId, size: LIST_SIZE, sort: "createdAt,desc" })).content;
  }

  // Số câu hỏi của từng dự án (hiển thị trong bộ chọn)
  async counts(): Promise<Record<number, number>> {
    const all = toPage(await this.getPage<QuestionDto>({ size: LIST_SIZE })).content;
    const out: Record<number, number> = {};
    all.forEach((q) => (out[q.projectId] = (out[q.projectId] ?? 0) + 1));
    return out;
  }

  // POST /questions
  async add(projectId: number, input: QuestionInput): Promise<QuestionDto> {
    return authHttp.post<QuestionDto>(this.url(), { projectId, question: input.question.trim(), answer: input.answer.trim() || null });
  }

  // PUT /questions/{id}
  async edit(id: number, projectId: number, input: QuestionInput): Promise<QuestionDto> {
    return authHttp.put<QuestionDto>(this.url(id), { projectId, question: input.question.trim(), answer: input.answer.trim() || null });
  }

  // DELETE /questions/{id}
  async remove(id: number): Promise<void> {
    await authHttp.delete(this.url(id));
  }
}

export const questionService = new QuestionService();
