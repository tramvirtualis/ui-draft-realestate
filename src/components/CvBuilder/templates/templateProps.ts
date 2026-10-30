import type { CvData, CvStyle } from "../../../types/job/cv.types";

/** Template chỉ nhận data + style và render */
export interface CvTemplateProps {
  data: CvData;
  style: CvStyle;
}
