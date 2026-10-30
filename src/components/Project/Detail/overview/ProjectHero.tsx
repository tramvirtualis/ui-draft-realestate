import { Link } from "react-router-dom";
import { Heart, MapPin, ChevronRight, ArrowRight } from "lucide-react";
import Container from "../Container";
import { outlineBtn } from "../styles";
import type { ProjectOverview, GalleryImage } from "../../../../data/project/detail/overview";
import HeroGallery from "./HeroGallery";
import { useFavoriteProject } from "../../../../hooks/project/useFavoriteProject";

type Props = { project: ProjectOverview; gallery: GalleryImage[]; projectId?: number };

export default function ProjectHero({ project: p, gallery, projectId }: Props) {
  const { favorited: liked, busy, toggle } = useFavoriteProject(projectId); // bảng favorites

  return (
    <section className="bg-gradient-to-r from-primary-50 via-primary-100 to-primary-200 pb-12 pt-8">
      <Container>
        <nav className="flex items-center gap-3 text-xs text-muted">
          <Link to="/">Trang chủ</Link> <ChevronRight size={12} />
          <Link to="/projects">Dự án</Link> <ChevronRight size={12} />
          <span className="text-primary-600">{p.name}</span>
        </nav>

        <div className="mb-6 mt-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex gap-2">
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">{p.status}</span>
              <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">{p.updated}</span>
            </div>
            <h1 className="mt-4 text-5xl font-bold tracking-tight text-heading">{p.name}</h1>
            <p className="mt-4 flex items-center gap-2 text-lg text-body">
              <MapPin size={18} className="text-primary-600" /> {p.location}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted">Giá tham khảo</p>
            <p className="mt-2 text-4xl font-bold text-primary-600">{p.price}</p>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => void toggle()} disabled={busy} aria-pressed={liked} className={`${outlineBtn} bg-white disabled:opacity-60`}>
                {liked ? "Đã lưu" : "Lưu dự án"} <Heart size={16} className={liked ? "fill-primary-600 text-primary-600" : ""} />
              </button>
              <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-3 text-sm font-medium text-white hover:opacity-95">
                Nhận bảng giá <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <HeroGallery images={gallery} />
      </Container>
    </section>
  );
}
