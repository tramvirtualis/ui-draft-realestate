import Handlebars from "handlebars";
import type {
  CvData,
  CvSectionKey,
  CvStyle,
} from "../../../types/job/cv.types";
import type { CvTemplateConfig } from "../../../types/job/cvTemplate.types";
import {
  computeAchievements,
  formatDay,
  formatPeriod,
  isSectionEmpty,
  sectionTitle,
  splitLines,
} from "../cvHelpers";

const hb = Handlebars.create();

hb.registerHelper("eq", (a: unknown, b: unknown) => a === b);
hb.registerHelper("ne", (a: unknown, b: unknown) => a !== b);
hb.registerHelper("and", (...args: unknown[]) =>
  args.slice(0, -1).every(Boolean)
);
hb.registerHelper("or", (...args: unknown[]) =>
  args.slice(0, -1).some(Boolean)
);
hb.registerHelper("not", (v: unknown) => !v);
hb.registerHelper("inc", (n: unknown) => Number(n) + 1);
hb.registerHelper("join", (arr: unknown, sep: unknown) =>
  Array.isArray(arr)
    ? arr.filter(Boolean).join(typeof sep === "string" ? sep : ", ")
    : ""
);
hb.registerHelper("array", (...args: unknown[]) => args.slice(0, -1));
hb.registerHelper("lines", (text: unknown) =>
  typeof text === "string" ? splitLines(text) : []
);
hb.registerHelper("gt", (a: unknown, b: unknown) => Number(a) > Number(b));
hb.registerHelper("lt", (a: unknown, b: unknown) => Number(a) < Number(b));
// Có mục nào đang hiện thuộc danh sách khóa không ("custom" = mục tùy chỉnh), vd {{#if (anySection "projects" "custom")}}
hb.registerHelper("anySection", (...args: unknown[]) => {
  const options = args.pop() as Handlebars.HelperOptions;
  const sections =
    (options.data?.root as CvTemplateContext | undefined)?.sections ?? [];
  return sections.some((s) =>
    args.includes(s.key.startsWith("custom:") ? "custom" : s.key)
  );
});

/**
 * {{cvEdit "trường"}}: in giá trị kèm data-cv-edit để ứng viên bấm vào sửa ngay trên bản xem trước.
 * Dùng trong vòng lặp danh sách (position, company, name…), hoặc "personal.fullName", "objective"
 * ở bất kỳ đâu. multiline=true cho đoạn nhiều dòng.
 */
hb.registerHelper(
  "cvEdit",
  function (this: unknown, field: unknown, options: Handlebars.HelperOptions) {
    const f = String(field);
    const root = options.data?.root as CvTemplateContext | undefined;
    const ctx = (this && typeof this === "object" ? this : {}) as Record<
      string,
      unknown
    >;
    let key: string | null = null;
    let value: unknown;
    if (f === "objective") [key, value] = ["objective", root?.objective];
    else if (f.startsWith("personal."))
      [key, value] = [
        f,
        root?.personal[f.slice(9) as keyof CvTemplateContext["personal"]],
      ];
    else {
      value = ctx[f];
      // _direct: khóa trỏ thẳng vào giá trị (gạch đầu dòng, liên hệ); còn lại là <khóa mục>.<trường>
      if (typeof ctx._key === "string")
        key = ctx._direct ? ctx._key : `${ctx._key}.${f}`;
    }
    const text = Handlebars.escapeExpression(
      value == null ? "" : String(value)
    );
    if (!key) return new Handlebars.SafeString(text);
    const multi = options.hash?.multiline ? " data-cv-multiline" : "";
    return new Handlebars.SafeString(
      `<span data-cv-edit="${Handlebars.escapeExpression(
        key
      )}"${multi}>${text}</span>`
    );
  }
);

