import CvSingleColumn from "./CvSingleColumn";
import type { CvTemplateProps } from "./templateProps";

/** Mẫu Minimal: một cột, nhiều khoảng trắng, tiêu đề nhỏ dãn chữ */
export default function CvTemplateMinimal(props: CvTemplateProps) {
  return <CvSingleColumn {...props} variant="minimal" />;
}
