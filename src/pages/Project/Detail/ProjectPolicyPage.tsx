import { Link, useParams } from "react-router-dom";
import ProjectTabs from "../../../components/Project/Detail/ProjectTabs";
import { useProjectData } from "../../../hooks/project/useProjectData";
import { projectExtrasService } from "../../../services/project/projectExtrasService";
import { parseProjectId } from "../../../utils/slug";

const load = projectExtrasService.getPolicy;

export default function ProjectPolicyPage() {
  const { id } = useParams();
  const projectId = parseProjectId(id);
  const state = useProjectData(projectId, load);

  if (state.status === "loading") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div className="container mx-auto animate-pulse px-4 py-16 lg:px-8" aria-busy="true">
          <div className="mx-auto h-12 w-80 rounded bg-primary-100" />
          <div className="mx-auto mt-10 h-96 max-w-4xl rounded-2xl bg-primary-50" />
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

  const { project, images } = state.data;

  return (
    <div className="overflow-x-clip bg-page">
      <ProjectTabs />

      <div className="container mx-auto px-4 pb-20 pt-10 lg:px-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">{project.name}</span>
          <h1 className="heading-display mt-3 text-4xl text-heading md:text-6xl">Chính sách bán hàng</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-primary-500" />
            <span className="h-2 w-2 rotate-45 bg-primary-500" />
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-primary-500" />
          </div>
        </div>

        {images.length === 0 ? (
          <p className="mx-auto max-w-4xl rounded-2xl border border-dashed border-primary-200 bg-white px-6 py-16 text-center text-body">
            Dự án chưa có chính sách bán hàng.
          </p>
        ) : (
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-lg">
            {images.map((img, i) => (
              <img key={img.id} src={img.src} alt={`Chính sách bán hàng ${i + 1}`} className="block w-full" loading="lazy" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
