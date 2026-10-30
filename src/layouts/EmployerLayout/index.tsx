import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  useOutletContext,
} from "react-router-dom";
import { Briefcase, Building2, FilePlus2, Users } from "lucide-react";
import ToastProvider from "../../components/common/Toast";
import CompanyLogo from "../../components/Employer/CompanyLogo";
import { myCompanyService } from "../../services/job/companyService";
import type { Company } from "../../types/job/company.types";

const MENU = [
  { to: "/employer/jobs", icon: Briefcase, label: "Tin tuyển dụng", end: true },
  { to: "/employer/jobs/new", icon: FilePlus2, label: "Đăng tin mới" },
  { to: "/employer/applications", icon: Users, label: "Ứng viên" },
  { to: "/account/employer", icon: Building2, label: "Hồ sơ công ty" },
];

type Load =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; company: Company | null };

// Trang con lấy công ty đang đăng nhập (đã chắc chắn APPROVED)
export const useEmployerCompany = () => useOutletContext<Company>();

export default function EmployerLayout() {
  const [load, setLoad] = useState<Load>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    myCompanyService
      .get()
      .then((company) => !cancelled && setLoad({ status: "ready", company }))
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, []);

  if (load.status === "loading") {
    return (
      <div
        className="container mx-auto grid gap-8 px-4 py-8 lg:grid-cols-[256px_minmax(0,1fr)] lg:px-8"
        aria-busy="true"
      >
        <div className="h-72 animate-pulse rounded-3xl bg-primary-50/60" />
        <div className="h-96 animate-pulse rounded-3xl bg-primary-50/60" />
      </div>
    );
  }
  if (load.status === "error") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="font-semibold text-heading">
          Không tải được thông tin nhà tuyển dụng
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
        >
          Thử lại
        </button>
      </div>
    );
  }
  if (!load.company || load.company.status !== "APPROVED") {
    return <Navigate to="/account/employer" replace />;
  }
  const company = load.company;

  return (
    <ToastProvider>
      <div className="bg-white py-8">
        <div className="container mx-auto grid items-start gap-8 px-4 lg:grid-cols-[256px_minmax(0,1fr)] lg:px-8">
          <aside className="rounded-3xl border border-line bg-white p-5 shadow-sm lg:sticky lg:top-28">
            <Link
              to="/account/employer"
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 p-3.5 text-white shadow-lg shadow-primary-200"
            >
              <CompanyLogo name={company.name} logoUrl={company.logoUrl} className="h-10 w-10" textSize="text-xs" />
              <div className="min-w-0">
                <p
                  className="truncate text-sm font-semibold"
                  title={company.name}
                >
                  {company.name}
                </p>
                <p className="text-[11px] text-white/80">
                  Nhà tuyển dụng · MST {company.taxCode}
                </p>
              </div>
            </Link>

            <div className="my-5 h-px bg-line" />

            <nav className="space-y-1" aria-label="Điều hướng nhà tuyển dụng">
              {MENU.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm ${
                      isActive
                        ? "bg-primary-50 font-semibold text-primary-700"
                        : "text-heading hover:bg-primary-50/60"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r bg-primary-600" />
                      )}
                      <Icon
                        size={17}
                        className={
                          isActive ? "text-primary-600" : "text-heading"
                        }
                      />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
            <Outlet context={company} />
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
