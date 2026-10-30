import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { loadPannellum, panoramaUrl, type PnlmHotSpot, type PnlmScene, type PnlmViewer } from "./pannellum";
import type { TourHotspotDto, TourSceneDto } from "../../../../types/project/tour.types";
import "./tour.css";

export type PanoramaViewerHandle = {
  /** Góc nhìn hiện tại (để admin lưu làm góc nhìn ban đầu) */
  getView(): { yaw: number; pitch: number; hfov: number } | null;
  toggleFullscreen(): void;
};

type Props = {
  scenes: TourSceneDto[];
  sceneId: number;
  onHotspotClick?: (hotspot: TourHotspotDto) => void;
  /** Admin: bấm (không kéo) lên ảnh → toạ độ yaw/pitch của điểm vừa bấm */
  onPanoramaClick?: (coords: { yaw: number; pitch: number }) => void;
  /** Đổi giá trị này để dựng lại trình xem (vd sau khi admin sửa hotspot) mà vẫn giữ góc nhìn */
  version?: string | number;
  selectedHotspotId?: number | null;
  className?: string;
};

const DRAG_TOLERANCE = 5; // px: di chuyển ít hơn thế coi là bấm, không phải kéo xoay

function tooltip(div: HTMLDivElement, args: unknown) {
  const { hotspot, selected } = args as { hotspot: TourHotspotDto; selected: boolean };
  div.classList.add(hotspot.type === "SCENE" ? "dvg-hs-scene" : "dvg-hs-info");
  if (selected) div.classList.add("dvg-hs-selected");
  div.setAttribute("role", "button");
  div.setAttribute("tabindex", "0");
  div.setAttribute("aria-label", hotspot.type === "SCENE" ? `Đi tới: ${hotspot.title}` : `Xem thông tin: ${hotspot.title}`);
  const icon = document.createElement("span");
  icon.className = "dvg-hs-icon";
  icon.textContent = hotspot.type === "SCENE" ? "➜" : "i";
  const label = document.createElement("span");
  label.className = "dvg-hs-label";
  label.textContent = hotspot.title;
  div.append(icon, label);
}

/**
 Trình xem panorama 360° (Pannellum): kéo để xoay, cuộn / chụm để zoom, nút toàn màn hình.
 Toàn bộ cảnh được nạp vào một trình xem nên chuyển cảnh mờ dần mượt mà, không tải lại trang.
 */
