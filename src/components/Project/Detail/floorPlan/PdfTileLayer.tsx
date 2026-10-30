import { useEffect } from "react";
import { GridLayer, ImageOverlay, latLngBounds, type Coords, type DoneCallback, type LatLngBoundsExpression } from "leaflet";
import { useMap } from "react-leaflet";
import type { PDFPageProxy, RenderTask } from "pdfjs-dist";
import { openPdfFromUrl } from "../../../../utils/pdfToImage";

type Props = {
  pdfUrl: string;
  page: number;
  width: number; // kích thước hệ toạ độ của bản đồ
  height: number;
  maxZoom: number;
  detailOnly?: boolean; // chỉ vẽ ô nét từ mức zoom 1 trở lên (bên dưới đã có ô ảnh từ Cloudinary), bỏ bản xem trước cả trang
};

const TILE = 256;
const PREVIEW_SIDE = 1400; // cạnh dài của bản xem trước độ phân giải thấp (px)
const MAX_DPR = 2;
const CACHE_LIMIT = 120; // số ô đã vẽ được giữ lại để kéo qua lại không phải vẽ lại

type TileCanvas = HTMLCanvasElement & { __task?: RenderTask; __unloaded?: boolean };

// Hàng đợi tuần tự: tránh vẽ nhiều ô cùng lúc làm treo trình duyệt
let chain: Promise<unknown> = Promise.resolve();
const enqueue = <T,>(job: () => Promise<T>): Promise<T> => {
  const next = chain.then(job, job);
  chain = next.catch(() => undefined);
  return next;
};

// Lớp phủ dùng thẳng canvas (không mã hoá PNG/blob) cho bản xem trước cả trang
class CanvasOverlay extends ImageOverlay {
  private readonly canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, bounds: LatLngBoundsExpression) {
    super("", bounds, { interactive: false, zIndex: 1 });
    this.canvas = canvas;
  }

  // ImageOverlay tự tạo thẻ <img>; ở đây thay bằng canvas đã vẽ sẵn
  _initImage() {
    const self = this as unknown as { _image: HTMLElement; _zoomAnimated: boolean; _updateZIndex: () => void; options: { zIndex?: number } };
    const el = this.canvas;
    self._image = el;
    el.classList.add("leaflet-image-layer");
    if (self._zoomAnimated) el.classList.add("leaflet-zoom-animated");
    el.onselectstart = () => false;
    el.onmousemove = () => false;
    if (self.options.zIndex) self._updateZIndex();
    this.fire("load");
  }
}

/**
 Hiển thị PDF theo ô nhỏ 256px như bản đồ:
 - Mỗi ô là một mảnh của trang PDF vẽ ở đúng mức zoom nên luôn nét (vector).
 - Ô còn nằm trong màn hình thì giữ nguyên và vẫn nét khi zoom/kéo; ô bị khuất khỏi màn hình mới bị bỏ,
   kéo lại tới đó thì vẽ lại (có bộ nhớ đệm các ô gần nhất).
 - Ô đang vẽ dở bị khuất thì hủy; các ô vẽ lần lượt để không treo trình duyệt.
 - Trong lúc chờ, ô của mức zoom trước (hoặc bản xem trước) vẫn hiển thị nên không bị trống.
 */
