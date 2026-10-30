import { z } from "zod";

const required = (msg: string) => z.string().trim().min(1, msg);

const PHONE_RE = /^(\+84|0)(\s?\d){9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SUMMARY_MAX = 300;

export const personalSchema = z.object({
  avatarUrl: z.string(),
  fullName: required("Vui lòng nhập họ và tên").min(2, "Họ tên quá ngắn"),
  title: required("Vui lòng nhập chức danh mong muốn"),
  phone: z
    .string()
    .trim()
    .regex(PHONE_RE, "Số điện thoại không hợp lệ (vd: 0903 468 899)"),
  email: z.string().trim().regex(EMAIL_RE, "Email không hợp lệ"),
  birthDate: z.string(),
  address: z.string(),
  linkedin: z.string(),
  zalo: z.string(),
  summary: z.string().max(SUMMARY_MAX, `Tối đa ${SUMMARY_MAX} ký tự`),
});

export const objectiveSchema = z.object({
  objective: required("Vui lòng nhập mục tiêu nghề nghiệp").max(
    600,
    "Tối đa 600 ký tự"
  ),
});

/** Khoảng thời gian: kết thúc không được trước bắt đầu (trừ khi đang làm) */
const period = {
  startDate: z.string().min(1, "Chọn thời gian bắt đầu"),
  endDate: z.string(),
  current: z.boolean(),
};

const checkPeriod = (
  v: { startDate: string; endDate: string; current: boolean },
  ctx: z.RefinementCtx
) => {
  if (v.current) return;
  if (!v.endDate)
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "Chọn thời gian kết thúc",
    });
  else if (v.startDate && v.endDate < v.startDate)
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "Kết thúc phải sau bắt đầu",
    });
};

const experienceItem = z
  .object({
    id: z.string(),
    company: required("Nhập tên công ty"),
    position: required("Nhập vị trí"),
    ...period,
    bullets: z.string(),
    revenueBillion: z.number().min(0, "Không được âm"),
    projectCount: z.number().min(0, "Không được âm"),
    closeRate: z.number().min(0, "Từ 0 đến 100").max(100, "Từ 0 đến 100"),
  })
  .superRefine(checkPeriod);

const educationItem = z
  .object({
    id: z.string(),
    school: required("Nhập tên trường"),
    major: z.string(),
    ...period,
  })
  .superRefine(checkPeriod);

const skillItem = z.object({
  id: z.string(),
  name: required("Nhập tên kỹ năng"),
  level: z.number().min(0).max(100).optional(),
});

const projectItem = z
  .object({
    id: z.string(),
    name: required("Nhập tên dự án"),
    role: z.string(),
    description: z.string(),
    ...period,
  })
  .superRefine(checkPeriod);

const certificateItem = z.object({
  id: z.string(),
  name: required("Nhập tên chứng chỉ"),
  issuer: z.string(),
  year: z.string().regex(/^(\d{4})?$/, "Năm gồm 4 chữ số"),
});

const languageItem = z.object({
  id: z.string(),
  name: required("Nhập tên ngôn ngữ"),
  level: required("Nhập trình độ"),
});

const referenceItem = z.object({
  id: z.string(),
  name: required("Nhập họ tên"),
  position: z.string(),
  company: z.string(),
  phone: z
    .string()
    .refine(
      (v) => v === "" || PHONE_RE.test(v.trim()),
      "Số điện thoại không hợp lệ"
    ),
  email: z
    .string()
    .refine((v) => v === "" || EMAIL_RE.test(v.trim()), "Email không hợp lệ"),
});

const list = <T extends z.ZodType>(item: T) =>
  z.object({ items: z.array(item) });

export const experienceSchema = list(experienceItem);
export const educationSchema = list(educationItem);
export const skillsSchema = list(skillItem);
export const projectsSchema = list(projectItem);
export const certificatesSchema = list(certificateItem);
export const languagesSchema = list(languageItem);
export const referencesSchema = list(referenceItem);

export const customSectionSchema = z.object({
  title: required("Nhập tiêu đề mục"),
  content: required("Nhập nội dung"),
});
