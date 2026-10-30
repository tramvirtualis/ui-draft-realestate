import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ExternalLink, MapPin, Navigation } from "lucide-react";
import LuxuryHeading from "../luxury/LuxuryHeading";
import {
  PROJECT_COLOR,
  PROJECT_ICON,
  TILE_ATTRIBUTION,
  TILE_URL,
  projectIcon,
} from "./mapIcons";

type Props = {
  name: string;
  address: string;
  center: { lat: number; lng: number } | null;
  directionsUrl: string | null;
};

// Bản đồ vị trí dự án kèm thẻ thông tin (nổi trên bản đồ ở màn lớn, nằm dưới bản đồ trên điện thoại);
// chưa có toạ độ thì dùng bản đồ Google theo địa chỉ
export default function LocationMap({
  name,
  address,
  center,
  directionsUrl,
}: Props) {
  if (!center && !address) return null;
  const query = center ? `${center.lat},${center.lng}` : address;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;

  return (
    <section
      id="ban-do"
      aria-label="Bản đồ vị trí"
      className="scroll-mt-36 py-16 md:py-24"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <LuxuryHeading eyebrow="Bản đồ vị trí" title={`${name} trên bản đồ`} />

        <div className="relative isolate overflow-hidden border border-line shadow-sm">
          <div className="h-[360px] sm:h-[460px] md:h-[580px]">
            {center ? (
              <MapContainer
                center={[center.lat, center.lng]}
                zoom={15}
                zoomControl={false}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
                <ZoomControl position="bottomright" />
                <Marker
                  position={[center.lat, center.lng]}
                  icon={projectIcon()}
                  title={name}
                >
                  <Popup>
                    <p className="!m-0 text-sm font-semibold text-heading">
                      {name}
                    </p>
                    {address && (
                      <p className="!m-0 !mt-1 text-xs text-body">{address}</p>
                    )}
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <iframe
                title={`Bản đồ vị trí ${name}`}
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  address
                )}&output=embed`}
                className="h-full w-full"
              />
            )}
          </div>

          <div className="z-500 border-t border-line bg-white p-5 md:absolute md:left-5 md:top-5 md:w-80 md:rounded-2xl md:border md:border-white/60 md:bg-white/95 md:shadow-xl md:backdrop-blur">
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: PROJECT_COLOR }}
                aria-hidden
              >
                <PROJECT_ICON size={18} />
              </span>
              <p className="min-w-0 font-semibold leading-snug text-heading">
                {name}
              </p>
            </div>
            {address && (
              <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-body">
                <MapPin
                  size={15}
                  className="mt-1 shrink-0 text-gold-500"
                  aria-hidden
                />{" "}
                {address}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95"
                >
                  <Navigation size={14} aria-hidden /> Chỉ đường
                </a>
              )}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-navy/15 px-4 py-2.5 text-sm font-semibold text-navy transition hover:border-navy hover:bg-primary-50/60"
              >
                <ExternalLink size={14} aria-hidden /> Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
