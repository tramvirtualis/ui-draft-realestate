// Cấu hình mặc định của mẫu, áp vào CvStyle khi người dùng chọn mẫu
export interface CvTemplateConfig {
  color?: string;
  font?: string;
  fontSize?: number;
  [key: string]: unknown;
}

// Bản rút gọn trong API danh sách (không kèm HTML/CSS)
export interface CvTemplateSummary {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Bản đầy đủ trong API chi tiết
export interface CvTemplateDetail extends CvTemplateSummary {
  htmlContent: string;
  cssContent: string | null;
  defaultConfig: CvTemplateConfig | null;
  createdBy?: number;
}

// Body tạo / sửa mẫu (JSON)
export interface CvTemplateInput {
  name: string;
  slug?: string;
  description?: string;
  htmlContent: string;
  cssContent?: string;
  defaultConfig: CvTemplateConfig;
  active: boolean;
  sortOrder: number;
}

export type CvTemplateSource = Pick<
  CvTemplateDetail,
  "htmlContent" | "cssContent" | "defaultConfig"
>;
