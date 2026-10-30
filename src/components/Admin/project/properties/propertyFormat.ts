// Định dạng từ giá trị gốc (VNĐ, m²), không làm thay đổi dữ liệu

export function formatPrice(vnd: number): string {
  if (vnd >= 1_000_000_000) return `${(vnd / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ VNĐ`;
  if (vnd >= 1_000_000) return `${(vnd / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu VNĐ`;
  return `${vnd.toLocaleString("vi-VN")} VNĐ`;
}

export const formatArea = (m2: number) => `${m2.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} m²`;


// Giá trung bình trên m² (triệu/m²)
export const pricePerM2 = (price: number, area: number) =>
  area > 0 ? `${(price / area / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu/m²` : "Chưa cập nhật";
