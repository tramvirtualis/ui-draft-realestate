import BaseService from "../base/BaseService";
import type { AdminDashboard } from "../../types/admin/dashboard.types";

// GET /api/admin/dashboard (chỉ ADMIN) — số liệu trang Tổng quan
class AdminDashboardService extends BaseService {
  constructor() {
    super("/admin/dashboard");
  }

  overview(): Promise<AdminDashboard> {
    return this.http.get<AdminDashboard>(this.url());
  }
}

export const adminDashboardService = new AdminDashboardService();
