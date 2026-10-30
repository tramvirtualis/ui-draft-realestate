import ProjectImageManager from "../../../components/Admin/project/images/ProjectImageManager";
import { policyImageService } from "../../../services/project/policyImageService";

export default function ProjectPoliciesPage() {
  return (
    <ProjectImageManager
      service={policyImageService}
      title="Quản lý chính sách bán hàng"
      desc="Tải lên các hình ảnh chính sách bán hàng, phương thức thanh toán và ưu đãi của từng dự án; hiển thị tại tab Chính sách của dự án."
    />
  );
}
