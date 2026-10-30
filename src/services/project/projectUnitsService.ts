import { FALLBACK_IMAGE } from "../../components/Project/List/projectCardData";
import { propertyService } from "./propertyService";
import { bankApiService, projectService, zoneApiService } from "./projectService";
import type { ProjectUnit, ProjectUnitsData } from "../../types/project/projectUnits.types";

const toUnit = (
  p: Awaited<ReturnType<typeof propertyService.list>>[number],
  zoneName: string,
  banks: string[],
): ProjectUnit => ({
  id: p.id,
  code: p.propertyCode,
  zoneId: p.zoneId,
  zone: zoneName,
  area: p.area || null,
  priceBillion: p.price ? p.price / 1e9 : null,
  unitPriceMillion: p.price && p.area ? p.price / p.area / 1e6 : null,
  direction: p.direction,
  floor: p.floor || null,
  type: p.type || "—",
  status: p.status,
  image: p.images[0] ?? null,
  images: p.images,
  constructionArea: p.constructionArea,
  loanPriceBillion: p.loanPrice ? p.loanPrice / 1e9 : null,
  prepaymentDiscountRate: p.prepaymentDiscountRate,
  prepaymentPriceBillion:
    p.price && p.prepaymentDiscountRate != null ? (p.price * (1 - p.prepaymentDiscountRate / 100)) / 1e9 : null,
  banks, // mọi căn dùng chung ngân hàng hỗ trợ vay của dự án
  pricingSheet: p.pricingSheet || null,
  layoutUrl: p.layoutUrl || null,
  salesPolicyEffectiveDate: p.salesPolicyEffectiveDate || null,
  salesPolicySummaryUrl: p.salesPolicySummaryUrl || null,
  salesPolicyDetailUrl: p.salesPolicyDetailUrl || null,
  gift: p.gift || null,
  handoverStandard: p.handoverStandard || null,
  propertyInventoryType: p.propertyInventoryType || null,
});

// Thông tin dự án + phân khu + toàn bộ căn thuộc các phân khu của dự án (dữ liệu thật từ BE)
async function getProjectUnits(projectId: number): Promise<ProjectUnitsData> {
  const [project, zoneDtos, properties, bankDtos] = await Promise.all([
    projectService.getProject(projectId),
    zoneApiService.getByProject(projectId),
    propertyService.list(),
    bankApiService.getByProject(projectId).catch(() => []),
  ]);

  const zoneName = new Map(zoneDtos.map((z) => [z.id, z.name]));
  const banks = bankDtos.map((b) => b.name);
  const units = properties.filter((p) => zoneName.has(p.zoneId)).map((p) => toUnit(p, zoneName.get(p.zoneId) ?? "", banks));

  return {
    project: {
      id: project.id,
      name: project.name,
      location: project.location ?? "",
      overviewImage: project.overviewImage ?? FALLBACK_IMAGE,
      bookingEnabled: project.bookingEnabled ?? true,
    },
    zones: zoneDtos.map((z) => ({ id: z.id, name: z.name })),
    units,
  };
}

export const projectUnitsService = { getProjectUnits };
