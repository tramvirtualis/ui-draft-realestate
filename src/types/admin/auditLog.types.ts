export interface AuditLogItem {
  id: string;
  timestamp: string;
  timestampEpochMs: number;
  nanoTimestamp?: string;
  traceId: string;
  userEmail: string;
  clientIp: string;
  module: string;
  actionTitle?: string;
  targetName?: string;
  description?: string;
  success?: boolean;
  method: string;
  uri: string;
  status: number;
  durationMs: number;
  tag: string;
  rawMessage: string;
}

export interface AuditLogCursorResponse {
  items: AuditLogItem[];
  nextCursor: string | null;
  hasMore: boolean;
  pageSize: number;
}

export interface AuditLogQueryParams {
  module?: string;
  keyword?: string;
  from?: string;
  to?: string;
  hours?: number;
  cursor?: string | null;
  limit?: number;
}
