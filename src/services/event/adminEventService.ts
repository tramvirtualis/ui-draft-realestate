import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type {
  Event,
  EventComment,
  EventImage,
  EventMember,
  EventRequest,
  EventStatus,
  PageResponse,
} from "../../types/event/event.types";

export interface AdminEventQuery {
  keyword: string;
  status: EventStatus | "";
  page: number;
  size: number;
}

const withImages = (event: Event): Event => ({
  ...event,
  images: event.images ?? [],
});

// Gom request + ảnh vào FormData cho @ModelAttribute + @RequestPart("images")
const toFormData = (request: EventRequest, images: File[]): FormData => {
  const form = new FormData();
  Object.entries(request).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, String(value));
  });
  images.forEach((file) => form.append("images", file));
  return form;
};

// Quản trị sự kiện: /admin/events
class AdminEventService extends BaseService {
  constructor() {
    super("/admin/events");
  }

  // GET /admin/events?keyword=&status=&page=&size=&sort=
  async search({
    keyword,
    status,
    page,
    size,
  }: AdminEventQuery): Promise<PageResponse<Event>> {
    const res = await this.getPage<Event>({
      keyword: keyword.trim(),
      status,
      page,
      size,
      sort: "startTime,desc",
    });
    const p = toPage(res);
    return { ...p, content: p.content.map(withImages) };
  }

  // Số sự kiện theo trạng thái ("" = tất cả), lấy từ totalElements
  async count(status: EventStatus | ""): Promise<number> {
    return toPage(await this.getPage<Event>({ status, page: 0, size: 1 }))
      .totalElements;
  }

  // GET /admin/events/{id}
  async get(id: number): Promise<Event> {
    return withImages(await this.getById<Event>(id));
  }

  // POST /admin/events (multipart: các trường EventRequest + images)
  async add(request: EventRequest, images: File[] = []): Promise<Event> {
    return withImages(
      await this.http.post<Event>(this.url(), toFormData(request, images))
    );
  }

  // PUT /admin/events/{id} (JSON)
  async edit(id: number, request: EventRequest): Promise<Event> {
    return withImages(await this.update<Event, EventRequest>(id, request));
  }

  // PUT /admin/events/{id}/status
  async setStatus(id: number, status: EventStatus): Promise<Event> {
    return withImages(
      await this.http.put<Event>(this.url(id, "status"), { status })
    );
  }

  // DELETE /admin/events/{id}
  async remove(id: number): Promise<void> {
    await this.delete(id);
  }

  // POST /admin/events/{id}/images (multipart)
  async addImages(id: number, images: File[]): Promise<EventImage[]> {
    const form = new FormData();
    images.forEach((file) => form.append("images", file));
    return (
      (await this.http.post<EventImage[] | null>(
        this.url(id, "images"),
        form
      )) ?? []
    );
  }

  // DELETE /admin/events/{id}/images/{imageId}
  async removeImage(id: number, imageId: number): Promise<void> {
    await this.http.delete(this.url(id, "images", imageId));
  }

  // GET /admin/events/{id}/members
  async getMembers(id: number): Promise<EventMember[]> {
    return (
      (await this.http.get<EventMember[] | null>(this.url(id, "members"))) ?? []
    );
  }

  // GET /admin/events/{id}/comments?page=&size=
  async getComments(
    id: number,
    page = 0,
    size = 20
  ): Promise<PageResponse<EventComment>> {
    return toPage(
      await this.getPage<EventComment>(
        { page, size, sort: "createdAt,desc" },
        `${id}/comments`
      )
    );
  }

  // DELETE /admin/events/{id}/comments/{commentId}
  async removeComment(id: number, commentId: number): Promise<void> {
    await this.http.delete(this.url(id, "comments", commentId));
  }
}

export const adminEventService = new AdminEventService();
