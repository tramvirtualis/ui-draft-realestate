import {
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import {
  buildTemplateContext,
  renderTemplate,
  scopeCss,
} from "./handlebarsTemplate";
import type { CvTemplateProps } from "./templateProps";
import { CvEditContext, cleanEditedText, readEditableText } from "./EditText";
import { applyCvEdit, isCvEditKey } from "./cvEditKeys";
import type { CvTemplateSource } from "../../../types/job/cvTemplate.types";

/** Chiều cao trang A4 (297mm) theo px CSS */
const A4_PX = (297 / 25.4) * 96;

/**
 * Mẫu có nhiều trang (phần tử data-cv-page): kéo mỗi trang tới bội số trang A4 để trang sau bắt đầu
 * ở trang giấy mới trên bản xem trước và màu nền cột phủ hết trang. Bớt 0.5mm để khi in không dư trang trắng.
 */
function useFitPages(ref: RefObject<HTMLElement | null>, html: string | null) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || html === null) return;
    const pages = Array.from(
      root.querySelectorAll<HTMLElement>("[data-cv-page]")
    );
    if (!pages.length) return;
    const fit = () => {
      for (const page of pages) {
        page.style.minHeight = "";
        const count = Math.max(1, Math.ceil((page.offsetHeight - 0.5) / A4_PX));
        page.style.minHeight = `calc(${297 * count}mm - 0.5mm)`;
      }
    };
    fit();
    // nội dung đổi kích thước (font tải xong, ảnh…) thì tính lại; fit() cho cùng kết quả nên không lặp vô hạn
    const ro = new ResizeObserver(fit);
    for (const page of pages)
      page
        .querySelectorAll(":scope > *, :scope > * > *")
        .forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [ref, html]);
}

/**
 * Chữ có data-cv-edit (helper {{cvEdit}}): trong trang Tạo CV bấm vào là sửa được, lưu khi rời ô / Enter,
 * Esc hủy. Ngoài trang Tạo CV (admin, in PDF) không có CvEditContext nên chỉ xem.
 */
function useEditableFields(
  ref: RefObject<HTMLElement | null>,
  html: string | null
) {
  const update = useContext(CvEditContext);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !update || html === null) return;
    const cleanups: (() => void)[] = [];
    root.querySelectorAll<HTMLElement>("[data-cv-edit]").forEach((el) => {
      const key = el.dataset.cvEdit ?? "";
      if (!isCvEditKey(key)) return;
      const multiline = el.hasAttribute("data-cv-multiline");
      const original = readEditableText(el);
      try {
        el.contentEditable = "plaintext-only";
      } catch {
        el.contentEditable = "true"; // trình duyệt cũ chưa hỗ trợ plaintext-only
      }
      el.spellcheck = false;
      el.setAttribute("role", "textbox");
      if (multiline) el.style.whiteSpace = "pre-line";
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          el.textContent = original;
          el.blur();
        } else if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          el.blur();
        }
      };
      const onBlur = () => {
        const text = cleanEditedText(readEditableText(el), multiline);
        if (text !== original) update((d) => applyCvEdit(d, key, text) ?? d);
      };
      el.addEventListener("keydown", onKeyDown);
      el.addEventListener("blur", onBlur);
      cleanups.push(() => {
        el.removeEventListener("keydown", onKeyDown);
        el.removeEventListener("blur", onBlur);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, [ref, html, update]);
  return update !== null;
}

/** Viền gợi ý ô sửa được (không in ra PDF) */
const editableCss = (scopeId: string) => {
  const s = `[data-cv-tpl="${scopeId}"] [data-cv-edit]`;
  return `${s}{cursor:text;border-radius:2px;outline-offset:2px}
${s}:hover{outline:1px dashed color-mix(in srgb,currentColor 45%,transparent)}
${s}:focus{outline:2px solid color-mix(in srgb,currentColor 65%,transparent)}
@media print{${s}{outline:none!important}}`;
};

/**
 * Mẫu CV lấy từ BE (Handlebars). Nhận cùng data/style như các mẫu React,
 * nên dùng chung được với CvPreview (đo trang, in PDF) và trang soạn mẫu của admin.
 */
export default function CvTemplateHtml({
  data,
  style,
  template,
  scopeId,
}: CvTemplateProps & { template: CvTemplateSource; scopeId: string }) {
  const result = useMemo(
    () =>
      renderTemplate(
        template.htmlContent,
        buildTemplateContext(data, style, template.defaultConfig)
      ),
    [template.htmlContent, template.defaultConfig, data, style]
  );
  const css = useMemo(
    () => scopeCss(template.cssContent, scopeId),
    [template.cssContent, scopeId]
  );
  const bodyRef = useRef<HTMLDivElement>(null);
  useFitPages(bodyRef, result.ok ? result.html : null);
  const editable = useEditableFields(bodyRef, result.ok ? result.html : null);

  if (!result.ok) {
    return (
      <div
        role="alert"
        className="m-8 rounded-xl border border-dashed border-danger/40 bg-danger/5 p-6 text-sm"
      >
        <p className="font-semibold text-danger">Mẫu CV có lỗi cú pháp</p>
        <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-xs text-body">
          {result.error}
        </pre>
      </div>
    );
  }

  return (
    <div data-cv-tpl={scopeId} className="bg-white">
      {/* <style> nằm trong vùng CV nên được copy theo khi in PDF */}
      {css && <style>{css}</style>}
      {editable && <style>{editableCss(scopeId)}</style>}
      <div ref={bodyRef} dangerouslySetInnerHTML={{ __html: result.html }} />
    </div>
  );
}
