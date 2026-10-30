import { authHttp, cleanParams, publicHttp } from "../../api";
import type { PageResponse } from "../../types/common.types";

export type QueryParams = Record<string, string | number | boolean | null | undefined>;
type Id = string | number;
type Http = typeof publicHttp;

interface BaseServiceOptions {
  // true: dùng authHttp (gắn token, 401 → refresh). false: publicHttp
  auth?: boolean;
}

/**
 Service CRUD dùng chung, mỗi resource extends 1 lần với endpoint gốc:
   class EventService extends BaseService { constructor() { super("/events"); } }

 - http đã bóc ApiResponse { success, code, message, data } → hàm trả thẳng data.
 - Lỗi 4xx/5xx axios tự throw → không cần check code/success, không throw là thành công.
   Bên gọi dùng getErrorMessage(err) để lấy message tiếng Việt từ BE.
 - Endpoint đặc thù (join, comments...) thì viết thêm method trong class con, dùng this.http + this.url().
 */
class BaseService {
  protected readonly baseUrl: string;
  protected readonly http: Http;

  constructor(baseUrl: string, { auth = true }: BaseServiceOptions = {}) {
    this.baseUrl = baseUrl;
    this.http = auth ? authHttp : publicHttp;
  }

  // Nối đường dẫn con: url(5, "comments") → /events/5/comments
  protected url(...parts: Array<Id | undefined>): string {
    const rest = parts.filter((p) => p !== undefined && p !== "");
    return [this.baseUrl, ...rest].join("/");
  }

  async getList<T>(params?: QueryParams, path?: string): Promise<T[]> {
    const data = await this.http.get<T[] | null>(this.url(path), {
      params: params && cleanParams(params),
    });
    return data ?? [];
  }

  async getPage<T>(params?: QueryParams, path?: string): Promise<PageResponse<T>> {
    return this.http.get<PageResponse<T>>(this.url(path), {
      params: params && cleanParams(params),
    });
  }

  async getById<T>(id: Id, params?: QueryParams): Promise<T> {
    return this.http.get<T>(this.url(id), {
      params: params && cleanParams(params),
    });
  }

  async create<T, TData = unknown>(data: TData, path?: string): Promise<T> {
    return this.http.post<T>(this.url(path), data);
  }

  async update<T, TData = unknown>(id: Id, data: TData): Promise<T> {
    return this.http.put<T>(this.url(id), data);
  }

  async patch<T, TData = unknown>(id: Id, data: TData): Promise<T> {
    return this.http.patch<T>(this.url(id), data);
  }

  async delete(id: Id): Promise<void> {
    await this.http.delete(this.url(id));
  }

  // Xoá nhiều / xoá theo điều kiện: gửi body trong DELETE
  async deleteWithBody<TData>(data: TData, path?: string): Promise<void> {
    await this.http.delete(this.url(path), { data });
  }
}

export default BaseService;
