import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProjectTabs from "../../../components/Project/Detail/ProjectTabs";
import TourPlayer from "../../../components/Project/Detail/tour/TourPlayer";
import { useProjectData } from "../../../hooks/project/useProjectData";
import { projectExtrasService } from "../../../services/project/projectExtrasService";
import { tourService } from "../../../services/project/tourService";
import type { TourDto } from "../../../types/project/tour.types";
import { parseProjectId } from "../../../utils/slug";

const load = projectExtrasService.getTours;
const viewerSize = "h-[460px] sm:h-[600px] lg:h-[680px]";

// Trang Ảnh 360° của dự án: tour hiện ngay khi vào trang, nhiều tour thì chọn theo tab
export default function ProjectTourPage() {
  const { id } = useParams();
  const projectId = parseProjectId(id);
  const state = useProjectData(projectId, load);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [tour, setTour] = useState<TourDto | null>(null);
  const [tourError, setTourError] = useState(false);

  const tours = state.status === "ready" ? state.data.tours : [];
  const selectedId = activeId ?? tours[0]?.id ?? null;

  // Tải toàn bộ cảnh của tour đang chọn
  useEffect(() => {
    if (selectedId === null) return;
    let cancelled = false;
    setTour(null);
    setTourError(false);
    tourService
      .getPublishedTour(selectedId)
      .then((t) => !cancelled && setTour(t))
      .catch(() => !cancelled && setTourError(true));
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  if (state.status === "loading") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div className="container mx-auto animate-pulse px-4 py-16 lg:px-8" aria-busy="true">
          <div className="mx-auto h-12 w-80 rounded bg-primary-100" />
          <div className={`mt-10 rounded-3xl bg-primary-100/70 ${viewerSize}`} />
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div className="px-4 py-24 text-center" role="alert">
          <p className="text-xl font-semibold text-heading">{state.message}</p>
          <Link to="/projects" className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700">Về danh sách dự án</Link>
        </div>
      </div>
    );
  }

  const { project } = state.data;

  return (
    <div className="overflow-x-clip bg-page">
      <ProjectTabs />

      <div className="container mx-auto px-4 pb-20 pt-10 lg:px-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">{project.name}</span>
          <h1 className="heading-display mt-3 text-4xl text-heading md:text-6xl">Ảnh 360°</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-primary-500" />
            <span className="h-2 w-2 rotate-45 bg-primary-500" />
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-primary-500" />
          </div>
        </div>

        {tours.length === 0 ? (
          <p className="mx-auto max-w-4xl rounded-2xl border border-dashed border-primary-200 bg-white px-6 py-16 text-center text-body">
            Dự án chưa có ảnh 360°.
          </p>
        ) : (
          <>
            {tours.length > 1 && (
              <div className="mb-4 flex justify-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Chọn tour">
                {tours.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={t.id === selectedId}
                    onClick={() => setActiveId(t.id)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${t.id === selectedId ? "bg-primary-600 text-white" : "bg-white text-heading hover:bg-primary-100"}`}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            )}

            {tour && tour.id === selectedId ? (
              <TourPlayer key={tour.id} tour={tour} className={viewerSize} />
            ) : tourError ? (
              <p role="alert" className={`flex items-center justify-center rounded-3xl bg-white px-6 text-center text-body ${viewerSize}`}>
                Không mở được ảnh 360°, vui lòng thử lại sau.
              </p>
            ) : (
              <div className={`animate-pulse rounded-3xl bg-ink-950/90 ${viewerSize}`} aria-busy="true" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
