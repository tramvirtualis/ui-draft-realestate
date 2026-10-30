import {
  createContext,
  useContext,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import type { CvData } from "../../../types/job/cv.types";

type ListKey =
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certificates"
  | "languages"
  | "references";
type Commit = (text: string) => void;

/**
 * Chữ người dùng gõ trong ô contentEditable. Không dùng innerText vì nó trả chữ đã qua CSS
 * (vd text-transform: uppercase biến "Nguyễn" thành "NGUYỄN" rồi lưu luôn chữ hoa).
 */
export function readEditableText(el: Node): string {
  let out = "";
  el.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) out += n.textContent ?? "";
    else if (n.nodeName === "BR") out += "\n";
    else
      out +=
        (/^(DIV|P)$/.test(n.nodeName) && out ? "\n" : "") + readEditableText(n);
  });
  return out;
}

/** Chuẩn hóa chữ vừa sửa: một dòng thì gộp xuống dòng thành dấu cách */
export const cleanEditedText = (raw: string, multiline: boolean) =>
  multiline ? raw.replace(/\n+$/, "") : raw.replace(/\s*\n\s*/g, " ").trim();

/** Ghi một thay đổi từ preview vào dữ liệu CV. Không có provider = preview chỉ xem (admin, in PDF…). */
export const CvEditContext = createContext<
  ((update: (d: CvData) => CvData) => void) | null
>(null);

/** Các hàm tạo `onCommit` cho từng loại trường; trả null khi preview không cho sửa */
export function useCvEdit() {
  const update = useContext(CvEditContext);
  if (!update) return null;
  return {
    personal:
      (field: keyof CvData["personal"]): Commit =>
      (v) =>
        update((d) => ({ ...d, personal: { ...d.personal, [field]: v } })),
    objective: (): Commit => (v) => update((d) => ({ ...d, objective: v })),
    custom:
      (id: string): Commit =>
      (v) =>
        update((d) => ({
          ...d,
          customSections: d.customSections.map((c) =>
            c.id === id ? { ...c, content: v } : c
          ),
        })),
    item:
      <K extends ListKey>(
        section: K,
        id: string,
        field: keyof CvData[K][number]
      ): Commit =>
      (v) =>
        update((d) => ({
          ...d,
          [section]: (d[section] as { id: string }[]).map((it) =>
            it.id === id ? { ...it, [field]: v } : it
          ),
        })),
  };
}

/**
 * Chữ trên CV bấm vào là sửa được (contentEditable). Lưu khi rời ô / Enter; Esc hủy.
 * Không truyền `onCommit` thì chỉ hiển thị như chữ thường.
 */
export default function EditText({
  value,
  onCommit,
  multiline = false,
  placeholder = "Nhập nội dung",
  as: Tag = "span",
  className = "",
}: {
  value: string;
  onCommit?: Commit | null;
  multiline?: boolean;
  placeholder?: string;
  as?: "span" | "p";
  className?: string;
}) {
  if (!onCommit) return <Tag className={className}>{value}</Tag>;

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      e.currentTarget.textContent = value;
      e.currentTarget.blur();
    } else if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <Tag
      // remount khi giá trị đổi từ ngoài để DOM do người dùng gõ không lệch với React
      key={value}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-multiline={multiline || undefined}
      aria-label={placeholder}
      data-placeholder={placeholder}
      onKeyDown={onKeyDown}
      onBlur={(e: FocusEvent<HTMLElement>) => {
        const text = cleanEditedText(
          readEditableText(e.currentTarget),
          multiline
        );
        if (text !== value) onCommit(text);
      }}
      className={`${className} cursor-text rounded-sm outline-offset-2 hover:outline-1 hover:outline-dashed hover:outline-current/40 focus:outline-2 focus:outline-solid focus:outline-current/60 empty:before:opacity-50 empty:before:content-[attr(data-placeholder)] print:outline-none`}
    >
      {value}
    </Tag>
  );
}
