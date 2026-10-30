import { fmt } from "../inventory/inventoryStatus";
import { formatDate } from "../../../../utils/formatDate";

export const PENDING = "Đang cập nhật";

// Giá tỷ VNĐ: "38,67 tỷ"; thiếu dữ liệu → null để nơi hiển thị tự chọn chữ thay thế
export const billion = (n: number | null | undefined) => (n != null && n > 0 ? fmt(n) : null);

export const million = (n: number | null | undefined) =>
  n != null && n > 0 ? `${n.toFixed(2).replace(".", ",")} triệu/m²` : null;

export const area = (n: number | null | undefined) =>
  n != null && n > 0 ? `${n.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} m²` : null;

export const dateVi = (iso: string | null | undefined) => (iso ? formatDate(iso) : null);
