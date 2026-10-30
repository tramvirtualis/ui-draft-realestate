import { useEffect, useState } from "react";
import { TileLayer, latLngBounds, type Coords } from "leaflet";
import { useMap, useMapEvents } from "react-leaflet";
import PdfTileLayer from "./PdfTileLayer";
import { openPdfFromUrl } from "../../../../utils/pdfToImage";
import { withTransform } from "../../../../utils/cloudinaryPdf";

type Props = {
  pdfUrl: string;
  page: number;
  width: number; // kích thước hệ toạ độ = raster ở mức nét nhất
  height: number;
  density?: number; // dpi ứng với bề rộng `width` (chế độ dựng ô theo yêu cầu)
  stored?: { baseUrl: string; levels: number }; // bộ ô đã cắt sẵn: {baseUrl}/{mức}/{x}/{y}.jpg
};

// Mỗi ô ảnh 512px chỉ hiển thị 128px: mật độ gấp 4 nên vừa mở ra (chưa zoom) đã nét, kể cả màn hình retina,
// giống cách Salepro dùng mức ảnh cao ngay từ khung nhìn đầu tiên.
const IMG_TILE = 512; // kích thước ô ảnh (khớp TILE trong utils/pdfTiles.ts)
const OVERSAMPLE = 2; // lấy ô ở mức nét hơn 2 bậc so với mức zoom đang hiển thị
const CSS_TILE = IMG_TILE / 2 ** OVERSAMPLE; // 128px
const BLANK_TILE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // ô trắng/không có file: để trống thay vì ảnh lỗi

// Lớp tile từ Cloudinary: ô cắt sẵn (nhanh nhất) hoặc Cloudinary dựng ô theo yêu cầu từ PDF
class CloudinaryPdfTiles extends TileLayer {
  constructor(private readonly src: Props) {
    super("", {
      tileSize: CSS_TILE,
      errorTileUrl: BLANK_TILE,
      bounds: latLngBounds([0, 0], [src.height, src.width]),
      noWrap: true,
      minZoom: -((src.stored?.levels ?? 3) + OVERSAMPLE),
      maxNativeZoom: -OVERSAMPLE, // zoom lớn hơn chỉ phóng to ô ở mức nét nhất (vẫn 1 điểm ảnh/pixel)
      maxZoom: 5,
      keepBuffer: 4, // giữ thêm ô quanh màn hình: đã nét thì giữ, chỉ bỏ khi khuất xa
      updateWhenZooming: true, // bắt đầu tải ô mới ngay khi đang zoom, không chờ dừng
      updateInterval: 50,
    });
  }

  getTileUrl(coords: Coords): string {
    const { pdfUrl, page, width, height, density = 150, stored } = this.src;
    const level = coords.z + OVERSAMPLE; // mức ảnh tương ứng (0 = nguyên bản)
    // Ô đã cắt sẵn trên Cloudinary: mức lưu = mức ảnh + số mức, hàng đếm từ dưới lên
    if (stored) return `${stored.baseUrl}/${level + stored.levels}/${coords.x}/${-coords.y}.jpg`;

    const k = Math.pow(2, level); // tỉ lệ so với raster nguyên bản
    const w = Math.max(1, Math.round(width * k)); // bề rộng raster ở mức này
    const x = coords.x * IMG_TILE;
    // CRS.Simple: hàng pixel của ảnh = chỉ số ô * kích thước ô + chiều cao thế giới ở mức này
    const y = Math.round(coords.y * IMG_TILE + height * k);
    const dn = Math.max(10, Math.round(density * k));
    return withTransform(
      pdfUrl,
      `pg_${page},dn_${dn}/c_scale,w_${w}/c_crop,x_${Math.max(0, x)},y_${Math.max(0, y)},w_${IMG_TILE},h_${IMG_TILE}/f_auto,q_auto`,
    );
  }
}

// Mặt bằng từ PDF: chỉ tải các ô ảnh đang nhìn thấy (lazy), không tải file PDF khi xem bình thường.
// Khi khách zoom vượt hẳn mức ảnh gốc, vùng đang nhìn được vẽ thêm từ PDF vector (nét), các vùng khác giữ ô ảnh.
export default function CloudinaryPdfLayer(props: Props) {
  const map = useMap();
  const { pdfUrl, page, width, height, density, stored } = props;
  const [deep, setDeep] = useState(map.getZoom() > 0.5);
  useMapEvents({ zoomend: () => setDeep(map.getZoom() > 0.5) });

  // Tải sẵn PDF khi trình duyệt rảnh để lúc zoom sâu các ô nét hiện ngay, không phải chờ tải file
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void openPdfFromUrl(pdfUrl).then((doc) => doc.getPage(page)).catch(() => undefined);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [pdfUrl, page]);

  useEffect(() => {
    const layer = new CloudinaryPdfTiles({ pdfUrl, page, width, height, density, stored });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, pdfUrl, page, width, height, density, stored?.baseUrl, stored?.levels]);

  // Bộ ô cắt sẵn đã đủ nét: không vẽ thêm từ PDF (chậm, hiện từng mảng); chỉ chế độ dựng ô theo yêu cầu mới cần
  return deep && !stored ? <PdfTileLayer pdfUrl={pdfUrl} page={page} width={width} height={height} maxZoom={5} detailOnly /> : null;
}