const PanoramaViewer = forwardRef<PanoramaViewerHandle, Props>(function PanoramaViewer(
  { scenes, sceneId, onHotspotClick, onPanoramaClick, version, selectedHotspotId, className = "" },
  ref,
) {
  const box = useRef<HTMLDivElement>(null);
  const viewer = useRef<PnlmViewer | null>(null);
  const [error, setError] = useState("");
  // Hàm callback mới nhất (tránh dựng lại trình xem khi component cha render lại)
  const handlers = useRef({ onHotspotClick, onPanoramaClick });
  handlers.current = { onHotspotClick, onPanoramaClick };
  const currentScene = useRef(sceneId);

  useImperativeHandle(ref, () => ({
    getView: () => (viewer.current ? { yaw: viewer.current.getYaw(), pitch: viewer.current.getPitch(), hfov: viewer.current.getHfov() } : null),
    toggleFullscreen: () => viewer.current?.toggleFullscreen(),
  }));

  // Dựng trình xem (lần đầu hoặc khi dữ liệu cảnh đổi)
  useEffect(() => {
    let disposed = false;
    const container = box.current;
    if (!container || scenes.length === 0) return;
    const keep = viewer.current
      ? { yaw: viewer.current.getYaw(), pitch: viewer.current.getPitch(), hfov: viewer.current.getHfov(), scene: viewer.current.getScene() }
      : null;
    setError("");

    loadPannellum()
      .then((pnlm) => {
        if (disposed) return;
        viewer.current?.destroy();
        const sceneMap: Record<string, PnlmScene> = {};
        scenes.forEach((s) => {
          sceneMap[String(s.id)] = {
            type: "equirectangular",
            panorama: panoramaUrl(s.imageUrl),
            yaw: s.initialYaw ?? 0,
            pitch: s.initialPitch ?? 0,
            hfov: s.initialHfov ?? 100,
            hotSpots: (s.hotspots ?? []).map<PnlmHotSpot>((h) => ({
              pitch: h.pitch,
              yaw: h.yaw,
              cssClass: "dvg-hs",
              createTooltipFunc: tooltip,
              createTooltipArgs: { hotspot: h, selected: h.id === selectedHotspotId },
              clickHandlerFunc: (event) => {
                event.stopPropagation();
                handlers.current.onHotspotClick?.(h);
              },
            })),
          };
        });
        const first = keep && sceneMap[keep.scene] && keep.scene === String(currentScene.current) ? keep.scene : String(currentScene.current);
        const v = pnlm.viewer(container, {
          default: {
            firstScene: sceneMap[first] ? first : String(scenes[0].id),
            sceneFadeDuration: 700,
            autoLoad: true,
            crossOrigin: "anonymous",
            showControls: true,
            showFullscreenCtrl: true,
            showZoomCtrl: true,
            compass: false,
            minHfov: 40,
            maxHfov: 120,
            ...(keep && keep.scene === first ? { yaw: keep.yaw, pitch: keep.pitch, hfov: keep.hfov } : {}),
            strings: {
              loadingLabel: "Đang tải ảnh 360°...",
              loadButtonLabel: "Bấm để tải ảnh 360°",
              genericWebGLError: "Trình duyệt không hỗ trợ hiển thị ảnh 360° (WebGL).",
              textureSizeError: "Ảnh panorama quá lớn so với khả năng của thiết bị.",
              fileAccessError: "Không tải được ảnh panorama.",
              malformedURLError: "Đường dẫn ảnh panorama không hợp lệ.",
              iOS8WebGLError: "Thiết bị không hỗ trợ hiển thị ảnh 360°.",
              unknownError: "Không hiển thị được ảnh 360°.",
              twoTouchActivate: "Dùng hai ngón tay để xoay ảnh",
              twoTouchXActivate: "Dùng hai ngón tay để xoay ảnh",
              twoTouchYActivate: "Dùng hai ngón tay để xoay ảnh",
              ctrlZoomActivate: "Giữ Ctrl và cuộn chuột để phóng to",
            },
          },
          scenes: sceneMap,
        });
        v.on("error", (msg) => {
          if (disposed) return;
          setError(typeof msg === "string" ? msg : "Không hiển thị được ảnh 360°.");
        });
        viewer.current = v;
      })
      .catch(() => {
        if (disposed) return;
        setError("Không tải được trình xem 360°, vui lòng thử lại.");
      });

    return () => {
      disposed = true;
    };
    // scenes được dựng lại theo version; selectedHotspotId chỉ đổi giao diện điểm đang chọn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, selectedHotspotId, scenes.length]);

  // Huỷ trình xem khi rời trang
  useEffect(
    () => () => {
      viewer.current?.destroy();
      viewer.current = null;
    },
    [],
  );

  // Chuyển cảnh (mờ dần) khi cảnh được chọn thay đổi
  useEffect(() => {
    currentScene.current = sceneId;
    const v = viewer.current;
    if (v && v.getScene() !== String(sceneId)) {
      setError("");
      v.loadScene(String(sceneId));
    }
  }, [sceneId]);

  // Admin: phân biệt bấm và kéo xoay để đặt điểm đúng chỗ đã bấm
  const down = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    down.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = down.current;
    down.current = null;
    if (!start || !handlers.current.onPanoramaClick || !viewer.current) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > DRAG_TOLERANCE) return;
    if ((e.target as HTMLElement).closest(".pnlm-controls-container, .dvg-hs")) return;
    const [pitch, yaw] = viewer.current.mouseEventToCoords(e.nativeEvent as unknown as MouseEvent);
    handlers.current.onPanoramaClick({ yaw: Math.round(yaw * 100) / 100, pitch: Math.round(pitch * 100) / 100 });
  };

  return (
    <div className={`relative overflow-hidden bg-ink-950 ${className}`}>
      <div ref={box} className="h-full w-full" onPointerDown={onPointerDown} onPointerUp={onPointerUp} />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-950/85 p-6 text-center" role="alert">
          <div className="max-w-sm text-white">
            <AlertTriangle size={26} className="mx-auto text-gold-300" aria-hidden />
            <p className="mt-3 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default PanoramaViewer;
