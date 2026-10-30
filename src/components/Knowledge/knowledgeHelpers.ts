import {
  BookOpenText,
  FileText,
  FileType2,
  Handshake,
  Landmark,
  Layers,
  Map as MapIcon,
  Palmtree,
  Scale,
  Sofa,
  type LucideIcon,
} from "lucide-react";
import { DOCX_MIME, PDF_MIME, type DocumentItem } from "../../types/document.types";

// Danh mục từ BE không có icon → gán lần lượt theo thứ tự
const CATEGORY_ICONS: LucideIcon[] = [Scale, Handshake, Landmark, MapIcon, Palmtree, Sofa];
export const categoryIcon = (index: number): LucideIcon => CATEGORY_ICONS[index % CATEGORY_ICONS.length] ?? Layers;

// Trang tất cả danh mục và trang danh sách tài liệu của 1 danh mục
export const CATEGORIES_PATH = "/knowledge/danh-muc";
export const categoryPath = (slug: string) => `${CATEGORIES_PATH}/${slug}`;

export const selectCls =
  "h-11 w-full appearance-none rounded-xl border border-line bg-white px-4 pr-9 text-sm text-heading outline-none focus:border-primary-300";

type Kind = { label: string; icon: LucideIcon; badge: string };

// Nhãn hiển thị theo loại: PDF / Word / Bài viết
export const documentKind = (d: Pick<DocumentItem, "type" | "mimeType">): Kind => {
  if (d.type === "ARTICLE") return { label: "Bài viết", icon: BookOpenText, badge: "bg-emerald-50 text-emerald-700" };
  if (d.mimeType === DOCX_MIME) return { label: "Word", icon: FileType2, badge: "bg-blue-50 text-blue-700" };
  return { label: "PDF", icon: FileText, badge: "bg-red-50 text-red-600" };
};

export const isPdf = (d: Pick<DocumentItem, "mimeType">) => d.mimeType === PDF_MIME;
export const isDocx = (d: Pick<DocumentItem, "mimeType">) => d.mimeType === DOCX_MIME;

// 2_400_000 → "2.3 MB"
export const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// Xem file Word ngay trên web qua Office Online (file phải có URL công khai)
export const officeViewerUrl = (fileUrl: string) =>
  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;

// Tải về: Cloudinary trả file kèm header attachment khi có fl_attachment
export const downloadUrl = (fileUrl: string) =>
  fileUrl.includes("/image/upload/") ? fileUrl.replace("/image/upload/", "/image/upload/fl_attachment/") : fileUrl;
