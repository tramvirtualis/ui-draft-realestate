import type { PDFDocumentProxy } from "pdfjs-dist";

// Cắt một trang PDF thành bộ ô ảnh (nhiều mức thu nhỏ) ngay ở trình duyệt để tải lên Cloudinary.
// Đánh số khớp lưới ô của Leaflet CRS.Simple: tên ô = "{mức}/{x}/{y}" với mức = zoom + levels, y đếm từ dưới lên (bắt đầu từ 1).
// Trang được vẽ theo từng đoạn (cao STRIP_ROWS hàng ô, rộng tối đa SEGMENT) nên không cần canvas khổng lồ, dù mặt bằng rất lớn.

const TILE = 512; // khớp IMG_TILE ở lớp hiển thị
const MAX_SIDE = 46080; // cạnh dài nguyên bản (px): đủ nét để đọc mã căn kể cả khi phóng thêm ở mức sâu nhất
const SEGMENT = 15360; // bề rộng mỗi đoạn vẽ (bội số của TILE), nằm trong giới hạn canvas của mọi trình duyệt máy tính
// Mỗi lần render pdf.js phải chạy hết lệnh vẽ của cả trang, nên vẽ nhiều hàng ô một lần cho đỡ số lần render.
// 15360 x 2048 ≈ 31 triệu px (~126MB), vẫn trong giới hạn canvas của trình duyệt máy tính.
const STRIP_ROWS = 4;
const BATCH = 40; // số ô mỗi lần gửi lên máy chủ (khớp giới hạn BE)
const PARALLEL_BATCHES = 2; // số lô gửi cùng lúc
const RETRIES = 3;
const JPEG_QUALITY = 0.82;

export type TileSetInfo = { version: string; levels: number; width: number; height: number };
export type TileBatch = { name: string; blob: Blob }[];

// toBlob chụp lại nội dung canvas ngay lúc gọi, nên không cần chờ mã hoá xong mới vẽ ô tiếp theo
const toBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Không mã hoá được ô ảnh"))), "image/jpeg", JPEG_QUALITY),
  );

// Vùng (x, y, w, h) trong ảnh của cả đoạn (bề rộng stride) trắng hoàn toàn (không có nét vẽ nào)
function isBlank(data: Uint8ClampedArray, stride: number, x: number, y: number, w: number, h: number): boolean {
  for (let row = y; row < y + h; row++) {
    const end = (row * stride + x + w) * 4;
    for (let i = (row * stride + x) * 4; i < end; i += 4) {
      if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) return false;
    }
  }
  return true;
}

// Kích thước và số mức của bộ ô cho một trang PDF
export function planTileSet(pageWidth: number, pageHeight: number) {
  const k = MAX_SIDE / Math.max(pageWidth, pageHeight);
  const width = Math.round(pageWidth * k);
  const height = Math.round(pageHeight * k);
  const levels = Math.max(0, Math.ceil(Math.log2(Math.max(width, height) / TILE)));
  return { width, height, levels };
}

