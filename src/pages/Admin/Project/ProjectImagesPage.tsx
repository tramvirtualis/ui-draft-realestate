import ProjectImageManager from "../../../components/Admin/project/images/ProjectImageManager";
import { projectImageService } from "../../../services/project/projectImageService";

export default function ProjectImagesPage() {
  return (
    <ProjectImageManager
      service={projectImageService}
      title="Quản lý ảnh dự án"
      desc="Xây dựng bộ sưu tập hình ảnh cho từng dự án: thêm nhiều ảnh cùng lúc, xem ảnh lớn và xóa ảnh không còn phù hợp."
    />
  );
}