export interface CvTemplateContext {
  personal: CvData["personal"] & { birthDateText: string; initials: string };
  contacts: {
    type: string;
    label: string;
    value: string;
    _key?: string;
    _direct?: true;
  }[];
  objective: string;
  achievements: {
    revenueBillion: number;
    projectCount: number;
    closeRate: number;
  } | null;
  experience: (CvData["experience"][number] & {
    period: string;
    bulletList: string[];
    bulletItems: { text: string; _key: string; _direct: true }[];
    _key: string;
  })[];
  education: (CvData["education"][number] & { period: string })[];
  skills: CvData["skills"];
  projects: (CvData["projects"][number] & { period: string })[];
  certificates: CvData["certificates"];
  languages: CvData["languages"];
  references: CvData["references"];
  customSections: (CvData["customSections"][number] & { lines: string[] })[];
  sections: {
    key: CvSectionKey;
    title: string;
    is: Record<string, boolean>;
    custom?: { title: string; lines: string[]; content: string; _key: string };
  }[];
  style: { color: string; font: string; fontSize: number };
  config: CvTemplateConfig;
}

const CONTACT_LABELS: [keyof CvData["personal"], string][] = [
  ["phone", "Điện thoại"],
  ["email", "Email"],
  ["address", "Địa chỉ"],
  ["birthDate", "Ngày sinh"],
  ["linkedin", "LinkedIn"],
  ["zalo", "Zalo"],
];
export function buildTemplateContext(
  data: CvData,
  style: CvStyle,
  config: CvTemplateConfig | null
): CvTemplateContext {
  const p = data.personal;
  const birthDateText = formatDay(p.birthDate);
  const initials = p.fullName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  const customSections = data.customSections.map((c) => ({
    ...c,
    lines: splitLines(c.content),
  }));

  const sections = style.sectionOrder
    .filter((key) => !isSectionEmpty(key, data))
    .map((key) => {
      const isCustom = key.startsWith("custom:");
      const custom = isCustom
        ? customSections.find((c) => c.id === key.slice(7))
        : undefined;
      return {
        key,
        title: sectionTitle(key, data),
        is: { [isCustom ? "custom" : key]: true },
        custom: custom && {
          title: custom.title,
          lines: custom.lines,
          content: custom.content,
          _key: `custom.${custom.id}`,
        },
      };
    });

  return {
    personal: { ...p, birthDateText, initials },
    contacts: CONTACT_LABELS.map(([key, label]) => ({
      type: key,
      label,
      value: key === "birthDate" ? birthDateText : p[key],
      // ngày sinh đã định dạng nên sửa ở form
      ...(key === "birthDate"
        ? {}
        : { _key: `personal.${key}`, _direct: true as const }),
    })).filter((c) => c.value),
    objective: data.objective.trim(),
    achievements: computeAchievements(data),
    experience: data.experience.map((e) => {
      const bulletList = splitLines(e.bullets);
      return {
        ...e,
        period: formatPeriod(e),
        bulletList,
        bulletItems: bulletList.map((text, i) => ({
          text,
          _key: `experience.${e.id}.bullets.${i}`,
          _direct: true as const,
        })),
        _key: `experience.${e.id}`,
      };
    }),
    education: data.education.map((e) => ({
      ...e,
      period: formatPeriod(e),
      _key: `education.${e.id}`,
    })),
    skills: data.skills.map((s) => ({ ...s, _key: `skills.${s.id}` })),
    projects: data.projects.map((e) => ({
      ...e,
      period: formatPeriod(e),
      _key: `projects.${e.id}`,
    })),
    certificates: data.certificates.map((c) => ({
      ...c,
      _key: `certificates.${c.id}`,
    })),
    languages: data.languages.map((l) => ({ ...l, _key: `languages.${l.id}` })),
    references: data.references.map((r) => ({
      ...r,
      _key: `references.${r.id}`,
    })),
    customSections,
    sections,
    style: { color: style.color, font: style.font, fontSize: style.fontSize },
    config: config ?? {},
  };
}

const compiled = new Map<string, Handlebars.TemplateDelegate>();

function compile(html: string): Handlebars.TemplateDelegate {
  let fn = compiled.get(html);
  if (!fn) {
    fn = hb.compile(html);
    if (compiled.size > 30) compiled.clear();
    compiled.set(html, fn);
  }
  return fn;
}

