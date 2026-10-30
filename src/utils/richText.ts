import DOMPurify from "dompurify";

// Nội dung do trình soạn thảo tạo ra là HTML; tin cũ có thể chỉ là văn bản thuần
export const isHtml = (content: string): boolean => /<\/?[a-z][\s\S]*>/i.test(content);

// Làm sạch HTML trước khi hiển thị (chặn script, sự kiện on*, ...)
export const sanitizeHtml = (html: string): string =>
  DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, ADD_ATTR: ["target", "rel"] });

// HTML → văn bản thuần (dùng cho đoạn tóm tắt, đếm từ)
export const htmlToText = (content: string): string => {
  if (!isHtml(content)) return content.trim();
  const withBreaks = content.replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, " ").replace(/<br\s*\/?>/gi, " ");
  return withBreaks.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
};

// Bài đăng cộng đồng: người dùng gõ chữ thuần, còn bài admin sửa bằng trình soạn thảo là HTML (bắt đầu bằng thẻ khối).
// Kiểm tra chặt hơn isHtml để chữ thuần có ký tự "<" (vd "a<b") không bị hiểu nhầm thành HTML.
export const isRichPost = (content: string): boolean => /^\s*<(p|h[1-6]|ul|ol|blockquote|hr)\b/i.test(content);

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Chữ thuần → HTML để nạp vào trình soạn thảo (mỗi dòng là một đoạn); HTML thì giữ nguyên
export const postToEditorHtml = (content: string | null): string => {
  if (!content) return "";
  if (isRichPost(content)) return content;
  return content
    .split(/\r?\n/)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
};

// Trình soạn thảo trống vẫn trả về "<p></p>"
export const isRichTextEmpty = (html: string): boolean => htmlToText(html) === "" && !/<img\b/i.test(html);
