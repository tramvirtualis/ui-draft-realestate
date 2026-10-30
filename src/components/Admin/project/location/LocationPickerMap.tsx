import { useEffect, useState, type SyntheticEvent } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, Search } from "lucide-react";
import { TILE_ATTRIBUTION, TILE_URL, projectIcon } from "../../../Project/Detail/location/mapIcons";

export type LatLng = { lat: number; lng: number };

type Props = {
  value: LatLng | null; // vị trí dự án đang chọn (ghim kéo được)
  onChange: (point: LatLng) => void;
  initialQuery?: string;
  className?: string;
};

const VIETNAM: LatLng = { lat: 16.05, lng: 106.5 };
const round = (n: number) => Math.round(n * 1e6) / 1e6;

function ClickToPick({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: round(e.latlng.lat), lng: round(e.latlng.lng) }) });
  return null;
}

function FlyTo({ target }: { target: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 16), { duration: 0.6 });
  }, [map, target]);
  return null;
}

// Bản đồ chọn vị trí dự án: bấm lên bản đồ hoặc kéo ghim; ô tìm địa chỉ (OpenStreetMap) để tới nhanh khu vực
export default function LocationPickerMap({ value, onChange, initialQuery = "", className = "h-[380px]" }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [focus, setFocus] = useState<LatLng | null>(null);
  const start = value ?? VIETNAM;

  const search = async (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&accept-language=vi&q=${encodeURIComponent(query.trim())}`,
      );
      const found = (await res.json()) as { lat: string; lon: string }[];
      if (found.length === 0) {
        setSearchError("Không tìm thấy địa chỉ, hãy thử ghi ngắn gọn hơn hoặc bấm trực tiếp lên bản đồ.");
        return;
      }
      const point = { lat: round(Number(found[0].lat)), lng: round(Number(found[0].lon)) };
      setFocus(point);
      onChange(point);
    } catch {
      setSearchError("Không tìm được địa chỉ lúc này, hãy bấm trực tiếp lên bản đồ.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      {/* Nằm trong form trang: không lồng form, Enter để tìm */}
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void search(e)}
          placeholder="Tìm theo địa chỉ, ví dụ: Thủ Thiêm, TP. Thủ Đức"
          aria-label="Tìm địa chỉ trên bản đồ"
          className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-primary-600"
        />
        <button
          type="button"
          onClick={(e) => void search(e)}
          disabled={searching}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-xs font-semibold text-footer transition hover:bg-primary-50 disabled:opacity-60"
        >
          {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Tìm
        </button>
      </div>
      {searchError && <p className="mt-1.5 text-xs text-danger">{searchError}</p>}

      <div className={`relative isolate mt-2 overflow-hidden rounded-xl border border-line ${className}`}>
        <MapContainer center={[start.lat, start.lng]} zoom={value ? 15 : 5} className="h-full w-full cursor-crosshair">
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <ClickToPick onPick={onChange} />
          <FlyTo target={focus} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={projectIcon()}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const p = e.target.getLatLng();
                  onChange({ lat: round(p.lat), lng: round(p.lng) });
                },
              }}
            />
          )}
        </MapContainer>
        <p className="pointer-events-none absolute bottom-2 left-2 z-[500] rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-medium text-footer shadow">
          {value ? `${value.lat}, ${value.lng} · kéo ghim để chỉnh` : "Bấm lên bản đồ để đặt vị trí"}
        </p>
      </div>
    </div>
  );
}
