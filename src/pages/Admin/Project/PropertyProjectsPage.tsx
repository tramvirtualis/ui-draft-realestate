import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useRememberedProject } from "../../../hooks/project/useSelectedProject";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import SafeImage from "../../../components/common/SafeImage";
import { adminProjectService } from "../../../services/project/adminProjectService";
import type { AdminProject } from "../../../types/project/adminProject.types";
import TableSkeleton from "../../../components/common/TableSkeleton";

type Load = { status: "loading" } | { status: "error" } | { status: "ready"; projects: AdminProject[] };

const COLUMNS = ["Hình ảnh", "Tên dự án", "Chủ đầu tư", "Địa điểm", "Loại hình", "Thao tác"];
const link = "whitespace-nowrap text-sm font-semibold text-primary-600 transition hover:text-primary-700 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600";

// Bước 1 của Quỹ căn: chọn dự án rồi mới xem/chỉnh sửa danh sách căn của dự án đó
export default function PropertyProjectsPage() {
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const remembered = useRememberedProject();

  useEffect(() => {
    let cancelled = false;
    adminProjectService
      .list()
      .then((projects) => !cancelled && setLoad({ status: "ready", projects }))
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [reload]);

  // Có dự án thì vào thẳng quỹ căn của dự án đang chọn (đã có thanh quản lý + combo chọn dự án)
  if (load.status === "ready" && load.projects.length > 0) {
    const target = load.projects.find((p) => p.id === remembered) ?? load.projects[0];
    return <Navigate to={`/admin/properties/${target.id}`} replace />;
  }

  return (
    <div className="animate-page-in">
      <AdminPageHeader
        soft
        breadcrumb={[{ label: "Quản lý quỹ căn" }, { label: "Dự án" }]}
        title="Danh sách dự án"
        desc="Chọn dự án để xem và quản lý danh sách căn thuộc dự án."
      />

      <div className="px-4 pb-10 md:px-8">
        <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {load.status === "loading" ? (
            <TableSkeleton rows={5} label="Đang tải dự án" />
          ) : load.status === "error" ? (
            <div role="alert" className="px-6 py-12 text-center">
              <p className="font-semibold text-heading">Không tải được danh sách dự án</p>
              <button onClick={() => { setLoad({ status: "loading" }); setReload((n) => n + 1); }} className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">Thử lại</button>
            </div>
          ) : load.projects.length === 0 ? (
            <p className="px-6 py-14 text-center text-body">Chưa có dự án nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="bg-primary-50/60 text-[11px] uppercase text-heading">
                    {COLUMNS.map((c) => (
                      <th key={c} scope="col" className={`px-4 py-3.5 font-semibold ${c === "Thao tác" ? "text-right" : ""}`}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {load.projects.map((p) => {
                    return (
                      <tr key={p.id} className="border-t border-line transition hover:bg-primary-50/60">
                        <td className="px-4 py-2.5">
                          <SafeImage src={p.overviewImage ?? undefined} alt="" className="h-10 w-14 rounded-md object-cover" />
                        </td>
                        <td className="max-w-[220px] px-4 py-3 font-semibold text-footer">{p.name}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-heading">{p.investor}</td>
                        <td className="max-w-[220px] truncate px-4 py-3 text-heading" title={p.location}>{p.location}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-heading">{p.buildingType || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-5">
                            <Link to={`/admin/properties/${p.id}/map`} className={link}>Bản đồ tương tác</Link>
                            <Link to={`/admin/properties/${p.id}`} className={link}>Xem quỹ căn</Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
