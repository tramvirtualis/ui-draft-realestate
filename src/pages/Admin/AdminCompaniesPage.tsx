import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Search } from "lucide-react";
import AdminPageHeader from "../../components/Admin/AdminPageHeader";
import AdminStatusTabs from "../../components/Admin/AdminStatusTabs";
import Pagination from "../../components/common/Pagination";
import Avatar from "../../components/common/Avatar";
import { CompanyStatusBadge } from "../../components/Employer/CompanyInfo";
import { adminCompanyService } from "../../services/job/companyService";
import { formatDate, formatTime } from "../../utils/formatDate";
import {
  COMPANY_STATUS_META,
  COMPANY_STATUS_ORDER,
  type Company,
  type CompanyStatus,
} from "../../types/job/company.types";

const PAGE_SIZE = 10;
const TABS = [
  { key: "" as const, label: "Tất cả hồ sơ" },
  ...COMPANY_STATUS_ORDER.map((s) => ({
    key: s,
    label: COMPANY_STATUS_META[s].label,
    dot: COMPANY_STATUS_META[s].dot,
  })),
];
const TH =
  "px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted";

type Load =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: Company[]; total: number; pages: number };

// Duyệt nhà tuyển dụng: GET /api/admin/companies (?status=&keyword=), mặc định mở tab "Chờ duyệt"
export default function AdminCompaniesPage() {
  const navigate = useNavigate();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<CompanyStatus | "">("PENDING");
  const [page, setPage] = useState(0);
  const [counts, setCounts] = useState<
    Partial<Record<CompanyStatus | "", number>>
  >({});

  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(input);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    const keys = ["", ...COMPANY_STATUS_ORDER] as (CompanyStatus | "")[];
    Promise.all(keys.map((s) => adminCompanyService.count(s)))
      .then((n) => setCounts(Object.fromEntries(keys.map((k, i) => [k, n[i]]))))
      .catch(() => undefined);
  }, [reload]);

  useEffect(() => {
    let cancelled = false;
    adminCompanyService
      .search({ keyword, status, page, size: PAGE_SIZE })
      .then(
        (p) =>
          !cancelled &&
          setLoad({
            status: "ready",
            items: p.content,
            total: p.totalElements,
            pages: p.totalPages,
          })
      )
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [keyword, status, page, reload]);

  const refresh = useCallback(() => {
    setLoad({ status: "loading" });
    setReload((n) => n + 1);
  }, []);
  const items = load.status === "ready" ? load.items : [];
  const total = load.status === "ready" ? load.total : 0;
  const pages = load.status === "ready" ? load.pages : 1;
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min(total, (page + 1) * PAGE_SIZE);
  const hasFilter = input.trim() !== "" || status !== "PENDING";

  const changeStatus = (v: CompanyStatus | "") => {
    setLoad({ status: "loading" });
    setStatus(v);
    setPage(0);
  };
  const resetFilters = () => {
    setLoad({ status: "loading" });
    setInput("");
    setKeyword("");
    setStatus("PENDING");
    setPage(0);
  };

  return (
    <>
      <AdminPageHeader
        breadcrumb={[
          { label: "Tổng quan", to: "/admin/dashboard" },
          { label: "Tuyển dụng" },
          { label: "Nhà tuyển dụng" },
        ]}
        title="Nhà tuyển dụng"
        desc="Kiểm tra giấy tờ, duyệt hoặc từ chối hồ sơ công ty đăng ký đăng tin tuyển dụng."
      />

      <div className="-mt-16 space-y-5 px-4 pb-10 md:px-8">
        <AdminStatusTabs
          tabs={TABS}
          value={status}
          counts={counts}
          onChange={changeStatus}
        />

        <section className="rounded-2xl border border-line bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-60 flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tìm theo tên công ty, mã số thuế, email..."
                aria-label="Tìm nhà tuyển dụng"
                className="h-11 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-sm outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
              />
            </div>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasFilter}
              className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-heading transition hover:bg-primary-50 disabled:opacity-50"
            >
              <RotateCcw size={15} /> Đặt lại
            </button>
          </div>

          <div className="border-t border-line">
            {load.status === "loading" ? (
              <div
                className="animate-pulse space-y-3 p-4"
                aria-busy="true"
                aria-label="Đang tải hồ sơ"
              >
                {[0, 1, 2, 3].map((n) => (
                  <div key={n} className="h-14 rounded-xl bg-primary-50" />
                ))}
              </div>
            ) : load.status === "error" ? (
              <div role="alert" className="px-6 py-14 text-center">
                <p className="font-semibold text-heading">
                  Không tải được danh sách nhà tuyển dụng
                </p>
                <button
                  onClick={refresh}
                  className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95"
                >
                  Thử lại
                </button>
              </div>
            ) : items.length === 0 ? (
              <p className="px-6 py-14 text-center text-sm text-body">
                {input.trim()
                  ? "Không có hồ sơ phù hợp với từ khóa."
                  : status === "PENDING"
                  ? "Không có hồ sơ nào đang chờ duyệt."
                  : "Chưa có hồ sơ nào."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="bg-primary-50/60">
                    <tr>
                      <th className={TH}>Công ty</th>
                      <th className={TH}>Người đăng ký</th>
                      <th className={TH}>Ngày gửi</th>
                      <th className={TH}>Trạng thái</th>
                      <th className={TH} />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => navigate(`/admin/companies/${c.id}`)}
                        className="cursor-pointer border-t border-line transition hover:bg-primary-50/40"
                      >
                        <td className="max-w-[320px] px-4 py-3">
                          <p
                            className="truncate font-semibold text-footer"
                            title={c.name}
                          >
                            {c.name}
                          </p>
                          <p className="text-xs text-body">
                            MST {c.taxCode} · {c.email}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={c.owner?.avatarUrl}
                              fullName={
                                c.owner?.fullName || c.representativeName
                              }
                              className="h-8 w-8 shrink-0 text-xs"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-heading">
                                {c.representativeName}
                              </p>
                              <p className="truncate text-xs text-body">
                                {c.owner?.email ?? c.owner?.phone ?? "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-body">
                          {formatTime(c.createdAt)} · {formatDate(c.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <CompanyStatusBadge status={c.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/companies/${c.id}`);
                            }}
                            className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-heading transition hover:bg-primary-50"
                          >
                            {c.status === "PENDING" ? "Duyệt" : "Xem"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {load.status === "ready" && total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs text-body">
              <p>
                Hiển thị {from}–{to} trong {total} hồ sơ
              </p>
              {pages > 1 && (
                <Pagination
                  page={page}
                  totalPages={pages}
                  onChange={(p) => {
                    setLoad({ status: "loading" });
                    setPage(p);
                  }}
                />
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
