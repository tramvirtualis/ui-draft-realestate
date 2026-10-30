import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Ban,
  Briefcase,
  Building2,
  Clock3,
  Pencil,
  XCircle,
} from "lucide-react";
import Breadcrumb from "../../components/common/Breadcrumb";
import ToastProvider from "../../components/common/Toast";
import { useToast } from "../../components/common/toastContext";
import CompanyForm from "../../components/Employer/CompanyForm";
import CompanyInfo, {
  CompanyStatusBadge,
} from "../../components/Employer/CompanyInfo";
import CompanyDocuments from "../../components/Employer/CompanyDocuments";
import { getErrorMessage } from "../../api/http";
import { myCompanyService } from "../../services/job/companyService";
import type {
  Company,
  CompanyFiles,
  CompanyInput,
} from "../../types/job/company.types";
import { formatDate } from "../../utils/formatDate";

const TITLE = "Nhà tuyển dụng | Đất Việt Group";

type Load =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; company: Company | null };

// Thông điệp theo trạng thái hồ sơ
function StatusBanner({ company }: { company: Company }) {
  const base = "flex items-start gap-3 rounded-3xl p-5";
  switch (company.status) {
    case "PENDING":
      return (
        <div className={`${base} bg-amber-50 text-amber-900`}>
          <Clock3
            size={22}
            className="mt-0.5 shrink-0 text-amber-600"
            aria-hidden
          />
          <div>
            <p className="font-semibold">Hồ sơ đang chờ duyệt</p>
            <p className="mt-1 text-sm">
              Quản trị viên sẽ kiểm tra giấy tờ và phản hồi qua thông báo và
              email. Bạn vẫn có thể sửa hồ sơ trong lúc chờ.
            </p>
          </div>
        </div>
      );
    case "APPROVED":
      return (
        <div className={`${base} bg-green-50 text-green-900`}>
          <BadgeCheck
            size={22}
            className="mt-0.5 shrink-0 text-green-600"
            aria-hidden
          />
          <div className="flex-1">
            <p className="font-semibold">Đã xác minh nhà tuyển dụng</p>
            <p className="mt-1 text-sm">
              {company.reviewedAt
                ? `Được duyệt ngày ${formatDate(company.reviewedAt)}. `
                : ""}
              Bạn có thể đăng tin và quản lý ứng viên trong khu nhà tuyển dụng.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to="/employer/jobs"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-green-600 px-5 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                <Briefcase size={15} aria-hidden /> Vào trang nhà tuyển dụng
              </Link>
              <Link
                to="/employer/jobs/new"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-green-300 bg-white px-5 text-sm font-semibold text-green-800 transition hover:bg-green-100"
              >
                Đăng tin mới
              </Link>
            </div>
          </div>
        </div>
      );
    case "REJECTED":
      return (
        <div className={`${base} bg-red-50 text-red-900`}>
          <XCircle
            size={22}
            className="mt-0.5 shrink-0 text-red-500"
            aria-hidden
          />
          <div>
            <p className="font-semibold">Hồ sơ chưa được duyệt</p>
            {company.statusReason && (
              <p className="mt-1 text-sm">Lý do: {company.statusReason}</p>
            )}
            <p className="mt-1 text-sm">
              Vui lòng sửa theo góp ý rồi gửi lại hồ sơ.
            </p>
          </div>
        </div>
      );
    case "SUSPENDED":
      return (
        <div className={`${base} bg-red-300 text-black-900`}>
          <Ban
            size={22}
            className="mt-0.5 shrink-0 text-gray-500"
            aria-hidden
          />
          <div>
            <p className="font-semibold">
              Tài khoản nhà tuyển dụng đang bị tạm khóa
            </p>
            {company.statusReason && (
              <p className="mt-1 text-sm">Lý do: {company.statusReason}</p>
            )}
            <p className="mt-1 text-sm">
              Vui lòng liên hệ quản trị viên để được hỗ trợ.
            </p>
          </div>
        </div>
      );
  }
}

