const CLOUDINARY_UPLOAD = "/image/upload/";

// Chèn biến đổi f_auto,q_auto,w_<width> cho ảnh Cloudinary; URL khác giữ nguyên
export const optimizedImage = (url: string, width: number): string => {
  if (!url.includes("res.cloudinary.com") || !url.includes(CLOUDINARY_UPLOAD)) return url;
  return url.replace(CLOUDINARY_UPLOAD, `${CLOUDINARY_UPLOAD}f_auto,q_auto,w_${width}/`);
};

// srcSet theo nhiều độ rộng để trình duyệt chọn ảnh vừa với màn hình
export const imageSrcSet = (url: string, widths: number[]): string | undefined => {
  if (!url.includes("res.cloudinary.com")) return undefined;
  return widths.map((w) => `${optimizedImage(url, w)} ${w}w`).join(", ");
};