const BLOCKED_TAGS = "script,iframe,object,embed,link,meta,base,frame,frameset";
export function sanitizeHtml(html: string): string {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  tpl.content.querySelectorAll(BLOCKED_TAGS).forEach((el) => el.remove());
  tpl.content.querySelectorAll("*").forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (
        name.startsWith("on") ||
        ((name === "href" || name === "src" || name === "xlink:href") &&
          value.startsWith("javascript:"))
      ) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return tpl.innerHTML;
}

export type RenderResult =
  | { ok: true; html: string }
  | { ok: false; error: string };

export function renderTemplate(
  html: string,
  context: CvTemplateContext
): RenderResult {
  try {
    return { ok: true, html: sanitizeHtml(compile(html)(context)) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export function scopeCss(
  css: string | null | undefined,
  scopeId: string
): string {
  if (!css?.trim()) return "";
  const cleaned = css
    .replace(/@(import|charset)[^;]*;/gi, "")
    .replace(/@font-face\s*{[^}]*}/gi, "");
  return `[data-cv-tpl="${scopeId}"]{${cleaned}}`;
}

export const TEMPLATE_VARIABLES: { name: string; desc: string }[] = [
  {
    name: "{{personal.fullName}}, {{personal.title}}",
    desc: "Họ tên, chức danh",
  },
  {
    name: "{{personal.avatarUrl}}, {{personal.initials}}",
    desc: "Ảnh đại diện, chữ cái đầu tên (dùng khi không có ảnh)",
  },
  {
    name: "{{personal.phone}} … {{personal.birthDateText}}",
    desc: "phone, email, address, linkedin, zalo, birthDateText (dd/mm/yyyy)",
  },
  {
    name: "{{#each contacts}} {{label}}: {{value}} {{/each}}",
    desc: "Các thông tin liên hệ đã điền (type: phone, email…)",
  },
  {
    name: "{{personal.summary}}",
    desc: "Giới thiệu bản thân (mục is.summary trong sections)",
  },
  {
    name: "{{objective}}",
    desc: "Mục tiêu nghề nghiệp",
  },
  {
    name: "{{#each sections}} … {{/each}}",
    desc: "Section đang hiện theo thứ tự người dùng: key, title, is.experience, is.custom, custom.lines",
  },
  {
    name: "{{#each @root.experience}}",
    desc: "Dùng @root.xxx khi ở trong vòng lặp sections. company, position, period, bulletList",
  },
  {
    name: "{{#if achievements}}",
    desc: "achievements.revenueBillion, projectCount, closeRate",
  },
  {
    name: "education / projects",
    desc: "school, major, period / name, role, description, period",
  },
  { name: "skills / languages", desc: "name, level (skills: 0–100)" },
  {
    name: "certificates / references",
    desc: "name, issuer, year / name, position, company, phone, email",
  },
  {
    name: "{{style.color}}, {{config.xxx}}",
    desc: "Màu đang chọn; giá trị trong cấu hình mặc định",
  },
  {
    name: '{{cvEdit "position"}}',
    desc: 'Như {{position}} nhưng ứng viên bấm vào sửa được trên bản xem trước. Dùng được cho trường trong danh sách, "personal.fullName", "objective"; thêm multiline=true cho đoạn nhiều dòng',
  },
  {
    name: '"sectionOrder" trong cấu hình thêm',
    desc: 'Thứ tự mục mặc định khi ứng viên chọn mẫu, vd ["experience", "education", "custom"] ("custom" = các mục tùy chỉnh)',
  },
  {
    name: "var(--cv-color), var(--cv-font)",
    desc: "Dùng trong CSS: màu chủ đạo, font, var(--cv-size) cỡ chữ",
  },
  {
    name: "Helper",
    desc: 'eq, ne, and, or, not, gt, lt, inc, join, array, lines, anySection — vd {{#if (anySection "projects" "custom")}}, {{join (array phone email) " · "}}',
  },
  {
    name: "<div data-cv-page>",
    desc: "Khung CV tự kéo dài tới bội số trang A4 để màu nền cột phủ hết các trang khi CV dài",
  },
];
