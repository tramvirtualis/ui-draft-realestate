import { useMemo } from "react";
import { MapContainer, ImageOverlay, Marker, ZoomControl, useMapEvents } from "react-leaflet";
import { CRS, type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { fromLatLng, toLatLng } from "../../../Project/Detail/floorPlan/planCoords";
import {
  formatSheetPrice,
  fundColor,
  salesSheetBadgeIcon,
} from "./salesSheetPin";
import PdfTileLayer from "../../../Project/Detail/floorPlan/PdfTileLayer";
import CloudinaryPdfLayer from "../../../Project/Detail/floorPlan/CloudinaryPdfLayer";
import SvgSheetLayer, { isSvgUrl, SVG_MAX_ZOOM } from "../../../Project/Detail/floorPlan/SvgSheetLayer";
import type { FundType } from "../../../../types/project/project.types";

export type SheetEditorPin = {
  id: number;
  code: string;
  price?: number | null;
  priceLabel?: string;
  fundType: FundType | null;
  x: number;
  y: number;
};

type Props = {
  imageUrl?: string | null;
  width: number;
  height: number;
  pins: SheetEditorPin[];
  activeId: number | null;
  onPlace: (x: number, y: number) => void;
  onMove: (id: number, x: number, y: number) => void;
  onSelect: (id: number) => void;
  pinScale: number;
  pdfUrl?: string | null;
  pdfPage?: number | null;
  pdfMode?: "stored" | "cloudinary" | "pdfjs";
  pdfTiles?: { baseUrl: string; levels: number };
  pdfDensity?: number;
};

function ClickLayer({
  width,
  height,
  onPlace,
}: {
  width: number;
  height: number;
  onPlace: Props["onPlace"];
}) {
  useMapEvents({
    click(e) {
      const { x, y } = fromLatLng(e.latlng.lat, e.latlng.lng, width, height);
      onPlace(x, y);
    },
  });
  return null;
}

/**
 * Bản đồ biên tập ma trận Bảng hàng dành riêng cho Sales Sheet
 * Sử dụng thẻ giá hình chữ nhật salesSheetBadgeIcon hiển thị số tiền theo màu quỹ
 * Hoàn toàn độc lập, không ảnh hưởng đến các bản vẽ/ghim khác trong hệ thống
 */
export default function SalesSheetEditor({
  imageUrl,
  width,
  height,
  pins,
  activeId,
  onPlace,
  onMove,
  onSelect,
  pinScale,
  pdfUrl,
  pdfPage,
  pdfMode,
  pdfDensity,
  pdfTiles,
}: Props) {
  const stored = pdfMode === "stored" && !!pdfUrl && !!pdfTiles;
  const cloud = stored || (pdfMode === "cloudinary" && !!pdfUrl && pdfDensity !== undefined);
  const svg = isSvgUrl(imageUrl); // bảng hàng dựng từ Excel
  const maxZoom = svg ? SVG_MAX_ZOOM : stored ? 1 : cloud || pdfUrl ? 5 : 2;
  const bounds: LatLngBoundsExpression = [
    [0, 0],
    [height, width],
  ];

  const markers = useMemo(
    () =>
      pins.map((p) => {
        const displayText = p.priceLabel || formatSheetPrice(p.price) || p.code;
        const icon = salesSheetBadgeIcon({
          color: fundColor(p.fundType),
          label: displayText,
          title: `Căn ${p.code}${p.price ? ` · ${formatSheetPrice(p.price)}` : ""}`,
          active: p.id === activeId,
          scale: pinScale,
        });
        return { p, icon };
      }),
    [pins, activeId, pinScale]
  );

  return (
    <div
      className="relative isolate overflow-hidden rounded-2xl border border-line bg-white shadow-xs"
      style={{ height: 620 }}
    >
      <MapContainer
        key={imageUrl ?? pdfUrl}
        crs={CRS.Simple}
        bounds={bounds}
        maxBounds={bounds}
        maxBoundsViscosity={1}
        minZoom={cloud ? -((stored ? pdfTiles?.levels ?? 3 : 3) + 2) : -2}
        maxZoom={maxZoom}
        zoomSnap={0.25}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full bg-white! cursor-crosshair"
      >
        {imageUrl && (svg ? <SvgSheetLayer url={imageUrl} width={width} height={height} /> : <ImageOverlay url={imageUrl} bounds={bounds} />)}
        {cloud && (
          <CloudinaryPdfLayer
            pdfUrl={pdfUrl}
            page={pdfPage ?? 1}
            width={width}
            height={height}
            density={pdfDensity}
            stored={stored ? pdfTiles : undefined}
          />
        )}
        {pdfUrl && !cloud && (
          <PdfTileLayer
            pdfUrl={pdfUrl}
            page={pdfPage ?? 1}
            width={width}
            height={height}
            maxZoom={maxZoom}
          />
        )}
        <ZoomControl position="topright" />
        <ClickLayer width={width} height={height} onPlace={onPlace} />
        {markers.map(({ p, icon }) => (
          <Marker
            key={p.id}
            position={toLatLng(p.x, p.y, width, height)}
            icon={icon}
            draggable
            zIndexOffset={p.id === activeId ? 1000 : 0}
            eventHandlers={{
              click: () => onSelect(p.id),
              dragend: (e) => {
                const ll = (e.target as L.Marker).getLatLng();
                const { x, y } = fromLatLng(ll.lat, ll.lng, width, height);
                onMove(p.id, x, y);
              },
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
