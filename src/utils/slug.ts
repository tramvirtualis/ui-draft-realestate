// Bỏ dấu tiếng Việt, đổi sang chữ thường nối bằng dấu gạch ngang
export const slugify = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Tham số route có thể là "12" hoặc "12-the-lumen-riverside" → lấy phần id ở đầu
export const parseProjectId = (param: string | undefined): number | undefined => {
  if (!param) return undefined;
  const n = Number.parseInt(param, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

// Đường dẫn thân thiện của dự án
export const projectPath = (id: number, name?: string | null): string => {
  const slug = name ? slugify(name) : "";
  return slug ? `/projects/${id}-${slug}` : `/projects/${id}`;
};
