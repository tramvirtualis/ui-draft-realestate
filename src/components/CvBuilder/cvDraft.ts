import {
  DEFAULT_CV_STYLE,
  EMPTY_CV_DATA,
  type CvData,
  type CvStyle,
} from "../../types/job/cv.types";

/**
 * Lưu nháp CV ở localStorage, mỗi tài khoản một ô riêng (null = khách chưa đăng nhập) để người dùng
 * sau trên cùng máy không thấy CV của tài khoản trước. Đã đăng nhập thì CvBuilderProvider
 * đồng bộ thêm lên tài khoản (/me/cv-draft) để mở ở trình duyệt khác vẫn sửa tiếp.
 */
const keyOf = (ownerId: number | null) =>
  ownerId === null ? "cv-draft" : `cv-draft:u${ownerId}`;

export interface CvDraft {
  data: CvData;
  style: CvStyle;
  savedAt: string;
}

/** Bản nháp tạo trước khi có mục "Giới thiệu bản thân": thêm mục này lên đầu */
const withSummary = (style: CvStyle): CvStyle =>
  style.sectionOrder.includes("summary")
    ? style
    : { ...style, sectionOrder: ["summary", ...style.sectionOrder] };

/** Trộn với mặc định để bản nháp cũ / từ server thiếu trường vẫn chạy được */
export function normalizeDraft(raw: {
  data?: Partial<CvData> | null;
  style?: Partial<CvStyle> | null;
  savedAt?: string | null;
}): CvDraft {
  return {
    data: {
      ...EMPTY_CV_DATA,
      ...raw.data,
      personal: { ...EMPTY_CV_DATA.personal, ...raw.data?.personal },
    },
    style: withSummary({ ...DEFAULT_CV_STYLE, ...raw.style }),
    savedAt: raw.savedAt ?? new Date().toISOString(),
  };
}

export function loadDraft(ownerId: number | null = null): CvDraft | null {
  try {
    const raw = localStorage.getItem(keyOf(ownerId));
    return raw ? normalizeDraft(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** ok = false khi localStorage bị chặn hoặc đầy */
export function saveDraft(
  data: CvData,
  style: CvStyle,
  ownerId: number | null = null,
  savedAt = new Date().toISOString()
): { ok: boolean; savedAt: string } {
  try {
    localStorage.setItem(keyOf(ownerId), JSON.stringify({ data, style, savedAt }));
    return { ok: true, savedAt };
  } catch {
    return { ok: false, savedAt };
  }
}

export function clearDraft(ownerId: number | null = null) {
  try {
    localStorage.removeItem(keyOf(ownerId));
  } catch {
    // trình duyệt chặn localStorage thì không có gì để xóa
  }
}

/** CV chưa nhập gì (không cần đẩy lên tài khoản) */
export function isEmptyCv(d: CvData): boolean {
  return (
    Object.values(d.personal).every((v) => !String(v ?? "").trim()) &&
    !d.objective.trim() &&
    [
      d.experience,
      d.education,
      d.skills,
      d.projects,
      d.certificates,
      d.languages,
      d.references,
      d.customSections,
    ].every((list) => list.length === 0)
  );
}
