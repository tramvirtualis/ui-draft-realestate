import { useEffect, useMemo } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import ProjectTabs from "../../../components/Project/Detail/ProjectTabs";
import { isHighRise } from "../../../components/Admin/project/general/buildingType";
import LuxuryHero from "../../../components/Project/Detail/luxury/LuxuryHero";
import QuickFacts from "../../../components/Project/Detail/luxury/QuickFacts";
import IntroSection from "../../../components/Project/Detail/luxury/IntroSection";
import EditorialGallery from "../../../components/Project/Detail/luxury/EditorialGallery";
import FaqSection from "../../../components/Project/Detail/luxury/FaqSection";
import CtaBand from "../../../components/Project/Detail/luxury/CtaBand";
import DetailSkeleton from "../../../components/Project/Detail/luxury/DetailSkeleton";
import AmenitiesSection from "../../../components/Project/Detail/overview/AmenitiesSection";
import VideosSection from "../../../components/Project/Detail/overview/VideosSection";
import { useProjectOverview } from "../../../hooks/project/useProjectOverview";
import { useSeo } from "../../../hooks/useSeo";
import { htmlToText } from "../../../utils/richText";
import { parseProjectId, projectPath } from "../../../utils/slug";
import { parseVideoSource } from "../../../utils/videoSource";

const SITE_NAME = "Đất Việt Group";
const FALLBACK_HERO = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80";

const truncate = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, text.lastIndexOf(" ", max)).trim()}…`;

// Trang tổng quan dự án: hero, thông tin nhanh, giới thiệu, thư viện, tiện ích, video, FAQ và CTA cuối trang.
// Phân khu, chính sách, tiến độ... đã có tab riêng (thanh ProjectTabs) nên không lặp lại ở đây. Mục không có dữ liệu thì ẩn hoặc báo trống.
export default function ProjectDetailPage() {
  const { id: param } = useParams();
  const projectId = parseProjectId(param);
  const state = useProjectOverview(projectId);
  const { hash: rawHash, search } = useLocation();
  const hash = rawHash.replace("#", "");
  const data = state.status === "ready" ? state.data : null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const path = projectId !== undefined && data ? projectPath(projectId, data.project.name) : `/projects/${param ?? ""}`;
  const canonical = `${origin}${path}`;

  // SEO: tiêu đề, mô tả, canonical, Open Graph và JSON-LD chỉ dùng thông tin có thật
  const seo = useMemo(() => {
    if (!data) {
      return { title: `Chi tiết dự án | ${SITE_NAME}`, description: "Thông tin chi tiết dự án bất động sản.", image: null, jsonLd: [] as object[] };
    }
    const { project, profile, gallery, faqs, videos } = data;
    const intro = htmlToText(profile.developmentModel);
    const place = [profile.buildingType, profile.investor && `chủ đầu tư ${profile.investor}`, profile.location && `tại ${profile.location}`]
      .filter(Boolean)
      .join(", ");
    const description = truncate(
      intro || `Thông tin chi tiết dự án ${project.name}${place ? `: ${place}` : ""}. Xem quỹ căn, chính sách bán hàng, tiến độ và tài liệu.`,
      158,
    );
    const image = profile.overviewImage ?? gallery[0]?.src ?? null;

    const jsonLd: object[] = [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: `${origin}/` },
          { "@type": "ListItem", position: 2, name: "Dự án", item: `${origin}/projects` },
          { "@type": "ListItem", position: 3, name: project.name, item: canonical },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "Place",
        name: project.name,
        url: canonical,
        description,
        ...(image ? { image } : {}),
        ...(profile.location ? { address: profile.location } : {}),
      },
    ];
    if (faqs.length > 0) {
      jsonLd.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      });
    }
    videos.forEach((v) => {
      const src = parseVideoSource(v.url);
      if (src.kind !== "youtube") return; // VideoObject cần ảnh bìa; chỉ khai báo khi có thật
      jsonLd.push({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: v.name,
        description: v.description || `Video giới thiệu dự án ${project.name}`,
        thumbnailUrl: src.poster,
        uploadDate: v.createdAt,
        embedUrl: `https://www.youtube.com/embed/${src.id}`,
      });
    });

    return {
      title: `${project.name}${profile.location ? ` - ${profile.location}` : ""} | ${SITE_NAME}`,
      description,
      image,
      jsonLd,
    };
  }, [data, canonical, origin]);

  useSeo({ title: seo.title, description: seo.description, canonical, image: seo.image, jsonLd: seo.jsonLd });
  // Cuộn tới mục sau khi dữ liệu đã hiển thị (trước đó các mục chưa tồn tại)
  useEffect(() => {
    if (!data) return;
    if (hash) document.getElementById(hash)?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [hash, data]);

  if (state.status === "loading") return <DetailSkeleton />;

  if (state.status === "error" || !data || projectId === undefined) {
    return (
      <div className="overflow-x-clip px-4 py-24 text-center" role="alert">
        <p className="heading-display text-2xl text-heading md:text-3xl">{state.status === "error" ? state.message : "Không tìm thấy dự án"}</p>
        <Link
          to="/projects"
          className="btn-gloss mt-6 inline-block rounded-full px-6 py-3 font-heading text-xs font-bold uppercase tracking-widest text-white transition hover:-translate-y-0.5"
        >
          Về danh sách dự án
        </Link>
      </div>
    );
  }

  // URL chưa có slug (hoặc slug cũ) → chuyển về địa chỉ thân thiện chuẩn
  if (param !== path.replace("/projects/", "")) {
    return <Navigate to={`${path}${search}${rawHash}`} replace />;
  }

  const { project, profile, gallery, zones, amenities, videos, faqs, propertyTotal } = data;
  const heroImage = profile.overviewImage ?? gallery[0]?.src ?? FALLBACK_HERO;
  // Ảnh đặt dưới phần giới thiệu: ảnh thư viện đầu tiên khác ảnh hero (không có thì bỏ qua)
  const introImage = gallery.find((g) => g.src !== heroImage)?.src ?? null;

  return (
    <div data-project={projectId} className="overflow-x-clip bg-page">
      <ProjectTabs activeHash={hash} highRise={data ? isHighRise(data.profile.buildingType) : undefined} />

      <LuxuryHero
        projectId={projectId}
        basePath={path}
        name={project.name}
        location={profile.location}
        image={heroImage}
        status={profile.saleStatus}
        price={project.price}
      />
      <QuickFacts profile={profile} />
      <IntroSection
        name={project.name}
        basePath={path}
        profile={profile}
        price={project.price}
        image={introImage}
        stats={[
          { label: "Phân khu", value: zones.length },
          { label: "Sản phẩm", value: propertyTotal },
        ]}
      />
      <EditorialGallery name={project.name} images={gallery} />
      <AmenitiesSection amenities={amenities} />
      <VideosSection videos={videos} />
      <FaqSection name={project.name} faqs={faqs} />
      <CtaBand name={project.name} basePath={path} />
    </div>
  );
}
