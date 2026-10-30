import { useEffect, useRef, useState, type CSSProperties } from "react";
import CvTemplateHtml from "../../CvBuilder/templates/CvTemplateHtml";
import { A4_HEIGHT_PX, A4_WIDTH_PX } from "../../CvBuilder/CvPreview";
import { SAMPLE_CV_DATA, SAMPLE_CV_STYLE } from "../../../data/sampleCvData";
import {
  CV_FONTS_URL,
  type CvData,
  type CvStyle,
} from "../../../types/job/cv.types";
import type { CvTemplateSource } from "../../../types/job/cvTemplate.types";

const FONTS_URL = CV_FONTS_URL;
export default function CvTemplateA4Preview({
  template,
  style: stylePatch,
  data = SAMPLE_CV_DATA,
  scopeId = "admin-preview",
}: {
  template: CvTemplateSource;
  style?: Partial<CvStyle>;
  data?: CvData;
  scopeId?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.6);
  const [height, setHeight] = useState(A4_HEIGHT_PX);
  const style: CvStyle = { ...SAMPLE_CV_STYLE, ...stylePatch };

  // Co giãn theo bề rộng khung
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const ro = new ResizeObserver(([entry]) =>
      setZoom(Math.min(1, entry.contentRect.width / A4_WIDTH_PX))
    );
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  // Đo chiều cao nội dung để biết số trang A4
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.scrollHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pages = Math.max(1, Math.ceil((height - 2) / A4_HEIGHT_PX));
  const cssVars = {
    "--cv-color": style.color,
    "--cv-font": `"${style.font}"`,
    "--cv-size": `${style.fontSize}px`,
    "--cv-pages": pages,
    fontFamily: `"${style.font}", system-ui, sans-serif`,
    fontSize: `${style.fontSize}px`,
  } as CSSProperties;

  return (
    <div ref={boxRef} className="w-full">
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
            className="w-[210mm] bg-white leading-[1.45]"
            style={cssVars}
          >
            <CvTemplateHtml
              data={data}
              style={style}
              template={template}
              scopeId={scopeId}
            />
          </div>
          {Array.from({ length: pages - 1 }, (_, i) => (
            <div
              key={i}
              aria-hidden
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-primary-300"
              style={{ top: A4_HEIGHT_PX * (i + 1) }}
            />
          ))}
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-muted">
        Dữ liệu mẫu · {pages} trang A4
      </p>
    </div>
  );
}
