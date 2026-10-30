import { useMemo, useState } from "react";
import { MapContainer, ImageOverlay, Marker, ZoomControl } from "react-leaflet";
import { CRS, type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { FUND_TYPES, UNCLASSIFIED, UNIT_STATE_PINS, fundColor, pinIcon } from "./planPins";
import { toLatLng } from "./planCoords";
import PdfTileLayer from "./PdfTileLayer";
import CloudinaryPdfLayer from "./CloudinaryPdfLayer";
import type { FundType } from "../../../../types/project/project.types";

// label: chữ trên ghim (giá tỷ VNĐ, hoặc tên tòa ở dự án cao tầng); title: tooltip, mặc định "Căn {code}"
// status: trạng thái căn (available/holding/sold/closed) để đổi màu ghim khi căn đã được giữ chỗ hoặc đã bán
export type PinUnit = { id: number; code: string; label: string; fundType: FundType | null; x: number; y: number; status?: string; title?: string };

type Props = {
  imageUrl?: string | null; // không có thì dùng PDF trực tiếp
  width: number;
  height: number;
  units: PinUnit[];
  selected: number | null;
  onSelect: (id: number) => void;
  pinScale?: number; // hệ số kích thước ghim do admin đặt
  pdfUrl?: string | null; // có PDF gốc thì vẽ sắc nét theo từng ô khi phóng to
  pdfPage?: number | null;
  pdfMode?: "stored" | "cloudinary" | "pdfjs";
  pdfTiles?: { baseUrl: string; levels: number }; // bộ ô đã cắt sẵn (pdfMode = "stored")
  pdfDensity?: number; // dpi của raster ở mức zoom 0 (chế độ cloudinary)
  hint?: string; // dòng hướng dẫn ở góc dưới
};

type LegendKey = FundType | "NONE" | "HOLDING" | "SOLD";

// Mặt bằng quỹ căn: mỗi căn là một ghim hiển thị giá, màu theo loại quỹ; bấm ghim để chọn căn (và mở form giữ chỗ)
export default function FloorPlanBoard({ imageUrl, width, height, units, selected, onSelect, pinScale = 1, pdfUrl, pdfPage, pdfMode, pdfDensity, pdfTiles, hint = "Giá hiển thị: tỷ VNĐ · Bấm vào ghim để xem căn và giữ chỗ" }: Props) {
  const stored = pdfMode === "stored" && !!pdfUrl && !!pdfTiles;
  const cloud = stored || (pdfMode === "cloudinary" && !!pdfUrl && pdfDensity !== undefined);
  const maxZoom = stored ? 1 : cloud || pdfUrl ? 5 : 2; // bộ ô cắt sẵn: cho phóng thêm 2× so với ảnh gốc ở mức sâu nhất
  const bounds: LatLngBoundsExpression = [[0, 0], [height, width]];
  const [hidden, setHidden] = useState<Set<LegendKey>>(new Set());

  // Căn đã giữ chỗ / đã bán xếp vào nhóm riêng (màu riêng); căn còn trống theo loại quỹ
  const typeOf = (u: PinUnit): LegendKey =>
    u.status === "holding" ? "HOLDING" : u.status === "sold" || u.status === "closed" ? "SOLD" : u.fundType ?? "NONE";

  const legend = useMemo(() => {
    const present = new Set(units.map(typeOf));
    return [
      ...FUND_TYPES.filter((f) => present.has(f.key)).map((f) => ({ key: f.key as LegendKey, label: f.label, color: f.color })),
      ...(present.has("NONE") ? [{ key: "NONE" as LegendKey, label: UNCLASSIFIED.label, color: UNCLASSIFIED.color }] : []),
      ...(["HOLDING", "SOLD"] as const).filter((k) => present.has(k)).map((k) => ({ key: k as LegendKey, label: UNIT_STATE_PINS[k].label, color: UNIT_STATE_PINS[k].color })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units]);

  const markers = useMemo(
    () =>
      units.map((u) => ({
        u,
        icon: pinIcon({
          color: (() => {
            const t = typeOf(u);
            return t === "HOLDING" || t === "SOLD" ? UNIT_STATE_PINS[t].color : fundColor(u.fundType);
          })(),
          locked: typeOf(u) === "HOLDING",
          label: u.label,
          title: u.title ?? (typeOf(u) === "HOLDING" ? `Căn ${u.code} · Đang giữ chỗ` : typeOf(u) === "SOLD" ? `Căn ${u.code} · Không còn trống` : `Căn ${u.code}`),
          active: selected === u.id,
          dimmed: hidden.has(typeOf(u)),
          scale: pinScale,
        }),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [units, selected, hidden, pinScale],
  );

  const toggle = (key: LegendKey) =>
    setHidden((cur) => {
      const next = new Set(cur);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="relative isolate overflow-hidden border border-line bg-white" style={{ height: 660 }}>
      <MapContainer
        // key theo ảnh để dựng lại bản đồ khi đổi mặt bằng
        key={imageUrl ?? pdfUrl}
        crs={CRS.Simple}
        bounds={bounds}
        maxBounds={bounds}
        maxBoundsViscosity={1}
        minZoom={cloud ? -((stored ? pdfTiles?.levels ?? 3 : 3) + 2) : -2}
        maxZoom={maxZoom}
        // Lăn chuột zoom mượt liên tục quanh con trỏ, không nhảy bậc / nảy ở giới hạn
        zoomSnap={0}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={120}
        bounceAtZoomLimits={false}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full bg-white!"
      >
        {imageUrl && <ImageOverlay url={imageUrl} bounds={bounds} />}
        {cloud && <CloudinaryPdfLayer pdfUrl={pdfUrl} page={pdfPage ?? 1} width={width} height={height} density={pdfDensity} stored={stored ? pdfTiles : undefined} />}
        {pdfUrl && !cloud && <PdfTileLayer pdfUrl={pdfUrl} page={pdfPage ?? 1} width={width} height={height} maxZoom={maxZoom} />}
        <ZoomControl position="topleft" />
        {markers.map(({ u, icon }) => (
          <Marker
            key={u.id}
            position={toLatLng(u.x, u.y, width, height)}
            icon={icon}
            zIndexOffset={selected === u.id ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(u.id) }}
          />
        ))}
      </MapContainer>

      {legend.length > 0 && (
        <div className="absolute left-1/2 top-3 z-500 flex max-w-[calc(100%-2rem)] -translate-x-1/2 flex-wrap justify-center gap-2" role="group" aria-label="Lọc theo loại quỹ">
          {legend.map((l) => {
            const off = hidden.has(l.key);
            return (
              <button
                key={l.key}
                type="button"
                onClick={() => toggle(l.key)}
                aria-pressed={!off}
                className={`flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-heading shadow transition hover:bg-white ${off ? "opacity-50" : ""}`}
              >
                <svg viewBox="0 0 40 50" width="12" height="15" aria-hidden>
                  <path d="M20 48C20 48 3 31 3 19a17 17 0 0 1 34 0c0 12-17 29-17 29z" fill={l.color} />
                </svg>
                {l.label}
              </button>
            );
          })}
        </div>
      )}

      <p className="absolute bottom-4 left-4 z-500 rounded-lg bg-white/90 px-3 py-1.5 text-[11px] text-body shadow">
        {hint}
      </p>
    </div>
  );
}
