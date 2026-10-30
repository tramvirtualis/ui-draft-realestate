import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import ProjectFilters from "../../../components/Admin/project/general/ProjectFilters";
import ProjectsTable from "../../../components/Admin/project/general/ProjectsTable";
import Pagination from "../../../components/common/Pagination";
import { getErrorMessage } from "../../../api";
import { useToast } from "../../../components/common/toastContext";
import { adminProjectService } from "../../../services/project/adminProjectService";
import type { AdminProject, AdminProjectFilter } from "../../../types/project/adminProject.types";
import TableSkeleton from "../../../components/common/TableSkeleton";

const PAGE_SIZE = 6;
const EMPTY_FILTER: AdminProjectFilter = { keyword: "", investor: "", location: "", buildingType: "" };
const unique = (list: string[]) => [...new Set(list)].sort((a, b) => a.localeCompare(b, "vi"));

type Load = { status: "loading" } | { status: "error" } | { status: "ready"; projects: AdminProject[] };

export default function AdminProjectsPage() {
  const toast = useToast();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [filter, setFilter] = useState<AdminProjectFilter>(EMPTY_FILTER);
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<AdminProject | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminProjectService
      .list()
      .then((projects) => {
        projects.forEach((p) => {
          if (p.id && p.name) {
            try {
              localStorage.setItem(`project_name_${p.id}`, p.name);
            } catch (_) { }
          }
        });
        if (!cancelled) setLoad({ status: "ready", projects });
      })
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);
  const projects = useMemo(() => (load.status === "ready" ? load.projects : []), [load]);

  const options = useMemo(
    () => ({
      investors: unique(projects.map((p) => p.investor)),
      locations: unique(projects.map((p) => p.location)),
      buildingTypes: unique(projects.map((p) => p.buildingType).filter(Boolean)),
    }),
    [projects],
  );

  const filtered = useMemo(() => {
    const k = filter.keyword.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (!k || p.name.toLowerCase().includes(k)) &&
        (!filter.investor || p.investor === filter.investor) &&
        (!filter.location || p.location === filter.location) &&
        (!filter.buildingType || p.buildingType === filter.buildingType),
    );
  }, [projects, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages - 1);
  const start = current * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  const changeFilter = (next: AdminProjectFilter) => {
    setFilter(next);
    setPage(0);
  };

  // Đổi trạng thái hiển thị ngay (đảo ngược được); không ảnh hưởng booking cũ và trạng thái căn
  const changeStatus = async (p: AdminProject, status: AdminProject["status"]) => {
    try {
      await adminProjectService.setStatus(p.id, status);
      const label = status === "PUBLISHED" ? "hiển thị" : status === "HIDDEN" ? "ẩn khỏi trang khách" : "lưu trữ";
      toast.show(`Đã chuyển dự án ${p.name} sang ${label}`);
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    }
  };

  const toggleBooking = async (p: AdminProject) => {
    try {
      await adminProjectService.setBookingEnabled(p.id, !p.bookingEnabled);
      toast.show(p.bookingEnabled ? `Đã tạm ngừng nhận booking dự án ${p.name}` : `Đã mở nhận booking dự án ${p.name}`);
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await adminProjectService.remove(deleting.id);
      toast.show(`Đã xóa dự án ${deleting.name}`);
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    }
    setDeleting(null);
  };

  return (
    <>
      <AdminPageHeader
        breadcrumb={[{ label: "Tổng quan", to: "/admin/dashboard" }, { label: "Dự án" }, { label: "Quản lý dự án" }]}
        title="Quản lý dự án"
        desc="Tìm kiếm, lọc và theo dõi toàn bộ dự án bất động sản trong hệ thống."
        action={
          <Link to="/admin/projects/new" className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95">
            <Plus size={16} /> Tạo dự án
          </Link>
        }
      />

      <div className="-mt-16 px-4 pb-10 md:px-8">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-heading">Danh sách dự án</h2>
            <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">{projects.length} dự án</span>
          </div>

          <div className="mt-5">
            <ProjectFilters filter={filter} onChange={changeFilter} onClear={() => changeFilter(EMPTY_FILTER)} options={options} />
          </div>

          <div className="mt-5">
            {load.status === "loading" ? (
              <TableSkeleton rows={PAGE_SIZE} label="Đang tải dự án" />
            ) : load.status === "error" ? (
              <div role="alert" className="rounded-2xl border border-dashed border-danger/30 bg-danger/5 px-6 py-12 text-center">
                <p className="font-semibold text-heading">Không tải được danh sách dự án</p>
                <button onClick={() => { setLoad({ status: "loading" }); refresh(); }} className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">Thử lại</button>
              </div>
            ) : rows.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-14 text-center text-body">
                Không có dự án phù hợp với bộ lọc.
              </p>
            ) : (
              <ProjectsTable projects={rows} startIndex={start} onDelete={setDeleting} onStatus={(p, s) => void changeStatus(p, s)} onToggleBooking={(p) => void toggleBooking(p)} />
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <p className="text-sm text-body">
              {filtered.length === 0 ? "Hiển thị 0 dự án" : `Hiển thị ${start + 1}–${start + rows.length} trong ${filtered.length} dự án`}
            </p>
            <Pagination page={current} totalPages={totalPages} onChange={setPage} />
          </div>
        </section>
      </div>

      {deleting && (
        <ConfirmDialog
          title="Xóa dự án?"
          message={`Xóa dự án "${deleting.name}"? Lưu ý: Dự án chỉ xóa được khi hoàn toàn trống (không còn phân khu, căn hộ, bảng hàng, booking, ảnh, mặt bằng...). Nếu dự án đã có dữ liệu hoặc đã hoạt động, vui lòng chọn chuyển trạng thái sang "Ẩn" thay vì xóa.`}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