export default function PdfTileLayer({ pdfUrl, page, width, height, maxZoom, detailOnly = false }: Props) {
  const map = useMap();

  useEffect(() => {
    let disposed = false;
    let layer: GridLayer | null = null;
    let preview: ImageOverlay | null = null;
    const cache = new Map<string, TileCanvas>(); // thứ tự chèn = độ mới dùng gần đây

    void openPdfFromUrl(pdfUrl)
      .then((doc) => doc.getPage(page))
      .then(async (pdfPage: PDFPageProxy) => {
        if (disposed) return;
        const base = pdfPage.getViewport({ scale: 1 });
        const toImage = width / base.width; // 1 đơn vị PDF = toImage đơn vị bản đồ

        // Bản xem trước độ phân giải thấp cho cả trang (chỉ khi không có lớp ảnh bên dưới)
        if (!detailOnly) {
          const s = PREVIEW_SIDE / Math.max(base.width, base.height);
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(base.width * s);
          canvas.height = Math.ceil(base.height * s);
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            try {
              await enqueue(() => pdfPage.render({ canvasContext: ctx, canvas, viewport: pdfPage.getViewport({ scale: s }) }).promise);
              if (disposed) return;
              preview = new CanvasOverlay(canvas, [[0, 0], [height, width]]).addTo(map);
            } catch {
              /* không có bản xem trước thì các ô vẽ trực tiếp */
            }
          }
        }
        if (disposed) return;

        // createTile là phương thức protected của Leaflet nên phải mở rộng lớp GridLayer
        class PdfGrid extends GridLayer {
          protected createTile(coords: Coords, done: DoneCallback): HTMLElement {
            const key = `${coords.z}/${coords.x}/${coords.y}`;
            const hit = cache.get(key);
            if (hit) {
              cache.delete(key);
              cache.set(key, hit); // đánh dấu mới dùng
              hit.__unloaded = false;
              setTimeout(() => done(undefined, hit), 0);
              return hit;
            }

            const tile = document.createElement("canvas") as TileCanvas;
            const size = this.getTileSize();
            const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
            tile.width = size.x * dpr;
            tile.height = size.y * dpr;

            // Góc trên-trái của ô trong hệ toạ độ ảnh (gốc ở góc trên-trái, y hướng xuống)
            const nw = map.unproject(coords.scaleBy(size), coords.z);
            const unit = Math.pow(2, coords.z) * dpr; // điểm ảnh canvas trên mỗi đơn vị bản đồ
            const xImg = nw.lng;
            const yImg = height - nw.lat;

            void enqueue(async () => {
              if (disposed || tile.__unloaded) throw new Error("skipped"); // đã bị khuất: không vẽ
              const ctx = tile.getContext("2d");
              if (!ctx) throw new Error("canvas");
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, tile.width, tile.height);
              const viewport = pdfPage.getViewport({ scale: toImage * unit, offsetX: -xImg * unit, offsetY: -yImg * unit });
              const task = pdfPage.render({ canvasContext: ctx, canvas: tile, viewport });
              tile.__task = task;
              await task.promise;
            })
              .then(() => {
                cache.set(key, tile);
                while (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value as string);
                done(undefined, tile);
              })
              .catch((err: unknown) => done(err as Error, tile));

            return tile;
          }
        }

        const grid = new PdfGrid({
          tileSize: TILE,
          bounds: latLngBounds([0, 0], [height, width]),
          noWrap: true,
          minZoom: detailOnly ? 1 : -4,
          maxZoom,
          maxNativeZoom: maxZoom,
          keepBuffer: 4, // giữ thêm vài hàng ô quanh màn hình để kéo nhẹ không phải vẽ lại
          updateWhenZooming: false,
          updateWhenIdle: false, // vẽ ô ngay khi đang kéo, không chờ dừng hẳn
          zIndex: 2,
        });

        // Ô bị khuất khỏi màn hình: hủy việc đang vẽ dở
        grid.on("tileunload", (e) => {
          const t = (e as unknown as { tile: TileCanvas }).tile;
          t.__unloaded = true;
          try {
            t.__task?.cancel();
          } catch {
            /* đã xong */
          }
        });

        layer = grid;
        grid.addTo(map);
      })
      .catch((e: unknown) => console.error("Không vẽ được PDF mặt bằng:", pdfUrl, e));

    return () => {
      disposed = true;
      if (layer) map.removeLayer(layer);
      if (preview) map.removeLayer(preview);
      cache.clear();
    };
  }, [map, pdfUrl, page, width, height, maxZoom, detailOnly]);

  return null;
}
