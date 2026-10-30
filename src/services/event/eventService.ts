import BaseService from "../base/BaseService";
import { authHttp, toPage } from "../../api/http";
import { EVENT_SORT_PARAM } from "../../types/event/event.types";
import type {
  CommentEventRequest,
  Event,
  EventComment,
  EventFilter,
  EventImage,
  EventMember,
  EventRequest,
  EventSort,
  EventStatus,
  PageResponse,
} from "../../types/event/event.types";

export interface GetEventsParams {
  filter: EventFilter;
  sort: EventSort;
  page: number;
  size: number;
}

const withImages = (event: Event): Event => ({
  ...event,
  images: event.images ?? [],
});

// Gom request + ảnh vào FormData cho @ModelAttribute + @RequestPart("images")
const toFormData = (request: EventRequest, images: File[] = []): FormData => {
  const form = new FormData();
  Object.entries(request).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, String(value));
  });
  images.forEach((file) => form.append("images", file));
  return form;
};

/**
 Đọc (danh sách, chi tiết, bình luận) dùng publicHttp → khách vẫn xem được.
 Ghi (tạo/sửa/xoá, tham gia, bình luận, thành viên) dùng authHttp → gắn token, 401 tự refresh.
 */
class EventService extends BaseService {
  private readonly authed = authHttp;

  constructor() {
    super("/events", { auth: false });
  }

  // SỰ KIỆN
  // GET /events?keyword=&status=&page=&size=&sort=
  async getEvents({
    filter,
    sort,
    page,
    size,
  }: GetEventsParams): Promise<PageResponse<Event>> {
    const res = await this.getPage<Event>({
      keyword: filter.keyword.trim(),
      status: filter.status,
      page,
      size,
      sort: EVENT_SORT_PARAM[sort],
    });
    return toPage(res);
  }

  // Sự kiện mới đăng cho sidebar trang Cộng đồng
  async getLatestEvents(limit = 5): Promise<Event[]> {
    const page = await this.getEvents({
      filter: { keyword: "", status: "" },
      sort: "NEWEST",
      page: 0,
      size: limit,
    });
    return page.content.map(withImages);
  }

  // GET /events/{id}
  async getEventById(id: number): Promise<Event> {
    return withImages(await this.getById<Event>(id));
  }

  // POST /events (multipart)
  async createEvent(
    request: EventRequest,
    images: File[] = []
  ): Promise<Event> {
    return withImages(
      await this.authed.post<Event>(this.url(), toFormData(request, images))
    );
  }

  // PUT /events/{id}
  async updateEvent(id: number, request: EventRequest): Promise<Event> {
    return withImages(await this.authed.put<Event>(this.url(id), request));
  }

  // PUT /events/{id}/status
  async updateStatus(id: number, status: EventStatus): Promise<Event> {
    return withImages(
      await this.authed.put<Event>(this.url(id, "status"), { status })
    );
  }

  // DELETE /events/{id}
  async deleteEvent(id: number): Promise<void> {
    await this.authed.delete(this.url(id));
  }

  // ẢNH
  // POST /events/{id}/images (multipart)
  async addImages(id: number, images: File[]): Promise<EventImage[]> {
    const form = new FormData();
    images.forEach((file) => form.append("images", file));
    return (
      (await this.authed.post<EventImage[] | null>(
        this.url(id, "images"),
        form
      )) ?? []
    );
  }

  // DELETE /events/{id}/images/{imageId}
  async deleteImage(id: number, imageId: number): Promise<void> {
    await this.authed.delete(this.url(id, "images", imageId));
  }

  // THÀNH VIÊN
  // POST /events/{id}/join
  async joinEvent(id: number): Promise<EventMember> {
    return this.authed.post<EventMember>(this.url(id, "join"));
  }

  // DELETE /events/{id}/join
  async leaveEvent(id: number): Promise<void> {
    await this.authed.delete(this.url(id, "join"));
  }

  // GET /events/{id}/members
  async getMembers(id: number): Promise<EventMember[]> {
    return (
      (await this.authed.get<EventMember[] | null>(this.url(id, "members"))) ??
      []
    );
  }

  //  BÌNH LUẬN
  // GET /events/{id}/comments
  async getComments(
    eventId: number,
    page = 0,
    size = 10
  ): Promise<PageResponse<EventComment>> {
    const res = await this.getPage<EventComment>(
      { page, size, sort: "createdAt,desc" },
      `${eventId}/comments`
    );
    return toPage(res);
  }

  // POST /events/{id}/comments
  async addComment(
    eventId: number,
    request: CommentEventRequest
  ): Promise<EventComment> {
    return this.authed.post<EventComment>(
      this.url(eventId, "comments"),
      request,
      { silentLoading: true }
    );
  }

  // DELETE /events/{id}/comments/{commentId}
  async deleteComment(eventId: number, commentId: number): Promise<void> {
    await this.authed.delete(this.url(eventId, "comments", commentId));
  }
}

const eventService = new EventService();
export default eventService;
