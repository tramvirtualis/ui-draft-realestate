import { useEffect, useState } from "react";
import cvTemplateService from "../../services/job/cvTemplateService";
import type {
  CvTemplateDetail,
  CvTemplateSummary,
} from "../../types/job/cvTemplate.types";

// Mẫu CV ít thay đổi → cache dùng chung cho cả phiên (giống useJobTypes)
let listCache: CvTemplateSummary[] | null = null;
const detailCache = new Map<number, Promise<CvTemplateDetail>>();

// Id mẫu từ BE lưu trong CvStyle.template dạng "db:12" để phân biệt với 3 mẫu có sẵn
export const toDbTemplateId = (id: number) => `db:${id}` as const;
export const parseDbTemplateId = (templateId: string): number | null => {
  const m = /^db:(\d+)$/.exec(templateId);
  return m ? Number(m[1]) : null;
};

// Lấy chi tiết 1 mẫu (kèm HTML/CSS); gọi nhiều lần cùng id chỉ tải 1 lần
export function loadCvTemplate(id: number): Promise<CvTemplateDetail> {
  let p = detailCache.get(id);
  if (!p) {
    p = cvTemplateService.get(id);
    p.catch(() => detailCache.delete(id));
    detailCache.set(id, p);
  }
  return p;
}

// Danh sách mẫu CV đang hiển thị. Lỗi mạng thì trả mảng rỗng (giao diện dùng 3 mẫu có sẵn)
export function useCvTemplates() {
  const [templates, setTemplates] = useState<CvTemplateSummary[]>(
    listCache ?? []
  );
  const [loading, setLoading] = useState(listCache === null);

  useEffect(() => {
    if (listCache) return;
    let ignore = false;
    cvTemplateService
      .list()
      .then((page) => {
        listCache = page.content;
        if (!ignore) setTemplates(page.content);
      })
      .catch(() => undefined)
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, []);

  return { templates, loading };
}

type DetailState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; template: CvTemplateDetail };

// Chi tiết mẫu theo id (null = không phải mẫu từ BE) */
export function useCvTemplateDetail(id: number | null): DetailState | null {
  const [state, setState] = useState<{ id: number; value: DetailState } | null>(
    null
  );

  useEffect(() => {
    if (id === null) return;
    let ignore = false;
    loadCvTemplate(id)
      .then(
        (template) =>
          !ignore && setState({ id, value: { status: "ready", template } })
      )
      .catch(() => !ignore && setState({ id, value: { status: "error" } }));
    return () => {
      ignore = true;
    };
  }, [id]);

  if (id === null) return null;
  // Đổi sang id khác thì coi như đang tải, không hiện mẫu cũ
  return state?.id === id ? state.value : { status: "loading" };
}
