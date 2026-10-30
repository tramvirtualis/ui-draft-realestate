import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProjectTabs from "../../../components/Project/Detail/ProjectTabs";
import Lightbox from "../../../components/common/Lightbox";
import LocationHero, {
  type LocationSectionLink,
} from "../../../components/Project/Detail/location/LocationHero";
import LocationAdvantages from "../../../components/Project/Detail/location/LocationAdvantages";
import LocationMap from "../../../components/Project/Detail/location/LocationMap";
import LocationArticle from "../../../components/Project/Detail/location/LocationArticle";
import LocationGallery from "../../../components/Project/Detail/location/LocationGallery";
import { useProjectData } from "../../../hooks/project/useProjectData";
import { useSeo } from "../../../hooks/useSeo";
import { projectExtrasService } from "../../../services/project/projectExtrasService";
import { isRichTextEmpty } from "../../../utils/richText";
import { parseProjectId } from "../../../utils/slug";
import type { ViewImage } from "../../../types/project/progress.types";

const load = projectExtrasService.getLocation;
const SITE_NAME = "Đất Việt Group";

type Viewer = { images: ViewImage[]; index: number } | null;

// Trang Vị trí: tiêu đề, ảnh tổng quan, bản đồ tiện ích xung quanh, bài viết phân tích và thư viện ảnh.
// Nội dung do admin nhập ở "Quản lý vị trí"; mục nào chưa có dữ liệu thì ẩn.
export default function ProjectLocationPage() {
  const { id } = useParams();
  const projectId = parseProjectId(id);
  const base = `/projects/${id}`;
  const state = useProjectData(projectId, load);
  const [viewer, setViewer] = useState<Viewer>(null);

  const data = state.status === "ready" ? state.data : null;
  const project = data?.project;
  const location = data?.location;
  const center =
    location?.latitude != null && location.longitude != null
      ? { lat: location.latitude, lng: location.longitude }
      : null;
  const directionsUrl = center
    ? `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`
    : project?.location
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        project.location
      )}`
    : null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  useSeo({
    title: project
      ? `Vị trí ${project.name}${
          project.location ? ` - ${project.location}` : ""
        } | ${SITE_NAME}`
      : `Vị trí dự án | ${SITE_NAME}`,
    description:
      location?.intro?.slice(0, 158) ||
      (project
        ? `Vị trí dự án ${project.name}${
            project.location ? ` tại ${project.location}` : ""
          }: bản đồ, tiện ích xung quanh và phân tích kết nối khu vực.`
        : "Vị trí dự án bất động sản."),
    canonical: `${origin}${base}/location`,
    image: project?.overviewImage ?? null,
    jsonLd: project
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Place",
            name: project.name,
            url: `${origin}${base}/location`,
            ...(project.location ? { address: project.location } : {}),
            ...(center
              ? {
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: center.lat,
                    longitude: center.lng,
                  },
                }
              : {}),
          },
        ]
      : [],
  });

  if (state.status === "loading") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div
          className="container mx-auto animate-pulse px-4 py-10 lg:px-8"
          aria-busy="true"
          aria-label="Đang tải vị trí dự án"
        >
          <div className="h-4 w-48 rounded bg-primary-100" />
          <div className="mt-8 h-14 w-2/3 rounded bg-primary-100" />
          <div className="mt-10 aspect-[21/9] rounded-3xl bg-primary-50" />
        </div>
      </div>
    );
  }

  if (state.status === "error" || !project || !location) {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div className="px-4 py-24 text-center" role="alert">
          <p className="text-xl font-semibold text-heading">
            {state.status === "error" ? state.message : "Không tìm thấy dự án"}
          </p>
          <Link
            to="/projects"
            className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700"
          >
            Về danh sách dự án
          </Link>
        </div>
      </div>
    );
  }

  const galleryImages: ViewImage[] = location.images.map((i) => ({
    src: i.imageUrl,
    title: project.name,
    date: null,
  }));
  const hasArticle = Boolean(
    location.content && !isRichTextEmpty(location.content)
  );
  const hasMap = center !== null || Boolean(project.location);
  // Mục lục trong hero: chỉ các mục đang có nội dung, đúng thứ tự trên trang
  const sections: LocationSectionLink[] = [
    location.advantages.length > 0 && {
      id: "diem-thuan-loi",
      label: "Điểm thuận lợi",
    },
    hasArticle && { id: "phan-tich", label: "Phân tích vị trí" },
    location.images.length > 0 && { id: "hinh-anh", label: "Hình ảnh vị trí" },
    hasMap && { id: "ban-do", label: "Bản đồ" },
  ].filter((s): s is LocationSectionLink => Boolean(s));

  return (
    <div className="overflow-x-clip bg-page">
      <ProjectTabs />

      <LocationHero
        basePath={base}
        name={project.name}
        address={project.location}
        intro={location.intro}
        image={project.overviewImage}
        directionsUrl={directionsUrl}
        sections={sections}
        onOpenImage={() =>
          setViewer({
            images: [
              { src: project.overviewImage, title: project.name, date: null },
            ],
            index: 0,
          })
        }
      />

      <LocationAdvantages
        name={project.name}
        advantages={location.advantages}
      />

      {hasArticle && (
        <LocationArticle
          title={location.articleTitle ?? `Phân tích vị trí ${project.name}`}
          content={location.content ?? ""}
          address={project.location}
          directionsUrl={directionsUrl}
          hasMap={hasMap}
        />
      )}

      <LocationGallery
        name={project.name}
        images={location.images}
        onOpen={(index) => setViewer({ images: galleryImages, index })}
      />

      {/* Bản đồ thực tế ở cuối trang */}
      <LocationMap
        name={project.name}
        address={project.location}
        center={center}
        directionsUrl={directionsUrl}
      />

      {viewer && (
        <Lightbox
          images={viewer.images}
          index={viewer.index}
          onIndexChange={(index) => setViewer((v) => (v ? { ...v, index } : v))}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}
