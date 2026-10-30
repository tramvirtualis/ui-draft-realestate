import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import DOMPurify from "dompurify";

export const isSvgUrl = (url?: string | null) => !!url && /\.svg(\?|$)/i.test(url);

// Mức zoom tối đa khi bản vẽ là SVG (vector): phóng 8× vẫn nét
export const SVG_MAX_ZOOM = 3;

type Props = { url: string; width: number; height: number };

// Bản vẽ SVG (vd bảng hàng dựng từ Excel) gắn thẳng vào bản đồ thay vì <img>: trình duyệt vẽ lại vector
// ở mọi mức zoom nên chữ luôn nét. File do admin tải lên nên lọc bỏ script / sự kiện trước khi chèn vào trang.
export default function SvgSheetLayer({ url, width, height }: Props) {
  const map = useMap();

  useEffect(() => {
    let cancelled = false;
    let layer: L.SVGOverlay | null = null;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        const body = DOMPurify.sanitize(text, { USE_PROFILES: { svg: true }, RETURN_DOM: true }) as HTMLElement;
        const svg = body.querySelector("svg");
        if (!svg) throw new Error("File không phải SVG");
        layer = L.svgOverlay(svg, [[0, 0], [height, width]], { interactive: false }).addTo(map);
        layer.bringToBack();
      })
      .catch((e: unknown) => console.error("Không tải được bản vẽ SVG:", url, e));
    return () => {
      cancelled = true;
      layer?.remove();
    };
  }, [map, url, width, height]);

  return null;
}