// Trang "Nhà tuyển dụng": đăng ký, theo dõi trạng thái duyệt, sửa / gửi lại hồ sơ (/me/company)
function Employer() {
  const toast = useToast();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    myCompanyService
      .get()
      .then((company) => !cancelled && setLoad({ status: "ready", company }))
      .catch(
        (err) =>
          !cancelled &&
          setLoad({ status: "error", message: getErrorMessage(err) })
      );
    return () => {
      cancelled = true;
    };
  }, []);

  // Link giấy tờ hết hạn sau 10 phút: lấy lại hồ sơ để có link mới
  const refreshDocuments = useCallback(async () => {
    const company = await myCompanyService.get();
    if (company) setLoad({ status: "ready", company });
    return company?.documents ?? null;
  }, []);

  const register = async (input: CompanyInput, files: CompanyFiles) => {
    try {
      const company = await myCompanyService.register(input, files);
      setLoad({ status: "ready", company });
      toast.show("Đã gửi hồ sơ, vui lòng chờ quản trị viên duyệt");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    }
  };

  const update = async (input: CompanyInput, files: CompanyFiles) => {
    try {
      const company = await myCompanyService.updateMine(input, files);
      setLoad({ status: "ready", company });
      setEditing(false);
      toast.show(
        company.status === "PENDING"
          ? "Đã gửi lại hồ sơ, vui lòng chờ duyệt"
          : "Đã cập nhật hồ sơ"
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.show(getErrorMessage(err), "error");
    }
  };

  const company = load.status === "ready" ? load.company : null;
  // Bị từ chối thì mở sẵn form để sửa và gửi lại
  const showForm =
    company !== null && (editing || company.status === "REJECTED");

  return (
    <>
      <title>{TITLE}</title>
      <meta name="robots" content="noindex" />

      <Breadcrumb
        items={[
          { label: "Tài khoản", to: "/account" },
          { label: "Nhà tuyển dụng" },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex flex-wrap items-center gap-3 text-3xl font-semibold text-heading md:text-4xl">
            Nhà tuyển dụng{" "}
            {company && <CompanyStatusBadge status={company.status} />}
          </h1>
          <p className="mt-2 text-sm text-body">
            {company
              ? `Hồ sơ gửi ngày ${formatDate(company.createdAt)}`
              : "Xác minh công ty để đăng tin tuyển dụng trên Đất Việt Group."}
          </p>
        </div>
        {company && !showForm && company.status !== "SUSPENDED" && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex h-11 items-center gap-2 rounded-full border border-primary-200 px-5 text-sm font-medium text-primary-700 transition hover:bg-primary-50"
          >
            <Pencil size={15} aria-hidden /> Sửa hồ sơ
          </button>
        )}
      </div>

      <div className="mt-6 space-y-6">
        {load.status === "loading" ? (
          <div
            className="space-y-3"
            aria-busy="true"
            aria-label="Đang tải hồ sơ"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-3xl bg-primary-50/60"
              />
            ))}
          </div>
        ) : load.status === "error" ? (
          <p
            role="alert"
            className="rounded-3xl bg-red-50 px-6 py-10 text-center text-sm text-red-500"
          >
            {load.message}
          </p>
        ) : company === null ? (
          <>
            <div className="flex items-start gap-4 rounded-3xl bg-gradient-to-br from-primary-600 to-primary-500 p-6 text-white shadow-lg shadow-primary-200">
              <Building2 size={28} className="shrink-0" aria-hidden />
              <div>
                <p className="text-lg font-semibold">Đăng ký nhà tuyển dụng</p>
                <p className="mt-1 text-sm text-white/85">
                  Gửi thông tin công ty, giấy chứng nhận đăng ký kinh doanh và
                  CCCD của người đại diện. Sau khi được duyệt, bạn có thể đăng
                  tin và quản lý ứng viên.
                </p>
              </div>
            </div>
            <CompanyForm
              company={null}
              submitLabel="Gửi hồ sơ đăng ký"
              onSubmit={register}
            />
          </>
        ) : (
          <>
            <StatusBanner company={company} />

            {showForm ? (
              <CompanyForm
                key={company.updatedAt}
                company={company}
                submitLabel={
                  company.status === "REJECTED"
                    ? "Gửi lại hồ sơ"
                    : "Lưu thay đổi"
                }
                notice={
                  company.status === "APPROVED"
                    ? "Đổi tên công ty, mã số thuế, người đại diện, số CCCD hoặc giấy tờ sẽ phải chờ duyệt lại, trong thời gian đó chưa đăng tin được."
                    : undefined
                }
                onSubmit={update}
                onCancel={
                  company.status === "REJECTED"
                    ? undefined
                    : () => setEditing(false)
                }
              />
            ) : (
              <>
                <section className="rounded-3xl border border-line bg-white p-5 md:p-6">
                  <CompanyInfo company={company} />
                </section>
                <section className="rounded-3xl border border-line bg-white p-5 md:p-6">
                  <h2 className="text-lg font-semibold text-heading">
                    Giấy tờ đã gửi
                  </h2>
                  <p className="mt-1 text-xs text-body">
                    Chỉ bạn và quản trị viên duyệt hồ sơ xem được.
                  </p>
                  <div className="mt-4">
                    <CompanyDocuments
                      documents={company.documents}
                      refresh={refreshDocuments}
                      onError={(m) => toast.show(m, "error")}
                    />
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function EmployerPage() {
  return (
    <ToastProvider>
      <Employer />
    </ToastProvider>
  );
}
