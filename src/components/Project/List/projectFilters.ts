import { BUILDING_TYPE_LABEL } from "../../../services/project/projectService";
import type { BuildingTypeCode, ProjectDto } from "../../../types/project/project.types";

// Bộ lọc trang danh sách dự án (lọc phía client trên toàn bộ dự án); "" = không lọc
export type ProjectFilters = {
  keyword: string;
  investor: string;
  area: string;
  type: "" | BuildingTypeCode;
};

export const EMPTY_FILTERS: ProjectFilters = { keyword: "", investor: "", area: "", type: "" };

export type ProjectSort = "newest" | "oldest" | "name-asc" | "name-desc";

export const SORT_OPTIONS: { value: ProjectSort; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "name-asc", label: "Tên A → Z" },
  { value: "name-desc", label: "Tên Z → A" },
];

export const TYPE_OPTIONS: { value: ProjectFilters["type"]; label: string }[] = [
  { value: "", label: "Tất cả" },
  ...(Object.keys(BUILDING_TYPE_LABEL) as BuildingTypeCode[]).map((code) => ({ value: code, label: BUILDING_TYPE_LABEL[code] })),
];

// Khu vực = phần cuối của địa chỉ ("…, TP. Thủ Đức, TP. Hồ Chí Minh" → "TP. Hồ Chí Minh")
export const areaOf = (location: string | null): string => location?.split(",").pop()?.trim() ?? "";

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

// Các lựa chọn chủ đầu tư / khu vực lấy từ chính danh sách dự án
export function filterOptions(projects: ProjectDto[]) {
  const distinct = (values: string[]) =>
    [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "vi"));
  return {
    investors: distinct(projects.map((p) => p.investor?.trim() ?? "")),
    areas: distinct(projects.map((p) => areaOf(p.location))),
  };
}

// Từ khóa khớp tên / địa chỉ / chủ đầu tư, không phân biệt dấu và hoa thường
export function applyFilters(projects: ProjectDto[], f: ProjectFilters): ProjectDto[] {
  const keyword = normalize(f.keyword);
  return projects.filter(
    (p) =>
      (!keyword || normalize([p.name, p.location, p.investor].filter(Boolean).join(" ")).includes(keyword)) &&
      (!f.investor || p.investor?.trim() === f.investor) &&
      (!f.area || areaOf(p.location) === f.area) &&
      (!f.type || p.buildingType === f.type),
  );
}

export function applySort(projects: ProjectDto[], sort: ProjectSort): ProjectDto[] {
  const list = [...projects];
  const time = (p: ProjectDto) => new Date(p.createdAt).getTime() || 0;
  switch (sort) {
    case "newest":
      return list.sort((a, b) => time(b) - time(a));
    case "oldest":
      return list.sort((a, b) => time(a) - time(b));
    case "name-asc":
      return list.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    case "name-desc":
      return list.sort((a, b) => b.name.localeCompare(a.name, "vi"));
  }
}

// Chip "Đang lọc": mỗi bộ lọc đang bật một chip, bấm X để bỏ riêng bộ lọc đó
export function activeChips(f: ProjectFilters): { key: keyof ProjectFilters; label: string }[] {
  const chips: { key: keyof ProjectFilters; label: string }[] = [];
  if (f.keyword.trim()) chips.push({ key: "keyword", label: `“${f.keyword.trim()}”` });
  if (f.type) chips.push({ key: "type", label: BUILDING_TYPE_LABEL[f.type] });
  if (f.investor) chips.push({ key: "investor", label: f.investor });
  if (f.area) chips.push({ key: "area", label: f.area });
  return chips;
}

// Dãy số trang rút gọn: 1 … 4 5 6 … 12
export function pageNumbers(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const around = [page - 1, page, page + 1].filter((n) => n > 1 && n < totalPages);
  const out: (number | "…")[] = [1];
  if (around[0] > 2) out.push("…");
  out.push(...around);
  if (around[around.length - 1] < totalPages - 1) out.push("…");
  out.push(totalPages);
  return out;
}
