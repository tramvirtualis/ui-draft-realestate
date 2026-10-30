import { useEffect, useMemo } from "react";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  ZoomControl,
  useMap,
} from "react-leaflet";
import { CRS, type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  formatSheetPrice,
  fundColor,
  salesSheetBadgeIcon,
} from "../../../Admin/project/salesSheet/salesSheetPin";
import { toLatLng, usePlanSize } from "../floorPlan/planCoords";
import CloudinaryPdfLayer from "../floorPlan/CloudinaryPdfLayer";
import SvgSheetLayer, { isSvgUrl, SVG_MAX_ZOOM } from "../floorPlan/SvgSheetLayer";
import PdfTileLayer from "../floorPlan/PdfTileLayer";
import type {
  SalesSheetDetail,
  SalesSheetPin,
} from "../../../../types/project/salesSheet.types";
import { FileSpreadsheet, AlertCircle, Loader2 } from "lucide-react";

interface Props {
  sheet: SalesSheetDetail | null;
  loading?: boolean;
  hiddenFunds: Set<string>;
  selectedPinId: number | null;
  onSelectPin: (pin: SalesSheetPin | null) => void;
  emptyBuildingName?: string; // đã chọn tòa nhưng tòa chưa có bảng hàng: để trống vùng bảng hàng
}

// Khung chung cho các trạng thái tải / trống / lỗi
const STATE_BOX = "flex min-h-[480px] w-full flex-col items-center justify-center rounded-[1.75rem] p-8 text-center";

// Tự động căn giữa bản vẽ 1 lần duy nhất khi nạp bảng hàng (tránh bị reset khi người dùng kéo bản đồ)
function FitBoundsOnLoad({
  bounds,
  sheetId,
}: {
  bounds: LatLngBoundsExpression;
  sheetId: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { animate: false, padding: [10, 10] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, sheetId]);
  return null;
}

