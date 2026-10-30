import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import CvTemplateModern from "./templates/CvTemplateModern";
import CvTemplateProfessional from "./templates/CvTemplateProfessional";
import CvTemplateMinimal from "./templates/CvTemplateMinimal";
import CvTemplateHtml from "./templates/CvTemplateHtml";
import {
  parseDbTemplateId,
  useCvTemplateDetail,
} from "../../hooks/job/useCvTemplates";
import type { CvTemplateProps } from "./templates/templateProps";
import { resolveBuilderSource } from "../Admin/cvTemplates/templateBuilder";
import {
  CV_FONTS_URL,
  type CvData,
  type CvStyle,
} from "../../types/job/cv.types";

export const A4_WIDTH_PX = 793.7;
export const A4_HEIGHT_PX = 1122.5;

const FONTS_URL = CV_FONTS_URL;
function CvTemplateRenderer({ data, style }: CvTemplateProps) {
  const dbId = parseDbTemplateId(style.template);
  const detail = useCvTemplateDetail(dbId);
  // mẫu Thiết kế nhanh: dựng lại từ cấu trúc đã lưu để có bản mới nhất (sửa chữ ngay trên CV)
  const template = useMemo(
    () =>
      detail?.status === "ready" ? resolveBuilderSource(detail.template) : null,
    [detail]
  );

  if (template) {
    return (
      <CvTemplateHtml
        data={data}
        style={style}
        template={template}
        scopeId={`db-${template.id}`}
      />
    );
  }
  if (detail?.status === "loading") {
    return (
      <div
        className="animate-pulse space-y-4 p-10"
        aria-busy="true"
        aria-label="Đang tải mẫu CV"
      >
        <div className="h-8 w-1/2 rounded bg-primary-50" />
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className="h-4 rounded bg-primary-50" />
        ))}
      </div>
    );
  }
  const Builtin =
    style.template === "professional"
      ? CvTemplateProfessional
      : style.template === "minimal"
      ? CvTemplateMinimal
      : CvTemplateModern;
  return <Builtin data={data} style={style} />;
}

interface CvPreviewProps {
  data: CvData;
  style: CvStyle;
  zoom: number;
  onPageCount: (pages: number) => void;
  pageRef: RefObject<HTMLDivElement | null>;
}

export default function CvPreview({
  data,
  style,
  zoom,
  onPageCount,
  pageRef,
}: CvPreviewProps) {
  const [height, setHeight] = useState(A4_HEIGHT_PX);
  const measure = useCallback(() => {
    const el = pageRef.current;
    const root = el?.firstElementChild as HTMLElement | null;
    if (!el || !root) return;
    const natural =
      root.dataset.cvLayout === "columns"
        ? Math.max(
            ...Array.from(root.children, (c) => (c as HTMLElement).offsetHeight)
          )
        : el.scrollHeight;
    setHeight((prev) => (Math.abs(prev - natural) < 0.5 ? prev : natural));
  }, [pageRef]);

  useLayoutEffect(measure);
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [pageRef, measure]);

  const pages = Math.max(1, Math.ceil((height - 2) / A4_HEIGHT_PX));
  useEffect(() => onPageCount(pages), [pages, onPageCount]);

  const cssVars = {
    "--cv-color": style.color,
    "--cv-font": `"${style.font}"`,
    "--cv-size": `${style.fontSize}px`,
    fontFamily: `"${style.font}", system-ui, sans-serif`,
    fontSize: `${style.fontSize}px`,
    "--cv-pages": pages,
  } as CSSProperties;

  return (
    <>
      <link rel="stylesheet" href={FONTS_URL} precedence="default" />
      <div
        style={{
          width: A4_WIDTH_PX * zoom,
          height: pages * A4_HEIGHT_PX * zoom,
        }}
        className="mx-auto overflow-hidden bg-white shadow-lg ring-1 ring-line"
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            width: A4_WIDTH_PX,
          }}
          className="relative"
        >
          <div
            ref={pageRef}
            className="w-[210mm] bg-white leading-[1.45] [-webkit-print-color-adjust:exact] [print-color-adjust:exact]"
            style={cssVars}
          >
            <CvTemplateRenderer data={data} style={style} />
          </div>
          {Array.from({ length: pages - 1 }, (_, i) => (
            <div
              key={i}
              aria-hidden
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-primary-300 print:hidden"
              style={{ top: A4_HEIGHT_PX * (i + 1) }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
