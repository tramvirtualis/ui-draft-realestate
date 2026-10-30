export type CvStepId =
  | "personal"
  | "objective"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certificates"
  | "languages"
  | "references";

export const CV_STEPS: {
  id: CvStepId;
  label: string;
  title: string;
  description: string;
}[] = [
  {
    id: "personal",
    label: "Thông tin cá nhân",
    title: "Thông tin cá nhân",
    description:
      "Thông tin này sẽ xuất hiện ở đầu CV và giúp nhà tuyển dụng liên hệ với bạn.",
  },
  {
    id: "objective",
    label: "Mục tiêu nghề nghiệp",
    title: "Mục tiêu nghề nghiệp",
    description:
      "Nêu ngắn gọn định hướng và giá trị bạn mang lại cho nhà tuyển dụng.",
  },
  {
    id: "experience",
    label: "Kinh nghiệm",
    title: "Kinh nghiệm làm việc",
    description: "Liệt kê vị trí đã làm, kèm thành tích và số liệu cụ thể.",
  },
  {
    id: "education",
    label: "Học vấn",
    title: "Học vấn",
    description: "Trường, chuyên ngành và thời gian học.",
  },
  {
    id: "skills",
    label: "Kỹ năng môi giới",
    title: "Kỹ năng môi giới",
    description: "Các kỹ năng chuyên môn nổi bật của bạn.",
  },
  {
    id: "projects",
    label: "Dự án đã tham gia",
    title: "Dự án đã tham gia",
    description: "Các dự án bất động sản bạn từng phân phối hoặc tư vấn.",
  },
  {
    id: "certificates",
    label: "Chứng chỉ",
    title: "Chứng chỉ",
    description: "Chứng chỉ hành nghề, khóa đào tạo liên quan.",
  },
  {
    id: "languages",
    label: "Ngôn ngữ",
    title: "Ngôn ngữ",
    description: "Ngoại ngữ và trình độ sử dụng.",
  },
  {
    id: "references",
    label: "Người tham chiếu",
    title: "Người tham chiếu",
    description: "Người có thể xác nhận năng lực làm việc của bạn.",
  },
];

