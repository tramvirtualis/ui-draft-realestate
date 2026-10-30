import { Link, useParams } from "react-router-dom";
import ProjectTabs from "../../../components/Project/Detail/ProjectTabs";
import DocumentsHero from "../../../components/Project/Detail/documents/DocumentsHero";
import DocumentList from "../../../components/Project/Detail/documents/DocumentList";
import IntroVideo from "../../../components/Project/Detail/documents/IntroVideo";
import { useProjectData } from "../../../hooks/project/useProjectData";
import { projectExtrasService } from "../../../services/project/projectExtrasService";
import { parseProjectId } from "../../../utils/slug";

const load = projectExtrasService.getDocuments;

// Tài liệu + video giới thiệu (video lấy từ quản trị "Video dự án")
export default function ProjectDocumentsPage() {
  const { id } = useParams();
  const projectId = parseProjectId(id);
  const base = `/projects/${id}`;
  const state = useProjectData(projectId, load);

  if (state.status === "loading") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div className="container mx-auto animate-pulse px-4 py-10 lg:px-8" aria-busy="true">
          <div className="h-60 rounded-3xl bg-primary-100" />
          <div className="mt-6 h-72 rounded-3xl bg-primary-50" />
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

  const { project, documents } = state.data;
  const hero = { name: project.name, image: project.overviewImage, location: project.location };

  return (
    <div className="overflow-x-clip bg-page">
      <ProjectTabs />
      <DocumentsHero base={base} project={hero} total={documents.length} />
      <DocumentList documents={documents} />
      {projectId !== undefined && <IntroVideo projectId={projectId} projectName={project.name} poster={project.overviewImage} />}
    </div>
  );
}
