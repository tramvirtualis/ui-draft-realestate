import CvSingleColumn from "./CvSingleColumn";
import type { CvTemplateProps } from "./templateProps";

/** Mẫu Professional: một cột, dải màu đầu trang, tiêu đề section gạch chân */
export default function CvTemplateProfessional(props: CvTemplateProps) {
  return <CvSingleColumn {...props} variant="professional" />;
}
