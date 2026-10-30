import { useEffect, useState } from "react";
import { openPdfFromUrl } from "../../../../utils/pdfToImage";
import { fetchCloudinaryPdfSize, isCloudinaryPdf } from "../../../../utils/cloudinaryPdf";

// Toạ độ lưu theo % trên ảnh (gốc trên-trái) ↔ toạ độ pixel của Leaflet CRS.Simple (y hướng lên)
export const toLatLng = (x: number, y: number, width: number, height: number): [number, number] => [
  height * (1 - y / 100),
  width * (x / 100),
];

const clamp = (v: number) => Math.min(100, Math.max(0, v));

export const fromLatLng = (lat: number, lng: number, width: number, height: number) => ({
  x: Math.round(clamp((lng / width) * 100) * 100) / 100,
  y: Math.round(clamp((1 - lat / height) * 100) * 100) / 100,
});

// Kích thước gốc của ảnh (dùng làm hệ toạ độ); null khi đang tải hoặc lỗi
export function useImageSize(url: string | null): { width: number; height: number } | null | "error" {
  const [state, setState] = useState<{ url: string; size: { width: number; height: number } | "error" } | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => !cancelled && setState({ url, size: { width: img.naturalWidth, height: img.naturalHeight } });
    img.onerror = () => !cancelled && setState({ url, size: "error" });
    img.src = url;
    return () => {
      cancelled = true;
    };
  }, [url]);

  return state && state.url === url ? state.size : null;
}

const PDF_LONG_SIDE = 3000; // cạnh dài của hệ toạ độ khi dùng PDF trực tiếp (giống ảnh thường để mức zoom tương đương)

export type PdfMode = "stored" | "cloudinary" | "pdfjs";
export type PlanSize = { width: number; height: number; mode?: PdfMode; density?: number };

// Hệ toạ độ của mặt bằng: ảnh nếu có, không thì lấy tỉ lệ trang PDF.
// PDF trên Cloudinary dùng tile do Cloudinary dựng (nhẹ, có CDN); không được thì quay về tự vẽ bằng pdfjs.
export function usePlanSize(
  plan: {
    imageUrl?: string | null;
    pdfUrl?: string | null;
    pdfPage?: number | null;
    tileBaseUrl?: string | null;
    tileWidth?: number | null;
    tileHeight?: number | null;
  } | null,
): PlanSize | null | "error" {
  const imageUrl = plan?.imageUrl || null;
  // Đã có bộ ô cắt sẵn: kích thước lấy từ DB, không phải tải PDF
  const stored = !imageUrl && !!plan?.tileBaseUrl && !!plan.tileWidth && !!plan.tileHeight;
  const pdfUrl = plan && !imageUrl && !stored ? plan.pdfUrl || null : null;
  const page = plan?.pdfPage ?? 1;
  const imageSize = useImageSize(imageUrl);
  const [pdf, setPdf] = useState<{ key: string; size: PlanSize | "error" } | null>(null);
  const key = pdfUrl ? `${pdfUrl}#${page}` : "";

  useEffect(() => {
    if (!pdfUrl) return;
    let cancelled = false;

    const viaPdfjs = () =>
      openPdfFromUrl(pdfUrl)
        .then((doc) => doc.getPage(page))
        .then((p) => {
          if (cancelled) return;
          const v = p.getViewport({ scale: 1 });
          const k = PDF_LONG_SIDE / Math.max(v.width, v.height);
          setPdf({ key, size: { width: Math.round(v.width * k), height: Math.round(v.height * k), mode: "pdfjs" } });
        })
        .catch((e: unknown) => {
          console.error("Không đọc được PDF mặt bằng:", pdfUrl, e);
          if (!cancelled) setPdf({ key, size: "error" });
        });

    if (isCloudinaryPdf(pdfUrl)) {
      fetchCloudinaryPdfSize(pdfUrl, page)
        .then((s) => !cancelled && setPdf({ key, size: { width: s.width, height: s.height, mode: "cloudinary", density: s.density } }))
        .catch((e: unknown) => {
          console.warn("Cloudinary không dựng được tile PDF, dùng pdfjs:", e);
          if (!cancelled) void viaPdfjs();
        });
    } else {
      void viaPdfjs();
    }
    return () => {
      cancelled = true;
    };
  }, [pdfUrl, page, key]);

  if (imageUrl) return imageSize;
  if (stored && plan) return { width: plan.tileWidth as number, height: plan.tileHeight as number, mode: "stored" };
  if (!pdfUrl) return null;
  return pdf && pdf.key === key ? pdf.size : null;
}
