import BaseService from "../base/BaseService";
import { cleanParams } from "../../api/http";
import type { AuditLogCursorResponse, AuditLogQueryParams } from "../../types/admin/auditLog.types";

class AdminAuditLogService extends BaseService {
  constructor() {
    super("/admin/audit-logs");
  }

  async getLogs(params?: AuditLogQueryParams): Promise<AuditLogCursorResponse> {
    return this.http.get<AuditLogCursorResponse>(this.url(), {
      params: params && cleanParams(params as Record<string, unknown>),
    });
  }
}

export const adminAuditLogService = new AdminAuditLogService();
