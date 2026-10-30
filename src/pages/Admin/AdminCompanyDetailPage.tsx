import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Ban, BadgeCheck, LockOpen, XCircle } from "lucide-react";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import AdminModal from "../../components/Admin/AdminModal";
import Avatar from "../../components/common/Avatar";
import { useToast } from "../../components/common/toastContext";
import CompanyInfo, {
  CompanyStatusBadge,
} from "../../components/Employer/CompanyInfo";
import CompanyDocuments from "../../components/Employer/CompanyDocuments";
import { getErrorMessage } from "../../api";
import { adminCompanyService } from "../../services/job/companyService";
import {
  selectIsSuperAdmin,
  selectPermissions,
  useAppSelector,
} from "../../store";
import { formatDate, formatTime } from "../../utils/formatDate";
import type { Company, CompanyStatus } from "../../types/job/company.types";

type Load =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; company: Company };

// Hành động cần nhập lý do (gửi kèm thông báo + email cho người đăng ký)
type ReasonAction = {
  status: Extract<CompanyStatus, "REJECTED" | "SUSPENDED">;
  title: string;
  confirm: string;
};
const REJECT: ReasonAction = {
  status: "REJECTED",
  title: "Từ chối hồ sơ",
  confirm: "Từ chối",
};
const SUSPEND: ReasonAction = {
  status: "SUSPENDED",
  title: "Tạm khóa nhà tuyển dụng",
  confirm: "Tạm khóa",
};
const REASON_SUGGESTIONS = [
  "Ảnh CCCD bị mờ, không đọc được thông tin",
  "Giấy phép kinh doanh không khớp tên công ty hoặc mã số thuế",
  "Người đại diện không khớp với CCCD",
];

const btn =
  "flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition active:scale-95 disabled:opacity-60";

