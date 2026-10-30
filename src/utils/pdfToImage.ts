import type { PDFDocumentProxy } from "pdfjs-dist";

const MAX_SIDE = 6000; // cạnh dài tối đa của ảnh nền (px)
const MAX_PIXELS = 20_000_000; // Cloudinary giới hạn số điểm ảnh của ảnh tải lên
const MAX_BYTES = 9.5 * 1024 * 1024; // giữ dưới giới hạn 10 MB của BE

// Thư viện PDF khá nặng nên chỉ tải khi thật sự cần
async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  return pdfjs;
}

export async function openPdf(file: File): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  return pdfjs.getDocument({ data }).promise;
}

// Mở PDF từ đường dẫn (dùng để vẽ mặt bằng sắc nét theo từng ô khi phóng to); dùng chung một bản cho mọi nơi
const urlCache = new Map<string, Promise<PDFDocumentProxy>>();

export function openPdfFromUrl(url: string): Promise<PDFDocumentProxy> {
  let doc = urlCache.get(url);
  if (!doc) {
    doc = loadPdfjs().then((pdfjs) => pdfjs.getDocument({ url }).promise);
    doc.catch(() => urlCache.delete(url)); // lỗi thì cho phép thử lại lần sau
    urlCache.set(url, doc);
  }
  return doc;
}

// Vẽ một trang PDF lên canvas; scale tự chọn sao cho cạnh dài và số điểm ảnh không vượt giới hạn
export async function renderPdfPage(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  maxSide: number,
  maxPixels = Number.POSITIVE_INFINITY,
) {
  const page = await pdf.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(
    maxSide / Math.max(base.width, base.height),
    Math.sqrt(maxPixels / (base.width * base.height)),
    8,
  );
  const viewport = page.getViewport({ scale });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Trình duyệt không hỗ trợ canvas");
  // nền trắng để vùng trong suốt của PDF không bị đen khi lưu JPEG
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, canvas, viewport }).promise;
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

// Xuất trang PDF thành ảnh nền độ phân giải cao (PNG; quá nặng thì JPEG chất lượng cao)
export async function pdfPageToFile(pdf: PDFDocumentProxy, pageNumber: number, baseName: string): Promise<File> {
  const canvas = document.createElement("canvas");
  await renderPdfPage(pdf, pageNumber, canvas, MAX_SIDE, MAX_PIXELS);

  const png = await toBlob(canvas, "image/png");
  if (png && png.size <= MAX_BYTES) return new File([png], `${baseName}.png`, { type: "image/png" });

  for (const quality of [0.92, 0.85, 0.75, 0.6]) {
    const jpg = await toBlob(canvas, "image/jpeg", quality);
    if (jpg && jpg.size <= MAX_BYTES) return new File([jpg], `${baseName}.jpg`, { type: "image/jpeg" });
  }
  throw new Error("Trang PDF quá nặng, hãy chọn file nhẹ hơn");
}