export default function SalesSheetViewer({
  sheet,
  loading = false,
  hiddenFunds,
  selectedPinId,
  onSelectPin,
  emptyBuildingName,
}: Props) {
  const size = usePlanSize(sheet);

  // Lọc danh sách ghim theo quỹ bật / tắt
  const visiblePins = useMemo(() => {
    if (!sheet?.pins) return [];
    return sheet.pins.filter((pin) => {
      const fundKey = pin.fundType ?? "UNCLASSIFIED";
      return !hiddenFunds.has(fundKey);
    });
  }, [sheet?.pins, hiddenFunds]);

  // Luôn khai báo hook ở đầu component để tuân thủ quy tắc React Hooks
  const validWidth = size && size !== "error" ? size.width : 0;
  const validHeight = size && size !== "error" ? size.height : 0;

  const bounds = useMemo<LatLngBoundsExpression>(() => {
    return [
      [0, 0],
      [validHeight, validWidth],
    ];
  }, [validHeight, validWidth]);

  // Cho kéo ra ngoài bản vẽ một khoảng vừa đủ (xem được cột sát mép phải) nhưng không lạc ra vùng trống rộng
  const extendedBounds = useMemo<LatLngBoundsExpression>(() => {
    const padX = validWidth * 0.3;
    const padY = validHeight * 0.3;
    return [
      [-padY, -padX],
      [validHeight + padY, validWidth + padX],
    ];
  }, [validHeight, validWidth]);

  if (loading) {
    return (
      <div className={`${STATE_BOX} border border-white/80 bg-white/75`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <p className="mt-3 text-sm font-medium text-body">Đang tải bảng hàng tòa nhà...</p>
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className={`${STATE_BOX} border border-dashed border-primary-200 bg-white/60`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
          <FileSpreadsheet size={24} />
        </div>
        <h4 className="mt-3 font-heading text-base font-extrabold uppercase text-heading">
          {emptyBuildingName ? `Tòa ${emptyBuildingName} chưa có bảng hàng` : "Chưa chọn bảng hàng"}
        </h4>
        <p className="mt-1 text-xs text-body">
          {emptyBuildingName
            ? "Bảng hàng của tòa này sẽ được cập nhật sớm."
            : "Vui lòng chọn tòa nhà ở danh sách phía trên để xem bảng hàng chi tiết."}
        </p>
      </div>
    );
  }

  const hasDrawing = Boolean(sheet.imageUrl || sheet.pdfUrl);

  if (!hasDrawing) {
    return (
      <div className={`${STATE_BOX} border border-dashed border-primary-200 bg-white/60`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
          <AlertCircle size={24} />
        </div>
        <h4 className="mt-3 font-heading text-base font-extrabold uppercase text-heading">
          Tòa nhà chưa cập nhật bản vẽ bảng hàng
        </h4>
        <p className="mt-1 max-w-md text-xs text-body">
          Bảng hàng cho tòa {sheet.buildingName || sheet.name} đang trong quá trình cập nhật sơ đồ ma trận.
        </p>
      </div>
    );
  }

  if (size === "error") {
    return (
      <div className={`${STATE_BOX} border border-rose-200 bg-rose-50/60`}>
        <AlertCircle className="h-8 w-8 text-rose-500" />
        <h4 className="mt-2 text-base font-bold text-rose-800">
          Không thể tải bản vẽ bảng hàng
        </h4>
        <p className="mt-1 text-xs text-rose-600">
          Vui lòng kiểm tra lại đường truyền hoặc thử lại sau.
        </p>
      </div>
    );
  }

  if (!size) {
    return (
      <div className={`${STATE_BOX} border border-white/80 bg-white/75`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <p className="mt-3 text-sm text-body">Đang chuẩn bị bản vẽ...</p>
      </div>
    );
  }

  const stored = size.mode === "stored" && !!sheet.pdfUrl && !!sheet.tileBaseUrl;
  const cloud = stored || (size.mode === "cloudinary" && !!sheet.pdfUrl && size.density !== undefined);
  const svg = isSvgUrl(sheet.imageUrl); // bảng hàng dựng từ Excel
  const maxZoom = svg ? SVG_MAX_ZOOM : stored ? 1 : cloud || sheet.pdfUrl ? 5 : 2;

  return (
    <div className="relative isolate overflow-hidden border border-white/80 bg-white shadow-[0_24px_50px_-30px_rgba(10,15,26,0.45)]">
      {/* Khung bản đồ Leaflet */}
      <div className="relative z-0 isolate h-[560px] w-full md:h-[680px] lg:h-[760px]">
        <MapContainer
          key={`${sheet.id}-${sheet.imageUrl ?? sheet.pdfUrl}`}
          crs={CRS.Simple}
          bounds={bounds}
          maxBounds={extendedBounds}
          // Kéo tới mép thì dừng hẳn (không trôi ra rồi bị kéo giật về)
          maxBoundsViscosity={1}
          minZoom={cloud ? -((stored ? sheet.tileLevels ?? 3 : 3) + 2) : -3}
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
          <FitBoundsOnLoad bounds={bounds} sheetId={sheet.id} />

          {sheet.imageUrl &&
            (svg ? (
              <SvgSheetLayer url={sheet.imageUrl} width={size.width} height={size.height} />
            ) : (
              <ImageOverlay url={sheet.imageUrl} bounds={bounds} />
            ))}

          {cloud && (
            <CloudinaryPdfLayer
              pdfUrl={sheet.pdfUrl!}
              page={sheet.pdfPage ?? 1}
              width={size.width}
              height={size.height}
              density={size.density}
              stored={
                stored
                  ? { baseUrl: sheet.tileBaseUrl!, levels: sheet.tileLevels! }
                  : undefined
              }
            />
          )}

          {!cloud && sheet.pdfUrl && (
            <PdfTileLayer
              pdfUrl={sheet.pdfUrl}
              page={sheet.pdfPage ?? 1}
              width={size.width}
              height={size.height}
              maxZoom={maxZoom}
            />
          )}

          {/* Render các ghim căn hộ dạng thẻ giá */}
          {visiblePins.map((pin) => {
            const [lat, lng] = toLatLng(pin.x, pin.y, size.width, size.height);
            const displayText = formatSheetPrice(pin.price) || pin.propertyCode;
            const isSelected = selectedPinId === pin.id;

            const icon = salesSheetBadgeIcon({
              color: fundColor(pin.fundType),
              label: displayText,
              title: `Căn ${pin.propertyCode}${pin.price ? ` · ${formatSheetPrice(pin.price)}` : ""}${pin.area ? ` · ${pin.area}m²` : ""}`,
              active: isSelected,
              scale: sheet.pinScale ?? 1,
            });

            return (
              <Marker
                key={pin.id}
                position={[lat, lng]}
                icon={icon}
                eventHandlers={{
                  click: () => onSelectPin(isSelected ? null : pin),
                }}
              />
            );
          })}

          <ZoomControl position="bottomright" />
        </MapContainer>
      </div>

      {/* Thông tin số lượng ghim đang hiển thị ở góc trên bên trái */}
      <div className="pointer-events-none absolute left-3 top-3 z-[1000] flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-body shadow-sm backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-success" />
        <span>
          Đang hiển thị <b className="text-heading">{visiblePins.length}</b>/{sheet.pins?.length ?? 0} căn
        </span>
      </div>
    </div>
  );
}