// Chi tiết + duyệt nhà tuyển dụng: GET/PATCH /api/admin/companies/{id}
export default function AdminCompanyDetailPage() {
  const { id } = useParams();
  const companyId = Number(id);
  const toast = useToast();
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const permissions = useAppSelector(selectPermissions);
  // Chỉ xem (COMPANY_VIEW) thì ẩn nút duyệt; BE vẫn chặn ở API
  const canManage = isSuperAdmin || permissions.includes("COMPANY_MANAGE");

  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reasonAction, setReasonAction] = useState<ReasonAction | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminCompanyService
      .get(companyId)
      .then((company) => !cancelled && setLoad({ status: "ready", company }))
      .catch(
        (err) =>
          !cancelled &&
          setLoad({ status: "error", message: getErrorMessage(err) })
      );
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  // Link giấy tờ hết hạn sau 10 phút: lấy lại chi tiết để có link mới
  const refreshDocuments = useCallback(async () => {
    const company = await adminCompanyService.get(companyId);
    setLoad({ status: "ready", company });
    return company.documents;
  }, [companyId]);

  const changeStatus = async (status: CompanyStatus, why?: string) => {
    if (saving) return;
    setSaving(true);
    try {
      const company = await adminCompanyService.setStatus(
        companyId,
        status,
        why
      );
      setLoad({ status: "ready", company });
      setReasonAction(null);
      setReason("");
      toast.show(
        status === "APPROVED"
          ? `Đã duyệt "${company.name}", người đăng ký đã được thông báo`
          : status === "REJECTED"
          ? "Đã từ chối hồ sơ, người đăng ký đã được thông báo"
          : "Đã tạm khóa nhà tuyển dụng"
      );
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const company = load.status === "ready" ? load.company : null;

  return (
    <>
      <AdminPageHeader
        soft
        breadcrumb={[
          { label: "Tổng quan", to: "/admin/dashboard" },
          { label: "Nhà tuyển dụng", to: "/admin/companies" },
          { label: company?.name ?? "Chi tiết" },
        ]}
        title={company?.name ?? "Hồ sơ nhà tuyển dụng"}
        titleExtra={company && <CompanyStatusBadge status={company.status} />}
        desc={
          company
            ? `Gửi lúc ${formatTime(company.createdAt)} · ${formatDate(
                company.createdAt
              )}`
            : undefined
        }
        action={
          <Link
            to="/admin/companies"
            className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-heading transition hover:bg-primary-50"
          >
            <ArrowLeft size={16} /> Danh sách
          </Link>
        }
      />

      <div className="space-y-5 px-4 pb-10 md:px-8">
        {load.status === "loading" ? (
          <div
            className="animate-pulse space-y-4"
            aria-busy="true"
            aria-label="Đang tải hồ sơ"
          >
            <div className="h-48 rounded-2xl bg-primary-50" />
            <div className="h-56 rounded-2xl bg-primary-50" />
          </div>
        ) : load.status === "error" ? (
          <p
            role="alert"
            className="rounded-2xl border border-dashed border-danger/30 bg-danger/5 px-6 py-12 text-center text-sm text-body"
          >
            {load.message}
          </p>
        ) : (
          company && (
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-5">
                <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-footer">
                    Thông tin đăng ký
                  </h2>
                  <div className="mt-4">
                    <CompanyInfo company={company} />
                  </div>
                </section>

                <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-footer">
                    Giấy tờ xác minh
                  </h2>
                  <p className="mt-1 text-xs text-body">
                    Đối chiếu tên công ty, mã số thuế trên giấy phép và họ tên,
                    số CCCD của người đại diện. Bấm "Mở" để xem bản gốc.
                  </p>
                  <div className="mt-4">
                    <CompanyDocuments
                      documents={company.documents}
                      refresh={refreshDocuments}
                      onError={(m) => toast.show(m, "error")}
                    />
                  </div>
                </section>
              </div>

              <aside className="space-y-5 xl:sticky xl:top-24">
                <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
                    Tài khoản đăng ký
                  </h2>
                  <div className="mt-3 flex items-center gap-3">
                    <Avatar
                      src={company.owner?.avatarUrl}
                      fullName={company.owner?.fullName || "?"}
                      className="h-11 w-11 shrink-0 text-sm"
                    />
                    <div className="min-w-0 text-sm">
                      <p className="truncate font-semibold text-heading">
                        {company.owner?.fullName ?? "—"}
                      </p>
                      <p className="truncate text-xs text-body">
                        {company.owner?.email ?? "—"}
                      </p>
                      <p className="truncate text-xs text-body">
                        {company.owner?.phone ?? ""}
                      </p>
                    </div>
                  </div>
                  {company.owner && (
                    <Link
                      to={`/admin/users/${company.owner.id}/edit`}
                      className="mt-3 inline-block text-xs font-semibold text-primary-700 hover:underline"
                    >
                      Xem tài khoản
                    </Link>
                  )}
                </section>

                <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
                    Xử lý hồ sơ
                  </h2>
                  {company.statusReason && (
                    <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                      Lý do: {company.statusReason}
                    </p>
                  )}
                  {company.reviewedAt && (
                    <p className="mt-3 text-xs text-body">
                      Xử lý lần cuối {formatTime(company.reviewedAt)} ·{" "}
                      {formatDate(company.reviewedAt)}
                    </p>
                  )}

                  {!canManage ? (
                    <p className="mt-3 text-xs text-muted">
                      Bạn chỉ có quyền xem hồ sơ.
                    </p>
                  ) : (
                    <div className="mt-4 flex flex-col gap-2.5">
                      {company.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => changeStatus("APPROVED")}
                            disabled={saving}
                            className={`${btn} justify-center bg-green-600 text-white hover:bg-green-700`}
                          >
                            <BadgeCheck size={17} /> Duyệt hồ sơ
                          </button>
                          <button
                            onClick={() => setReasonAction(REJECT)}
                            disabled={saving}
                            className={`${btn} justify-center border border-red-200 bg-white text-red-600 hover:bg-red-50`}
                          >
                            <XCircle size={17} /> Từ chối
                          </button>
                        </>
                      )}
                      {company.status === "APPROVED" && (
                        <button
                          onClick={() => setReasonAction(SUSPEND)}
                          disabled={saving}
                          className={`${btn} justify-center border border-line bg-white text-heading hover:bg-gray-50`}
                        >
                          <Ban size={17} /> Tạm khóa
                        </button>
                      )}
                      {company.status === "SUSPENDED" && (
                        <button
                          onClick={() => changeStatus("APPROVED")}
                          disabled={saving}
                          className={`${btn} justify-center bg-primary-600 text-white hover:bg-primary-700`}
                        >
                          <LockOpen size={17} /> Mở khóa
                        </button>
                      )}
                      {company.status === "REJECTED" && (
                        <p className="text-xs text-body">
                          Đang chờ người đăng ký sửa và gửi lại hồ sơ.
                        </p>
                      )}
                    </div>
                  )}
                </section>
              </aside>
            </div>
          )
        )}
      </div>

      {reasonAction && (
        <AdminModal
          title={reasonAction.title}
          onClose={() => !saving && setReasonAction(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (reason.trim()) changeStatus(reasonAction.status, reason);
            }}
          >
            <div className="space-y-3 p-6">
              <label className="block text-sm font-semibold text-heading">
                Lý do <span className="text-danger">*</span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  maxLength={500}
                  required
                  autoFocus
                  placeholder="Lý do sẽ được gửi cho người đăng ký qua thông báo và email"
                  className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm font-normal outline-none focus:border-primary-600"
                />
              </label>
              {reasonAction.status === "REJECTED" && (
                <div className="flex flex-wrap gap-2">
                  {REASON_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReason(s)}
                      className="rounded-full border border-line px-3 py-1 text-xs text-body transition hover:border-primary-300 hover:text-primary-700"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => setReasonAction(null)}
                className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50 disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                disabled={saving || !reason.trim()}
                className="rounded-lg bg-danger px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : reasonAction.confirm}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </>
  );
}
