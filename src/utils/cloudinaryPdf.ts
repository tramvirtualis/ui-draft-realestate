// Tile bản đồ cho PDF lưu trên Cloudinary: Cloudinary tự raster đúng trang, đúng độ nét, đúng ô và CDN lưu đệm,
// nên trình duyệt chỉ tải các ô ảnh nhỏ đang nhìn thấy thay vì cả file PDF.

const MARK = "/image/upload/";
const BASE_DENSITY = 150; // mật độ (dpi) dùng để đo kích thước trang
export const CLOUD_RENDER_WIDTH = 4800; // bề rộng raster tối đa của trang (px) = mức zoom sắc nét nhất
const MAX_PIXELS = 24_000_000; // Cloudinary giới hạn ~25 megapixel cho ảnh raster

export const isCloudinaryPdf = (url: string): boolean =>
  /^https:\/\/res\.cloudinary\.com\//.test(url) && url.includes(MARK) && /\.pdf(\?|$)/i.test(url);

// Chèn bộ biến đổi ngay sau /image/upload/
export const withTransform = (url: string, transformation: string): string =>
  url.replace(MARK, `${MARK}${transformation}/`);

export type CloudinaryPdfSize = {
  width: number; // kích thước hệ toạ độ (= raster ở mức zoom sắc nét nhất)
  height: number;
  density: number; // dpi tương ứng với bề rộng `width`
};

const cache = new Map<string, Promise<CloudinaryPdfSize>>();

// Đọc kích thước trang PDF từ Cloudinary (fl_getinfo trả JSON, không tải ảnh)
export function fetchCloudinaryPdfSize(url: string, page: number): Promise<CloudinaryPdfSize> {
  const key = `${url}#${page}`;
  let job = cache.get(key);
  if (!job) {
    job = fetch(withTransform(url, `pg_${page},dn_${BASE_DENSITY},fl_getinfo`))
      .then((res) => {
        if (!res.ok) throw new Error(`Cloudinary ${res.status}`);
        return res.json() as Promise<{ output?: { width?: number; height?: number }; input?: { width?: number; height?: number } }>;
      })
      .then((info) => {
        const w0 = info.output?.width ?? info.input?.width;
        const h0 = info.output?.height ?? info.input?.height;
        if (!w0 || !h0) throw new Error("Không đọc được kích thước trang PDF");
        let width = CLOUD_RENDER_WIDTH;
        let height = Math.round((width * h0) / w0);
        if (width * height > MAX_PIXELS) {
          const k = Math.sqrt(MAX_PIXELS / (width * height));
          width = Math.round(width * k);
          height = Math.round(height * k);
        }
        return { width, height, density: (BASE_DENSITY * width) / w0 };
      });
    job.catch(() => cache.delete(key)); // lỗi thì cho thử lại lần sau
    cache.set(key, job);
  }
  return job;
}
