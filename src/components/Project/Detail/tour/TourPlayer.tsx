import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import PanoramaViewer, { type PanoramaViewerHandle } from "./PanoramaViewer";
import useFocusTrap from "../../../common/useFocusTrap";
import SafeImage from "../../../common/SafeImage";
import { coverUrl } from "./pannellum";
import type { TourDto, TourHotspotDto, TourSceneDto } from "../../../../types/project/tour.types";

// Popup thông tin của điểm loại INFO
function InfoPopup({ hotspot, onClose }: { hotspot: TourHotspotDto; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useFocusTrap(root, true, onClose);
  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-ink-950/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose} role="presentation">
      <div
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-info-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="animate-page-in max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-3xl"
      >
        {hotspot.imageUrl && <SafeImage src={coverUrl(hotspot.imageUrl, 1200)} alt={hotspot.title} className="max-h-72 w-full object-cover" />}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 id="tour-info-title" className="font-heading text-xl font-semibold text-navy">{hotspot.title}</h3>
            <button type="button" onClick={onClose} aria-label="Đóng" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-navy/10 text-navy hover:bg-primary-50">
              <X size={16} />
            </button>
          </div>
          {hotspot.description && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-body">{hotspot.description}</p>}
        </div>
      </div>
    </div>,
    document.body,
  );
}

type Props = {
  tour: TourDto;
  className?: string;
};

/**
 Trình phát tour cho khách: bắt đầu từ cảnh mở đầu, bấm điểm để chuyển cảnh con hoặc xem thông tin,
 breadcrumb theo cây cảnh (cha → con) và nút quay lại cảnh cha.
 */
export default function TourPlayer({ tour, className = "h-[520px]" }: Props) {
  const scenes = useMemo(() => tour.scenes ?? [], [tour.scenes]);
  const byId = useMemo(() => new Map(scenes.map((s) => [s.id, s])), [scenes]);
  const entry = (tour.entrySceneId && byId.get(tour.entrySceneId)) || scenes.find((s) => s.parentSceneId === null) || scenes[0];
  const [sceneId, setSceneId] = useState<number | null>(entry?.id ?? null);
  const [info, setInfo] = useState<TourHotspotDto | null>(null);
  const viewer = useRef<PanoramaViewerHandle>(null);

  const current: TourSceneDto | undefined = sceneId !== null ? byId.get(sceneId) : undefined;

  // Đường dẫn từ cảnh gốc tới cảnh hiện tại theo quan hệ cha-con
  const trail = useMemo(() => {
    const list: TourSceneDto[] = [];
    const seen = new Set<number>();
    let cur = current;
    while (cur && !seen.has(cur.id)) {
      seen.add(cur.id);
      list.unshift(cur);
      cur = cur.parentSceneId !== null ? byId.get(cur.parentSceneId) : undefined;
    }
    return list;
  }, [current, byId]);

  if (!current) {
    return <div className={`flex items-center justify-center rounded-3xl bg-primary-50 text-sm text-body ${className}`}>Tour chưa có cảnh nào.</div>;
  }

  const parent = current.parentSceneId !== null ? byId.get(current.parentSceneId) : undefined;

  const onHotspot = (h: TourHotspotDto) => {
    if (h.type === "SCENE" && h.targetSceneId !== null && byId.has(h.targetSceneId)) setSceneId(h.targetSceneId);
    else if (h.type === "INFO") setInfo(h);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <PanoramaViewer ref={viewer} scenes={scenes} sceneId={current.id} onHotspotClick={onHotspot} version={tour.id} className="h-full w-full" />

      {/* Breadcrumb + quay lại */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3 sm:p-4">
        <div className="pointer-events-auto flex max-w-full items-center gap-2">
          {parent && (
            <button
              type="button"
              onClick={() => setSceneId(parent.id)}
              className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-white/95 px-3 text-xs font-semibold text-navy shadow transition hover:bg-white"
            >
              <ChevronLeft size={15} aria-hidden /> Quay lại
            </button>
          )}
          <nav aria-label="Vị trí trong tour" className="min-w-0 overflow-x-auto rounded-full bg-black/55 px-3 py-2 text-xs text-white backdrop-blur">
            <ol className="flex items-center gap-1 whitespace-nowrap">
              {trail.map((s, i) => (
                <li key={s.id} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={12} className="text-white/50" aria-hidden />}
                  {i < trail.length - 1 ? (
                    <button type="button" onClick={() => setSceneId(s.id)} className="text-white/75 hover:text-white hover:underline">{s.title}</button>
                  ) : (
                    <span className="font-semibold" aria-current="location">{s.title}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <button
          type="button"
          onClick={() => viewer.current?.toggleFullscreen()}
          aria-label="Xem toàn màn hình"
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-navy shadow transition hover:bg-white"
        >
          <Expand size={15} />
        </button>
      </div>

      {info && <InfoPopup hotspot={info} onClose={() => setInfo(null)} />}
    </div>
  );
}