export async function buildAndUploadTiles(opts: {
  pdf: PDFDocumentProxy;
  page: number;
  upload: (version: string, batch: TileBatch) => Promise<void>;
  onProgress?: (done: number, total: number) => void;
}): Promise<TileSetInfo> {
  const page = await opts.pdf.getPage(opts.page);
  const base = page.getViewport({ scale: 1 });
  const { width, height, levels } = planTileSet(base.width, base.height);
  const version = String(Date.now());

  const dims = (z: number) => ({ lw: Math.max(1, Math.round(width * 2 ** z)), lh: Math.max(1, Math.round(height * 2 ** z)) });
  let total = 0;
  for (let z = -levels; z <= 0; z++) {
    const { lw, lh } = dims(z);
    total += Math.ceil(lw / TILE) * Math.ceil(lh / TILE);
  }

  let done = 0;
  let skipped = 0; // ô trắng hoàn toàn: không cần lưu (vùng trống của bản vẽ)
  let pending: { name: string; blob: Promise<Blob> }[] = [];
  const inflight = new Set<Promise<void>>();
  let failure: unknown = null;
  // Gửi một lô, lỗi mạng thì thử lại vài lần
  const send = async (batch: TileBatch) => {
    for (let attempt = 1; ; attempt++) {
      try {
        await opts.upload(version, batch);
        return;
      } catch (e) {
        if (attempt >= RETRIES) throw e;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  };
  
  const flush = async () => {
    if (pending.length === 0) return;
    const items = pending;
    pending = [];
    const blobs = await Promise.all(items.map((t) => t.blob));
    const batch: TileBatch = items.map((t, i) => ({ name: t.name, blob: blobs[i] }));
    // tối đa vài lô đang gửi, trong lúc đó tiếp tục cắt lô sau
    while (inflight.size >= PARALLEL_BATCHES) await Promise.race(inflight);
    if (failure) throw failure;
    const job: Promise<void> = send(batch)
      .then(() => {
        done += batch.length;
        opts.onProgress?.(done + skipped, total);
      })
      .catch((e: unknown) => {
        failure = e;
      })
      .finally(() => inflight.delete(job));
    inflight.add(job);
  };

  const strip = document.createElement("canvas");
  const sctx = strip.getContext("2d");
  const tile = document.createElement("canvas");
  tile.width = TILE;
  tile.height = TILE;
  const tctx = tile.getContext("2d");
  if (!sctx || !tctx) throw new Error("Trình duyệt không hỗ trợ canvas");

  for (let z = 0; z >= -levels; z--) {
    const { lw, lh } = dims(z);
    const cols = Math.ceil(lw / TILE);
    const rows = Math.ceil(lh / TILE);
    const scale = (width / base.width) * 2 ** z;
    // Mỗi dải gồm các hàng ô ny0..ny1 (ny1 nằm trên cùng)
    for (let ny0 = 1; ny0 <= rows; ny0 += STRIP_ROWS) {
      const ny1 = Math.min(rows, ny0 + STRIP_ROWS - 1);
      const stripH = (ny1 - ny0 + 1) * TILE;
      const srcY = lh - ny1 * TILE; // hàng pixel của ảnh ứng với mép trên dải (âm ở dải trên cùng)
      // Mỗi dải vẽ theo từng đoạn ngang rồi cắt thành các ô theo hàng và cột
      for (let segX = 0; segX < lw; segX += SEGMENT) {
        const segW = Math.min(SEGMENT, lw - segX);
        strip.width = segW;
        strip.height = stripH;
        sctx.fillStyle = "#ffffff";
        sctx.fillRect(0, 0, segW, stripH);
        await page.render({
          canvasContext: sctx,
          canvas: strip,
          viewport: page.getViewport({ scale, offsetX: -segX, offsetY: -srcY }),
        }).promise;
        // Đọc điểm ảnh một lần cho cả đoạn để dò ô trắng
        const { data } = sctx.getImageData(0, 0, segW, stripH);

        const firstCol = segX / TILE;
        const lastCol = Math.min(cols, (segX + segW) / TILE);
        for (let ny = ny1; ny >= ny0; ny--) {
          const sy = (ny1 - ny) * TILE;
          for (let x = firstCol; x < lastCol; x++) {
            const sx = x * TILE - segX;
            const sw = Math.min(TILE, segW - sx);
            if (isBlank(data, segW, sx, sy, sw, TILE)) {
              skipped += 1;
              continue;
            }
            tctx.fillStyle = "#ffffff";
            tctx.fillRect(0, 0, TILE, TILE);
            tctx.drawImage(strip, sx, sy, sw, TILE, 0, 0, sw, TILE);
            pending.push({ name: `${z + levels}/${x}/${ny}`, blob: toBlob(tile) });
            if (pending.length >= BATCH) await flush();
          }
        }
      }
      opts.onProgress?.(done + skipped, total);
    }
  }
  await flush();
  await Promise.all(inflight);
  if (failure) throw failure;
  strip.width = 0;
  strip.height = 0;
  // Không có ô nào có nét vẽ: thường do trình duyệt không vẽ được (thiếu bộ nhớ canvas), không lưu bộ ô rỗng
  if (done === 0) throw new Error("Không cắt được ô ảnh nào từ trang PDF");
  return { version, levels, width, height };
}
