import { FALLBACK_IMAGE } from "../../components/Project/List/projectCardData";
import { toAdminZone, projectService, zoneApiService } from "./projectService";
import { propertyCountByZone } from "./projectOverviewService";
import type { ProjectZones, Zone } from "../../types/project/zone.types";

// Phân khu của một dự án kèm số bất động sản thuộc từng phân khu
async function getProjectZones(projectId: number): Promise<ProjectZones> {
  const [project, zoneDtos] = await Promise.all([projectService.getProject(projectId), zoneApiService.getByProject(projectId)]);
  const counts = await propertyCountByZone(zoneDtos.map((z) => z.id));

  const zones: Zone[] = zoneDtos.map((dto) => {
    const z = toAdminZone(dto);
    return {
      id: dto.id,
      projectId: dto.projectId,
      name: z.name,
      description: dto.description,
      status: z.status || null,
      imageUrl: dto.imageUrl,
      propertyCount: counts[dto.id] ?? null,
    };
  });

  return {
    project: {
      id: project.id,
      name: project.name,
      location: project.location ?? "",
      investor: project.investor ?? "",
      image: project.overviewImage ?? FALLBACK_IMAGE,
    },
    zones,
  };
}

export const zoneService = { getProjectZones };
