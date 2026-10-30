import type { AuditLogItem } from "../../../types/admin/auditLog.types";

export const MODULE_OPTIONS = [
  { value: "ALL", label: "Tất cả phân hệ" },
  { value: "PROJECT", label: "Dự án & Quỹ căn" },
  { value: "USER", label: "Người dùng & Quyền" },
  { value: "NEWS", label: "Tin tức" },
  { value: "SOCIAL", label: "Cộng đồng" },
  { value: "DOCUMENT", label: "Tài liệu" },
  { value: "EVENT", label: "Sự kiện" },
  { value: "JOBS", label: "Tuyển dụng" },
  { value: "COMPANY", label: "Doanh nghiệp" },
  { value: "RAG", label: "Trợ lý AI" },
];

export const TIME_OPTIONS = [
  { value: 1, label: "1 giờ qua" },
  { value: 6, label: "6 giờ qua" },
  { value: 24, label: "24 giờ qua" },
  { value: 72, label: "3 ngày qua" },
  { value: 168, label: "7 ngày qua" },
];

export const METHOD_OPTIONS = [
  { value: "ALL", label: "Tất cả phương thức" },
  { value: "POST", label: "POST (Thêm mới)" },
  { value: "PUT", label: "PUT (Cập nhật)" },
  { value: "PATCH", label: "PATCH (Sửa đổi)" },
  { value: "DELETE", label: "DELETE (Xóa)" },
  { value: "GET", label: "GET (Xem/Lỗi)" },
];

