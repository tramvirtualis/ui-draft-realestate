import { useMemo } from "react";
import { MapContainer, ImageOverlay, Marker, ZoomControl, useMapEvents } from "react-leaflet";
import { CRS, type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { fromLatLng, toLatLng } from "../../../Project/Detail/floorPlan/planCoords";
import { fundColor, pinIcon } from "../../../Project/Detail/floorPlan/planPins";
import PdfTileLayer from "../../../Project/Detail/floorPlan/PdfTileLayer";
import CloudinaryPdfLayer from "../../../Project/Detail/floorPlan/CloudinaryPdfLayer";
import type { FundType } from "../../../../types/project/project.types";

// id: căn (dự án thấp tầng) hoặc tòa nhà (dự án cao tầng)
export type EditorPin = { id: number; code: string; fundType: FundType | null; x: number; y: number };

type Props = {
  imageUrl?: string | null; // không có thì dùng PDF trực tiếp
  width: number;
  height: number;
  pins: EditorPin[];
  activeId: number | null; // căn đang được gán vị trí
  onPlace: (x: number, y: number) => void; // bấm lên ảnh: đặt vị trí cho căn đang chọn
  onMove: (id: number, x: number, y: number) => void; // kéo thả điểm
  onSelect: (id: number) => void;
  pinScale: number; // kích thước ghim đang chỉnh (xem trước ngay)
  canPlace?: boolean; // cho phép nhấp lên ảnh để ghim ngay cả khi chưa chọn căn cụ thể
  pdfUrl?: string | null;
  pdfPage?: number | null;
  pdfMode?: "stored" | "cloudinary" | "pdfjs";
  pdfTiles?: { baseUrl: string; levels: number }; // bộ ô đã cắt sẵn (pdfMode = "stored")
  pdfDensity?: number; // dpi của raster ở mức zoom 0 (chế độ cloudinary)
};

function ClickLayer({ width, height, enabled, onPlace }: { width: number; height: number; enabled: boolean; onPlace: Props["onPlace"] }) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      const { x, y } = fromLatLng(e.latlng.lat, e.latlng.lng, width, height);
      onPlace(x, y);
    },
  });
  return null;
}

// Bản đồ ảnh mặt bằng dùng Leaflet (CRS.Simple): bấm để đặt vị trí cho căn đang chọn, kéo điểm để chỉnh
export default function FloorPlanEditor({ imageUrl, width, height, pins, activeId, onPlace, onMove, onSelect, pinScale, canPlace, pdfUrl, pdfPage, pdfMode, pdfDensity, pdfTiles }: Props) {
  const stored = pdfMode === "stored" && !!pdfUrl && !!pdfTiles;
  const cloud = stored || (pdfMode === "cloudinary" && !!pdfUrl && pdfDensity !== undefined);
  const maxZoom = stored ? 1 : cloud || pdfUrl ? 5 : 2; // bộ ô cắt sẵn: cho phóng thêm 2× so với ảnh gốc ở mức sâu nhất
  const bounds: LatLngBoundsExpression = [[0, 0], [height, width]];

  const markers = useMemo(
    () =>
      pins.map((p) => ({
        p,
        icon: pinIcon({ color: fundColor(p.fundType), label: p.code, active: p.id === activeId, scale: pinScale }),
      })),
    [pins, activeId, pinScale],
  );

  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-line bg-white" style={{ height: 620 }}>
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
        className={`h-full w-full bg-white! ${activeId !== null || canPlace ? "cursor-crosshair" : ""}`}
      >
        {imageUrl && <ImageOverlay url={imageUrl} bounds={bounds} />}
        {cloud && <CloudinaryPdfLayer pdfUrl={pdfUrl} page={pdfPage ?? 1} width={width} height={height} density={pdfDensity} stored={stored ? pdfTiles : undefined} />}
        {pdfUrl && !cloud && <PdfTileLayer pdfUrl={pdfUrl} page={pdfPage ?? 1} width={width} height={height} maxZoom={maxZoom} />}
        <ZoomControl position="topright" />
        <ClickLayer width={width} height={height} enabled={activeId !== null || !!canPlace} onPlace={onPlace} />
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
