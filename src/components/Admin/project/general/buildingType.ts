import { Building2, Home, type LucideIcon } from "lucide-react";
import { BUILDING_TYPE_LABEL } from "../../../../services/project/projectService";

// Loại hình xây dựng của dự án (admin lưu theo nhãn "Cao tầng" / "Thấp tầng"), chọn một lần khi tạo dự án
export const HIGH_RISE = BUILDING_TYPE_LABEL.HIGH_RISE;
export const LOW_RISE = BUILDING_TYPE_LABEL.LOW_RISE;

// Cao tầng: phân khu → tòa nhà → căn (căn có tầng + số phòng ngủ), mặt bằng ghim tòa nhà, mỗi tòa một bảng hàng.
// Thấp tầng (kể cả dự án cũ chưa chọn): phân khu → căn, mặt bằng ghim từng căn.
export const isHighRise = (buildingType: string | null | undefined) =>
  buildingType === HIGH_RISE || buildingType === "HIGH_RISE";

export type BuildingTypeOption = { value: string; icon: LucideIcon; desc: string; features: string[] };

export const BUILDING_TYPE_OPTIONS: BuildingTypeOption[] = [
  {
    value: HIGH_RISE,
    icon: Building2,
    desc: "Chung cư, căn hộ, tòa tháp",
    features: ["Phân khu → tòa nhà → căn", "Căn có tầng và số phòng ngủ", "Mặt bằng ghim tòa nhà, mở bảng hàng của tòa"],
  },
  {
    value: LOW_RISE,
    icon: Home,
    desc: "Biệt thự, liền kề, shophouse",
    features: ["Phân khu → căn", "Căn không có tầng", "Mặt bằng ghim từng căn"],
  },
];
