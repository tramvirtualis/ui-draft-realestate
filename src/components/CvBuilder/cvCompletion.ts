import {
  certificatesSchema,
  customSectionSchema,
  educationSchema,
  experienceSchema,
  languagesSchema,
  objectiveSchema,
  personalSchema,
  projectsSchema,
  referencesSchema,
  skillsSchema,
} from "./cvSchemas";
import type { CvData, CvStepId } from "../../types/job/cv.types";
import { computeAchievements } from "./cvHelpers";

/** Một mục "hoàn thành" khi đủ trường bắt buộc và hợp lệ theo schema của bước đó */
export function isStepComplete(step: CvStepId, data: CvData): boolean {
  switch (step) {
    case "personal":
      return personalSchema.safeParse(data.personal).success;
    case "objective":
      return objectiveSchema.safeParse({ objective: data.objective }).success;
    case "experience":
      return (
        data.experience.length > 0 &&
        experienceSchema.safeParse({ items: data.experience }).success
      );
    case "education":
      return (
        data.education.length > 0 &&
        educationSchema.safeParse({ items: data.education }).success
      );
    case "skills":
      return (
        data.skills.length > 0 &&
        skillsSchema.safeParse({ items: data.skills }).success
      );
    case "projects":
      return (
        data.projects.length > 0 &&
        projectsSchema.safeParse({ items: data.projects }).success
      );
    case "certificates":
      return (
        data.certificates.length > 0 &&
        certificatesSchema.safeParse({ items: data.certificates }).success
      );
    case "languages":
      return (
        data.languages.length > 0 &&
        languagesSchema.safeParse({ items: data.languages }).success
      );
    case "references":
      return (
        data.references.length > 0 &&
        referencesSchema.safeParse({ items: data.references }).success
      );
  }
}

export const isCustomComplete = (data: CvData, id: string): boolean => {
  const c = data.customSections.find((s) => s.id === id);
  return !!c && customSectionSchema.safeParse(c).success;
};

export interface ChecklistItem {
  label: string;
  hint: string;
  ok: boolean;
}

/** Checklist trước khi tải PDF, tính từ dữ liệu thật của form */
export function buildPreExportChecklist(
  data: CvData,
  pageCount: number
): ChecklistItem[] {
  const contactOk = personalSchema
    .pick({ fullName: true, phone: true, email: true })
    .safeParse(data.personal).success;

  const formatOk = [
    experienceSchema.safeParse({ items: data.experience }).success,
    educationSchema.safeParse({ items: data.education }).success,
    projectsSchema.safeParse({ items: data.projects }).success,
    certificatesSchema.safeParse({ items: data.certificates }).success,
    referencesSchema.safeParse({ items: data.references }).success,
  ].every(Boolean);

  return [
    {
      ok: contactOk,
      label: "Đủ thông tin liên hệ",
      hint: contactOk
        ? "Họ tên, số điện thoại và email hợp lệ"
        : "Kiểm tra họ tên, số điện thoại, email",
    },
    {
      ok:
        !!data.personal.title.trim() &&
        !!(data.objective.trim() || data.personal.summary.trim()),
      label: "Có chức danh và giới thiệu",
      hint: "Chức danh cùng mục tiêu hoặc giới thiệu bản thân",
    },
    {
      ok: data.experience.length > 0 || data.projects.length > 0,
      label: "Có kinh nghiệm hoặc dự án",
      hint: "Thêm ít nhất một kinh nghiệm hay dự án",
    },
    {
      ok: computeAchievements(data) !== null,
      label: "Thành tích có số liệu",
      hint: "Điền doanh số, số dự án hoặc tỷ lệ chốt",
    },
    {
      ok: formatOk,
      label: "Không có lỗi định dạng",
      hint: formatOk
        ? "Thời gian và liên hệ hợp lệ"
        : "Một số mục còn lỗi thời gian hoặc liên hệ",
    },
    {
      ok: pageCount <= 2,
      label: "CV không quá 2 trang",
      hint: `Hiện ${pageCount} trang`,
    },
  ];
}
