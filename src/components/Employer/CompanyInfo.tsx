import CompanyLogo from "./CompanyLogo";
import {
  COMPANY_STATUS_META,
  type Company,
  type CompanyStatus,
} from "../../types/job/company.types";

export function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  const meta = COMPANY_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.label}
    </span>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm text-heading">
        {children || "—"}
      </dd>
    </div>
  );
}

// Thông tin công ty + người đại diện (chỉ đọc), dùng ở trang Nhà tuyển dụng và trang duyệt của admin
export default function CompanyInfo({ company }: { company: Company }) {
  return (
    <div className="space-y-6">
      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 sm:col-span-2">
          <CompanyLogo name={company.name} logoUrl={company.logoUrl} className="h-16 w-16" textSize="text-lg" />
          <Row label="Tên công ty">{company.name}</Row>
        </div>
        <Row label="Mã số thuế">{company.taxCode}</Row>
        <Row label="Số điện thoại">{company.phone}</Row>
        <div className="sm:col-span-2">
          <Row label="Địa chỉ">{company.address}</Row>
        </div>
        <Row label="Email tuyển dụng">{company.email}</Row>
        <Row label="Website">
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="text-primary-700 hover:underline"
            >
              {company.website}
            </a>
          )}
        </Row>
        {company.description && (
          <div className="sm:col-span-2">
            <Row label="Giới thiệu">
              <span className="whitespace-pre-line">{company.description}</span>
            </Row>
          </div>
        )}
      </dl>

      <div className="h-px bg-line" />

      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
        <Row label="Người đại diện">{company.representativeName}</Row>
        <Row label="Chức vụ">{company.representativePosition}</Row>
        <Row label="Số CCCD">
          <span className="font-mono tracking-wider">
            {company.idCardNumber}
          </span>
        </Row>
      </dl>
    </div>
  );
}
