import { useCallback, useEffect, useRef } from "react";
import { useCvBuilder } from "../../components/CvBuilder/cvBuilderContext";
import { applyTemplateOrder } from "../../components/CvBuilder/cvHelpers";
import {
  loadCvTemplate,
  parseDbTemplateId,
  toDbTemplateId,
  useCvTemplates,
} from "./useCvTemplates";
import {
  CV_TEMPLATES,
  CV_FONTS,
  CV_FONT_SIZES,
  type BuiltinCvTemplateId,
  type CvStyle,
  type CvTemplateId,
} from "../../types/job/cv.types";

export interface TemplateOption {
  id: CvTemplateId;
  label: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  builtin?: BuiltinCvTemplateId;
}

export function useTemplateOptions() {
  const { templates, loading } = useCvTemplates();
  const setStyle = useCvBuilder((s) => s.setStyle);
  // thứ tự mục mới nhất, dùng khi cấu hình mẫu tải xong
  const sectionOrder = useCvBuilder((s) => s.style.sectionOrder);
  const orderRef = useRef(sectionOrder);
  useEffect(() => {
    orderRef.current = sectionOrder;
  });

  const options: TemplateOption[] =
    templates.length > 0
      ? templates.map((t) => ({
          id: toDbTemplateId(t.id),
          label: t.name,
          description: t.description,
          thumbnailUrl: t.thumbnailUrl,
        }))
      : CV_TEMPLATES.map((t) => ({ id: t.id, label: t.label, builtin: t.id }));

  const select = useCallback(
    (id: CvTemplateId) => {
      setStyle({ template: id });
      const dbId = parseDbTemplateId(id);
      if (dbId === null) return;
      loadCvTemplate(dbId)
        .then(({ defaultConfig: c }) => {
          if (!c) return;
          const patch: Partial<CvStyle> = {};
          if (typeof c.color === "string" && c.color) patch.color = c.color;
          // Chỉ nhận font / cỡ chữ có trong danh sách để ô chọn hiển thị đúng
          if (
            typeof c.font === "string" &&
            CV_FONTS.some((f) => f.id === c.font)
          )
            patch.font = c.font;
          if (
            typeof c.fontSize === "number" &&
            (CV_FONT_SIZES as readonly number[]).includes(c.fontSize)
          )
            patch.fontSize = c.fontSize;
          // Thứ tự mục mặc định của mẫu; ứng viên vẫn sắp xếp lại được sau đó
          if (Array.isArray(c.sectionOrder))
            patch.sectionOrder = applyTemplateOrder(
              c.sectionOrder,
              orderRef.current
            );
          if (Object.keys(patch).length) setStyle(patch);
        })
        .catch(() => undefined);
    },
    [setStyle]
  );

  return { options, loading, select };
}
