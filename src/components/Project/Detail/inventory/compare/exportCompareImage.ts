import { toPng } from "html-to-image";

/** Ảnh trong suốt 1px, thay cho ảnh không tải được (chặn CORS) để vẫn xuất được phần còn lại */
const BLANK_IMG = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

// Bỏ nút thao tác (xóa, chi tiết, giữ chỗ...) khỏi ảnh xuất
const keep = (node: HTMLElement) => !(node instanceof HTMLElement && node.dataset.exportIgnore !== undefined);

/** Chụp bảng so sánh thành ảnh PNG (đủ mọi cột, kể cả phần đang cuộn khuất) và tải về */
export async function exportCompareImage(table: HTMLElement, fileName: string) {
  const dataUrl = await toPng(table, {
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    width: table.scrollWidth,
    height: table.scrollHeight,
    imagePlaceholder: BLANK_IMG,
    filter: keep,
  });
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}
