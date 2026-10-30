import BaseService from "../base/BaseService";
import { authHttp } from "../../api/http";
import { UPLOAD_CONFIG } from "./projectService";
import type { FloorPlanDto, FloorPlanPinInput } from "../../types/project/project.types";
import type { TileBatch, TileSetInfo } from "../../utils/pdfTiles";

// Đọc công khai; tải ảnh, gán vị trí, xóa chỉ ADMIN
const hasText = (v: unknown) => typeof v === "string" && v !== "";

class FloorPlanService extends BaseService {
  constructor() {
    super("/floor-plans", { auth: false });
  }

  // GET /floor-plans?projectId= (null nếu dự án chưa có mặt bằng)
  async get(projectId: number): Promise<FloorPlanDto | null> {
    const res = await this.http.get<FloorPlanDto | null>(this.url(), { params: { projectId } });
    // Dự án chưa có mặt bằng: BE trả data = null (có thể bị bỏ khỏi JSON) → coi như chưa có, không phải đang tải
    return res && typeof res === "object" && (hasText(res.imageUrl) || hasText(res.pdfUrl)) ? res : null;
  }

  // POST /floor-plans (multipart: projectId, image, pdf?, pdfPage?): tạo mới hoặc thay ảnh, giữ nguyên vị trí đã gán.
  // Có pdf thì bản gốc được lưu lại để khách phóng to vẫn sắc nét như xem PDF.
  async saveImage(projectId: number, image: File | null, pdf?: { file: File; page: number }): Promise<FloorPlanDto> {
    const form = new FormData();
    form.append("projectId", String(projectId));
    if (image) form.append("image", image);
    if (pdf) {
      form.append("pdf", pdf.file);
      form.append("pdfPage", String(pdf.page));
    }
    return authHttp.post<FloorPlanDto>(this.url(), form, UPLOAD_CONFIG);
  }

  // POST /floor-plans/{id}/tiles (multipart: version, names[], tiles[]): tải một lô ô ảnh đã cắt sẵn
  async uploadTiles(planId: number, version: string, batch: TileBatch): Promise<void> {
    const form = new FormData();
    form.append("version", version);
    batch.forEach(({ name, blob }) => {
      form.append("names", name);
      form.append("tiles", blob, `${name.replace(/\//g, "-")}.jpg`);
    });
    await authHttp.post(this.url(planId, "tiles"), form, UPLOAD_CONFIG);
  }

  // PUT /floor-plans/{id}/tile-set (JSON): chốt bộ ô ảnh
  async saveTileSet(planId: number, info: TileSetInfo): Promise<FloorPlanDto> {
    return authHttp.put<FloorPlanDto>(this.url(planId, "tile-set"), info);
  }

  // PUT /floor-plans/{id}/pins?pinScale= (JSON): thay toàn bộ vị trí các căn và kích thước ghim
  async savePins(planId: number, pins: FloorPlanPinInput[], pinScale?: number): Promise<FloorPlanDto> {
    return authHttp.put<FloorPlanDto>(this.url(planId, "pins"), pins, { params: pinScale === undefined ? undefined : { pinScale } });
  }

  // DELETE /floor-plans/{id}
  async remove(planId: number): Promise<void> {
    await authHttp.delete(this.url(planId));
  }
}

export const floorPlanService = new FloorPlanService();
