export type { PageResponse } from "../common.types";

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "INTERNSHIP"
  | "FREELANCE";

export const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
  INTERNSHIP: "Thực tập",
  FREELANCE: "Làm tự do",
};

export type ExperienceLevel =
  | "INTERN"
  | "FRESHER"
  | "JUNIOR"
  | "MIDDLE"
  | "SENIOR"
  | "LEAD";

export const EXPERIENCE_LEVEL_LABEL: Record<ExperienceLevel, string> = {
  INTERN: "Thực tập sinh",
  FRESHER: "Mới đi làm",
  JUNIOR: "Junior",
  MIDDLE: "Middle",
  SENIOR: "Senior",
  LEAD: "Trưởng nhóm",
};

export type JobStatus = "DRAFT" | "OPEN" | "PAUSED" | "CLOSED";

export const JOB_STATUS_META: Record<
  JobStatus,
  { label: string; dot: string; text: string }
> = {
  DRAFT: { label: "Bản nháp", dot: "bg-muted", text: "text-body" },
  OPEN: { label: "Đang tuyển", dot: "bg-success", text: "text-success" },
  PAUSED: { label: "Tạm dừng", dot: "bg-amber-500", text: "text-amber-600" },
  CLOSED: { label: "Đã đóng", dot: "bg-danger", text: "text-danger" },
};

export const LOCATION_LABEL: Record<string, string> = {
  "Hà Nội": "Hà Nội",
  "Hồ Chí Minh": "TP. Hồ Chí Minh",
  "Hải Phòng": "Hải Phòng",
  "Đà Nẵng": "Đà Nẵng",
  "Cần Thơ": "Cần Thơ",
  Huế: "Huế",
  "An Giang": "An Giang",
  "Bắc Ninh": "Bắc Ninh",
  "Cà Mau": "Cà Mau",
  "Cao Bằng": "Cao Bằng",
  "Đắk Lắk": "Đắk Lắk",
  "Điện Biên": "Điện Biên",
  "Đồng Nai": "Đồng Nai",
  "Đồng Tháp": "Đồng Tháp",
  "Gia Lai": "Gia Lai",
  "Hà Tĩnh": "Hà Tĩnh",
  "Hưng Yên": "Hưng Yên",
  "Khánh Hòa": "Khánh Hòa",
  "Lai Châu": "Lai Châu",
  "Lâm Đồng": "Lâm Đồng",
  "Lạng Sơn": "Lạng Sơn",
  "Lào Cai": "Lào Cai",
  "Nghệ An": "Nghệ An",
  "Ninh Bình": "Ninh Bình",
  "Phú Thọ": "Phú Thọ",
  "Quảng Ngãi": "Quảng Ngãi",
  "Quảng Ninh": "Quảng Ninh",
  "Quảng Trị": "Quảng Trị",
  "Sơn La": "Sơn La",
  "Tây Ninh": "Tây Ninh",
  "Thái Nguyên": "Thái Nguyên",
  "Thanh Hóa": "Thanh Hóa",
  "Tuyên Quang": "Tuyên Quang",
  "Vĩnh Long": "Vĩnh Long",
};

export type JobSort = "NEWEST" | "SALARY" | "DEADLINE";

export const JOB_SORT = {
  NEWEST: "NEWEST",
  SALARY: "SALARY",
  DEADLINE: "DEADLINE",
} as const;

export const JOB_SORT_LABEL: Record<JobSort, string> = {
  NEWEST: "Mới nhất",
  SALARY: "Lương cao nhất",
  DEADLINE: "Sắp hết hạn",
};

export const JOB_SORT_PARAM: Record<JobSort, string> = {
  NEWEST: "publishedAt,desc",
  SALARY: "salaryMax,desc",
  DEADLINE: "deadline,asc",
};

// Khớp JobTypeResponse
export interface JobType {
  id: number;
  name: string;
  description?: string | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Kiểm duyệt tin (tách khỏi JobStatus): tin nhà tuyển dụng phải APPROVED mới hiện công khai
export type JobReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export const JOB_REVIEW_META: Record<
  JobReviewStatus,
  { label: string; badge: string; dot: string }
> = {
  PENDING: {
    label: "Chờ duyệt",
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  APPROVED: {
    label: "Đã duyệt",
    badge: "bg-green-50 text-green-700",
    dot: "bg-green-500",
  },
  REJECTED: {
    label: "Bị từ chối",
    badge: "bg-red-50 text-red-600",
    dot: "bg-red-500",
  },
};

// Công ty đăng tin (null = tin nội bộ Đất Việt Group)
export interface JobCompany {
  id: number;
  name: string;
  website?: string | null;
  logoUrl?: string | null;
}

// Người đăng tin
export interface JobRecruiter {
  id: number;
  fullName: string;
  avatarUrl?: string | null;
}

// Khớp JobResponse
export interface Job {
  id: number;
  title: string;
  jobType: { id: number; name: string } | null;
  department?: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  salaryNegotiable: boolean;
  experience?: string | null;
  experienceLevel?: ExperienceLevel | null;
  employmentType?: EmploymentType | null;
  quantity?: number | null;
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  recruiter?: JobRecruiter | null;
  company?: JobCompany | null;
  deadline: string | null;
  status: JobStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobFilter {
  keyword: string;
  jobTypeId: string;
  employmentType: EmploymentType | "";
  experienceLevel: ExperienceLevel | "";
  location: string;
}

export const DEFAULT_JOB_FILTER: JobFilter = {
  keyword: "",
  jobTypeId: "",
  employmentType: "",
  experienceLevel: "",
  location: "",
};

// JobResponse ở API admin / nhà tuyển dụng: thêm người tạo, số đơn và trạng thái duyệt
export interface AdminJob extends Job {
  createdBy?: { id: number; fullName: string } | null;
  applicationCount?: number | null;
  reviewStatus?: JobReviewStatus;
  reviewStatusLabel?: string;
  reviewReason?: string | null;
  reviewedAt?: string | null;
}

// Khớp JobRequest bên BE
export interface JobRequest {
  jobTypeId: number;
  title: string;
  department?: string;
  location?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  salaryNegotiable: boolean;
  experience?: string;
  experienceLevel?: ExperienceLevel | null;
  employmentType?: EmploymentType | null;
  quantity?: number | null;
  description?: string;
  requirements?: string;
  benefits?: string;
  deadline?: string | null;
  status?: JobStatus;
}

// Khớp JobTypeRequest bên BE
export interface JobTypeRequest {
  name: string;
  description?: string;
  active: boolean;
}

// Khớp SavedJobResponse
export interface SavedJob {
  id: number;
  savedAt: string;
  applicable: boolean;
  job: Job;
}