interface Period {
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface PersonalInfo {
  avatarUrl: string;
  fullName: string;
  title: string;
  phone: string;
  email: string;
  birthDate: string;
  address: string;
  linkedin: string;
  zalo: string;
  summary: string;
}

export interface ExperienceItem extends Period {
  id: string;
  company: string;
  position: string;
  bullets: string;
  revenueBillion: number;
  projectCount: number;
  closeRate: number;
}

export interface EducationItem extends Period {
  id: string;
  school: string;
  major: string;
}

export interface SkillItem {
  id: string;
  name: string;
  /** Không còn nhập trên form; giữ cho bản nháp cũ / mẫu HTML đang dùng {{level}} */
  level?: number;
}

export interface ProjectItem extends Period {
  id: string;
  name: string;
  role: string;
  description: string;
}

export interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  level: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  position: string;
  company: string;
  phone: string;
  email: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface CvData {
  personal: PersonalInfo;
  objective: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certificates: CertificateItem[];
  languages: LanguageItem[];
  references: ReferenceItem[];
  customSections: CustomSection[];
}

export type CvSectionKey =
  | "summary"
  | "objective"
  | "achievements"
  | "experience"
  | "projects"
  | "education"
  | "skills"
  | "certificates"
  | "languages"
  | "references"
  | `custom:${string}`;

export const DEFAULT_SECTION_ORDER: CvSectionKey[] = [
  "summary",
  "objective",
  "achievements",
  "experience",
  "projects",
  "education",
  "skills",
  "certificates",
  "languages",
  "references",
];

export const SECTION_TITLE: Record<string, string> = {
  summary: "Giới thiệu bản thân",
  objective: "Mục tiêu nghề nghiệp",
  achievements: "Thành tích nổi bật",
  experience: "Kinh nghiệm làm việc",
  projects: "Dự án tiêu biểu",
  education: "Học vấn",
  skills: "Kỹ năng",
  certificates: "Chứng chỉ",
  languages: "Ngôn ngữ",
  references: "Người tham chiếu",
};

// 3 mẫu viết sẵn bằng React, dùng khi BE chưa có mẫu nào
export type BuiltinCvTemplateId = "modern" | "professional" | "minimal";

// Mẫu có sẵn hoặc mẫu từ BE dạng
export type CvTemplateId = BuiltinCvTemplateId | `db:${number}`;

export const CV_TEMPLATES: { id: BuiltinCvTemplateId; label: string }[] = [
  { id: "modern", label: "Modern" },
  { id: "professional", label: "Professional" },
  { id: "minimal", label: "Minimal" },
];

// Màu lấy từ theme (CSS variables) để đồng bộ với website
export const CV_COLORS = [
  {
    id: "primary",
    label: "Tím NovaLand",
    value: "var(--color-primary-700)",
    swatch: "bg-primary-700",
  },
  {
    id: "dark",
    label: "Tím đậm",
    value: "var(--color-footer)",
    swatch: "bg-footer",
  },
  {
    id: "blue",
    label: "Xanh dương",
    value: "var(--color-accent)",
    swatch: "bg-accent",
  },
  {
    id: "green",
    label: "Xanh lá",
    value: "var(--color-success)",
    swatch: "bg-success",
  },
  {
    id: "ink",
    label: "Đen",
    value: "var(--color-heading)",
    swatch: "bg-heading",
  },
  {
    id: "violet",
    label: "Tím nhạt",
    value: "var(--color-primary-500)",
    swatch: "bg-primary-500",
  },
  {
    id: "navy",
    label: "Xanh navy",
    value: "var(--color-navy)",
    swatch: "bg-navy",
  },
  {
    id: "midnight",
    label: "Xanh đêm",
    value: "var(--color-ink-900)",
    swatch: "bg-ink-900",
  },
  {
    id: "gold",
    label: "Vàng gold",
    value: "var(--color-gold-500)",
    swatch: "bg-gold-500",
  },
  {
    id: "orange",
    label: "Cam",
    value: "var(--color-warning)",
    swatch: "bg-warning",
  },
  {
    id: "red",
    label: "Đỏ",
    value: "var(--color-danger)",
    swatch: "bg-danger",
  },
  {
    id: "gray",
    label: "Xám",
    value: "var(--color-body)",
    swatch: "bg-body",
  },
] as const;

// Tất cả font đều hỗ trợ tiếng Việt; nhớ cập nhật CV_FONTS_URL khi thêm font mới
export const CV_FONTS = [
  { id: "Inter", label: "Inter" },
  { id: "Be Vietnam Pro", label: "Be Vietnam Pro" },
  { id: "Roboto", label: "Roboto" },
  { id: "Open Sans", label: "Open Sans" },
  { id: "Montserrat", label: "Montserrat" },
  { id: "Nunito", label: "Nunito" },
  { id: "Source Sans 3", label: "Source Sans 3" },
  { id: "Merriweather", label: "Merriweather" },
  { id: "Lora", label: "Lora" },
  { id: "Playfair Display", label: "Playfair Display" },
  { id: "Noto Serif", label: "Noto Serif" },
] as const;

export const CV_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Nunito:wght@300;400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&family=Lora:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Noto+Serif:wght@300;400;500;600;700&display=swap&subset=vietnamese";

export const CV_FONT_SIZES = [10, 11, 12, 13, 14, 15, 16, 17, 18] as const;

export interface CvStyle {
  template: CvTemplateId;
  color: string;
  font: string;
  fontSize: number;
  sectionOrder: CvSectionKey[];
}

export const DEFAULT_CV_STYLE: CvStyle = {
  template: "modern",
  color: CV_COLORS[0].value,
  font: "Inter",
  fontSize: 13,
  sectionOrder: DEFAULT_SECTION_ORDER,
};

export const EMPTY_CV_DATA: CvData = {
  personal: {
    avatarUrl: "",
    fullName: "",
    title: "",
    phone: "",
    email: "",
    birthDate: "",
    address: "",
    linkedin: "",
    zalo: "",
    summary: "",
  },
  objective: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certificates: [],
  languages: [],
  references: [],
  customSections: [],
};

export const uid = (): string => Math.random().toString(36).slice(2, 10);
