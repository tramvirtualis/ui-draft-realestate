// Khớp BuildingResponse / BuildingRequest của BE: tòa nhà của dự án cao tầng (phân khu → tòa nhà → căn)
export interface BuildingDto {
  id: number;
  projectId: number;
  zoneId: number;
  zoneName: string;
  name: string;
  floors: number; // số tầng; tầng của căn trong tòa không vượt quá
  imageUrl: string | null; // ảnh tòa (1 ảnh)
}

export interface BuildingInput {
  zoneId: number;
  name: string;
  floors: number;
  imageFile?: File; // ảnh mới; không gửi thì giữ ảnh cũ
}
