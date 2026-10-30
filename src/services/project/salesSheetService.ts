import { authHttp, publicHttp } from "../../api/http";
import type {
  SalesSheetDetail,
  SalesSheetInput,
  SalesSheetPinInput,
  SalesSheetSummary,
} from "../../types/project/salesSheet.types";

const BASE_URL = "/sales-sheets";

export const salesSheetService = {
  // Lấy danh sách bảng hàng theo dự án (cho tab chọn tòa)
  getListByProject: async (projectId: number): Promise<SalesSheetSummary[]> => {
    const data = await publicHttp.get<SalesSheetSummary[]>(BASE_URL, {
      params: { projectId },
    });
    return data ?? [];
  },

  // Lấy chi tiết một bảng hàng kèm tọa độ các ghim căn
  getById: async (id: number): Promise<SalesSheetDetail> => {
    return publicHttp.get<SalesSheetDetail>(`${BASE_URL}/${id}`);
  },

  // Tạo mới bảng hàng tòa nhà (Admin)
  create: async (input: SalesSheetInput): Promise<SalesSheetDetail> => {
    return authHttp.post<SalesSheetDetail>(BASE_URL, input);
  },

  // Cập nhật thông tin tòa nhà / bảng hàng (Admin)
  updateInfo: async (
    id: number,
    input: SalesSheetInput
  ): Promise<SalesSheetDetail> => {
    return authHttp.put<SalesSheetDetail>(`${BASE_URL}/${id}/info`, input);
  },

  // Lưu ảnh / PDF bản vẽ bảng hàng (Admin)
  saveImage: async (
    id: number,
    image?: File | null,
    pdf?: File | null,
    pdfPage?: number
  ): Promise<SalesSheetDetail> => {
    const formData = new FormData();
    if (image) formData.append("image", image);
    if (pdf) formData.append("pdf", pdf);
    if (pdfPage !== undefined) formData.append("pdfPage", String(pdfPage));

    return authHttp.post<SalesSheetDetail>(`${BASE_URL}/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
  },

  // Lưu danh sách vị trí ghim căn hộ trên bảng hàng (Admin)
  savePins: async (
    id: number,
    pins: SalesSheetPinInput[],
    pinScale?: number
  ): Promise<SalesSheetDetail> => {
    return authHttp.put<SalesSheetDetail>(`${BASE_URL}/${id}/pins`, pins, {
      params: pinScale === undefined ? undefined : { pinScale },
    });
  },

  // Tải các ô ảnh cắt nhỏ từ PDF (Admin)
  uploadTiles: async (
    id: number,
    version: string,
    batch: Array<{ name: string; blob: Blob }>
  ): Promise<void> => {
    const form = new FormData();
    form.append("version", version);
    batch.forEach(({ name, blob }) => {
      form.append("names", name);
      form.append("tiles", blob, `${name.replace(/\//g, "-")}.jpg`);
    });
    await authHttp.post(`${BASE_URL}/${id}/tiles`, form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
  },

  // Chốt cấu hình bộ ô ảnh zoom sâu (Admin)
  saveTileSet: async (
    id: number,
    info: {
      version: string;
      levels: number;
      width: number;
      height: number;
      tileWidth?: number;
      tileHeight?: number;
    }
  ): Promise<SalesSheetDetail> => {
    return authHttp.put<SalesSheetDetail>(`${BASE_URL}/${id}/tile-set`, info);
  },

  // Xóa bảng hàng (Admin)
  delete: async (id: number): Promise<void> => {
    return authHttp.delete(`${BASE_URL}/${id}`);
  },
};
