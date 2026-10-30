import type { CvData } from "../../../types/job/cv.types";
import { splitLines } from "../cvHelpers";

/**
 * Khóa data-cv-edit trong mẫu HTML (sinh bởi helper {{cvEdit}}):
 *   personal.<trường> | objective | <danh sách>.<id>.<trường>
 *   experience.<id>.bullets.<dòng> | custom.<id>.content
 */
const PERSONAL = [
  "summary",
  "fullName",
  "title",
  "phone",
  "email",
  "address",
  "linkedin",
  "zalo",
];
const LIST_FIELDS: Record<string, string[]> = {
  experience: ["position", "company"],
  education: ["school", "major"],
  skills: ["name"],
  projects: ["name", "role", "description"],
  certificates: ["name", "issuer", "year"],
  languages: ["name", "level"],
  references: ["name", "position", "company", "phone", "email"],
};
type ListKey =
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certificates"
  | "languages"
  | "references";

const mapItem = <T extends { id: string }>(
  items: T[],
  id: string,
  fn: (item: T) => T
) => items.map((it) => (it.id === id ? fn(it) : it));

/** Khóa có trỏ tới một trường sửa được không (mẫu HTML có thể ghi khóa bất kỳ) */
export function isCvEditKey(key: string): boolean {
  const [a, b, c, line, extra] = key.split(".");
  if (extra !== undefined) return false;
  if (a === "objective") return !b;
  if (a === "personal") return PERSONAL.includes(b) && !c;
  if (!b) return false;
  if (a === "custom") return c === "content" && line === undefined;
  if (a === "experience" && c === "bullets") return /^\d+$/.test(line ?? "");
  return !!LIST_FIELDS[a]?.includes(c) && line === undefined;
}

/** Ghi chữ sửa trên bản xem trước vào dữ liệu CV; khóa không hợp lệ thì trả null (bỏ qua) */
export function applyCvEdit(
  d: CvData,
  key: string,
  text: string
): CvData | null {
  if (!isCvEditKey(key)) return null;
  const [a, b, c, line] = key.split(".");
  if (a === "objective" && !b) return { ...d, objective: text };
  if (a === "personal" && PERSONAL.includes(b) && !c)
    return { ...d, personal: { ...d.personal, [b]: text } };
  if (a === "custom" && c === "content")
    return {
      ...d,
      customSections: mapItem(d.customSections, b, (s) => ({
        ...s,
        content: text,
      })),
    };
  if (a === "experience" && c === "bullets" && /^\d+$/.test(line ?? "")) {
    // sửa một gạch đầu dòng; xuống dòng = tách thành nhiều gạch, xóa trắng = bỏ gạch
    return {
      ...d,
      experience: mapItem(d.experience, b, (e) => {
        const lines = splitLines(e.bullets);
        if (Number(line) >= lines.length) return e;
        lines[Number(line)] = text;
        return { ...e, bullets: lines.join("\n") };
      }),
    };
  }
  if (LIST_FIELDS[a]?.includes(c) && line === undefined) {
    const list = a as ListKey;
    return {
      ...d,
      [list]: mapItem(d[list] as { id: string }[], b, (it) => ({
        ...it,
        [c]: text,
      })),
    };
  }
  return null;
}