export const getMethodBadge = (method?: string): string => {
  switch (method?.toUpperCase()) {
    case "POST":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PUT":
    case "PATCH":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "DELETE":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "GET":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export const getModuleBadge = (module?: string): string => {
  switch (module?.toUpperCase()) {
    case "PROJECT":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "USER":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "NEWS":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "SOCIAL":
      return "bg-pink-50 text-pink-700 border-pink-200";
    case "DOCUMENT":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "EVENT":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "JOBS":
    case "COMPANY":
      return "bg-teal-50 text-teal-700 border-teal-200";
    case "RAG":
      return "bg-violet-50 text-violet-700 border-violet-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export const formatIp = (ip?: string): string => {
  if (!ip) return "";
  const clean = ip.trim();
  if (clean === "0:0:0:0:0:0:0:1" || clean === "::1") return "127.0.0.1";
  return clean;
};

export const formatUser = (userEmail?: string, currentUserEmail?: string): string => {
  if (!userEmail || userEmail === "anonymous") {
    return currentUserEmail || "Ban Quản trị (Admin)";
  }
  return userEmail;
};

export interface BusinessInfo {
  actionTitle: string;
  targetName: string;
  targetId?: string;
  description: string;
}

export const resolveBusinessInfo = (
  item: AuditLogItem,
  projectMap: Record<string, string>
): BusinessInfo => {
  let actionTitle = item.actionTitle;
  let targetName = item.targetName;
  let description = item.description;

  const uri = item.uri?.split("?")[0] || "";
  const method = item.method?.toUpperCase() || "";
  const idMatch = uri.match(/\/(\d+)(?:\/|$)/);
  const extractedId = idMatch ? idMatch[1] : "";
  const targetId = extractedId ? `#${extractedId}` : undefined;

  let entity = "đối tượng";
  const isProject = uri.startsWith("/api/projects") || uri.startsWith("/api/admin/projects");
  if (isProject) entity = "dự án";
  else if (uri.startsWith("/api/properties") || uri.startsWith("/api/property-images")) entity = "căn hộ";
  else if (uri.startsWith("/api/zones")) entity = "phân khu";
  else if (uri.startsWith("/api/buildings")) entity = "tòa nhà";
  else if (uri.startsWith("/api/sales-sheets")) entity = "bảng hàng";
  else if (uri.startsWith("/api/floor-plans")) entity = "mặt bằng tầng";
  else if (uri.startsWith("/api/admin/project-locations") || uri.startsWith("/api/project-locations")) entity = "vị trí dự án";
  else if (uri.startsWith("/api/project-images")) entity = "ảnh dự án";
  else if (uri.startsWith("/api/policy-images")) entity = "chính sách bán hàng";
  else if (uri.startsWith("/api/project-progress")) entity = "tiến độ dự án";
  else if (uri.startsWith("/api/project-documents")) entity = "tài liệu dự án";
  else if (uri.startsWith("/api/questions")) entity = "hỏi đáp FAQ";
  else if (uri.startsWith("/api/admin/virtual-tours")) entity = "tour 360°";
  else if (uri.startsWith("/api/amenities")) entity = "tiện ích dự án";
  else if (uri.startsWith("/api/admin/bookings") || uri.startsWith("/api/bookings")) entity = "đặt chỗ booking";
  else if (uri.startsWith("/api/admin/users") || uri.startsWith("/api/users")) entity = "người dùng";
  else if (uri.startsWith("/api/admin/roles")) entity = "vai trò / quyền";
  else if (uri.startsWith("/api/admin/news") || uri.startsWith("/api/news")) entity = "tin tức";
  else if (uri.startsWith("/api/admin/events") || uri.startsWith("/api/events")) entity = "sự kiện";
  else if (uri.startsWith("/api/admin/documents") || uri.startsWith("/api/documents")) entity = "tài liệu";
  else if (uri.startsWith("/api/admin/jobs") || uri.startsWith("/api/jobs")) entity = "tin tuyển dụng";
  else if (uri.startsWith("/api/admin/job-types") || uri.startsWith("/api/job-types")) entity = "loại công việc";
  else if (uri.startsWith("/api/admin/companies") || uri.startsWith("/api/companies")) entity = "doanh nghiệp";
  else if (uri.startsWith("/api/admin/applications") || uri.startsWith("/api/applications")) entity = "hồ sơ ứng tuyển";
  else if (uri.startsWith("/api/admin/cv-templates")) entity = "mẫu CV ứng viên";
  else if (uri.startsWith("/api/admin/posts") || uri.startsWith("/api/posts")) entity = "bài viết cộng đồng";
  else if (uri.startsWith("/api/admin/post-backgrounds")) entity = "màu nền bài viết";
  else if (uri.startsWith("/api/admin/social-ads")) entity = "quảng cáo";
  else if (uri.startsWith("/api/admin/notifications")) entity = "thông báo hệ thống";
  else if (uri.startsWith("/api/admin/notification-types")) entity = "loại thông báo";
  else if (uri.startsWith("/api/admin/rag")) entity = "tri thức AI RAG";
  else if (uri.startsWith("/api/admin/audit-logs")) entity = "nhật ký hoạt động";

  let verb = "Thao tác trên";
  if (method === "POST") verb = "Thêm mới";
  else if (method === "PUT" || method === "PATCH") verb = "Cập nhật";
  else if (method === "DELETE") verb = "Xóa";
  else if (method === "GET") verb = "Xem";

  if (!actionTitle) {
    actionTitle = `${verb} ${entity}`;
  }

  // Tra cứu tên thật của dự án từ projectMap hoặc localStorage nếu có ID
  if (isProject && extractedId) {
    const known = projectMap[extractedId] || localStorage.getItem(`project_name_${extractedId}`);
    if (known) {
      targetName = known;
    }
  }

  // Tên đối tượng: Chỉ lấy TÊN thật. Nếu không có tên thật thì dùng danh từ loại đối tượng (ví dụ "Dự án"),
  // TUYỆT ĐỐI không chèn #ID vào targetName để ngoài bảng không bao giờ xuất hiện ID!
  if (!targetName || targetName.includes("#") || targetName === "Dự án mới") {
    if (isProject && extractedId) {
      const known = projectMap[extractedId] || localStorage.getItem(`project_name_${extractedId}`);
      targetName = known || "Dự án";
    } else {
      const capEntity = entity.charAt(0).toUpperCase() + entity.slice(1);
      targetName = capEntity;
    }
  }

  // Diễn giải (description): Dành riêng cho Modal Chi tiết để hiển thị đầy đủ cả Name + Mã ID
  if (!description || description.includes("#" + extractedId) || description.includes("Dự án mới")) {
    if (targetId && targetName && targetName !== "Dự án" && !targetName.includes(targetId)) {
      description = `${actionTitle}: ${targetName} (Mã ID: ${targetId})`;
    } else if (targetId) {
      description = `${actionTitle} (Mã ID: ${targetId})`;
    } else {
      description = `${actionTitle}: ${targetName}`;
    }
  }

  return { actionTitle, targetName, targetId, description };
};
