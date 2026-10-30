import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import PropertyStats from "../../../components/Admin/project/properties/PropertyStats";
import PropertyFilters from "../../../components/Admin/project/properties/PropertyFilters";
import PropertyTable from "../../../components/Admin/project/properties/PropertyTable";
import PropertyDetailDrawer from "../../../components/Admin/project/properties/PropertyDetailDrawer";
import PropertyFormModal from "../../../components/Admin/project/properties/PropertyFormModal";
import Pagination from "../../../components/common/Pagination";
import { getErrorMessage } from "../../../api";
import { useToast } from "../../../components/common/toastContext";
import { propertyService } from "../../../services/project/propertyService";
import type { Property, PropertyCatalog, PropertyFilter, PropertyImageChanges, PropertyInput, PropertyStatus } from "../../../types/project/property.types";
import ProjectManageBar from "../../../components/Admin/project/manage/ProjectManageBar";
import { rememberSelectedProject } from "../../../hooks/project/useSelectedProject";
import TableSkeleton from "../../../components/common/TableSkeleton";

const PAGE_SIZE = 8;
const EMPTY_FILTER: PropertyFilter = { projectId: null, zoneId: null, buildingId: null, keyword: "", status: "", areaMin: "", areaMax: "", priceMin: "", priceMax: "" };
const BILLION = 1_000_000_000;

type Load = { status: "loading" } | { status: "error" } | { status: "ready"; properties: Property[]; catalog: PropertyCatalog };
type FormState = { property: Property | null } | null;

// Chuỗi rỗng = không giới hạn
const bound = (v: string) => (v.trim() === "" || Number.isNaN(Number(v)) ? null : Number(v));

// Quỹ căn của MỘT dự án (/admin/properties/:id): danh sách, thêm, sửa, đổi trạng thái, xóa
export default function PropertyManagementPage() {
  const { id } = useParams();
  const projectId = Number(id);
  // ?building= : mở từ trang tòa nhà để xem căn của một tòa
  const [params] = useSearchParams();
  const initialBuilding = Number(params.get("building")) || null;
  const toast = useToast();
  const [load, setLoad] = useState<Load>({ status: "loading" });

  // Dự án đang xem quỹ căn trở thành dự án đang chọn của các mục quản lý khác
  useEffect(() => {
    if (Number.isFinite(projectId) && projectId > 0) rememberSelectedProject(projectId);
  }, [projectId]);
  const [reload, setReload] = useState(0);
  const [filter, setFilter] = useState<PropertyFilter>({ ...EMPTY_FILTER, projectId, buildingId: initialBuilding });
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<Property | null>(null);
  const [form, setForm] = useState<FormState>(null);
  const [deleting, setDeleting] = useState<Property | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Đồng bộ bộ lọc và đặt lại trạng thái khi chuyển sang dự án khác
  useEffect(() => {
    setFilter({
      ...EMPTY_FILTER,
      projectId,
      buildingId: initialBuilding,
    });
    setPage(0);
    setDetail(null);
    setForm(null);
  }, [projectId, initialBuilding]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([propertyService.list(), propertyService.catalog()])
      .then(([properties, catalog]) => !cancelled && setLoad({ status: "ready", properties, catalog }))
      .catch(() => !cancelled && setLoad({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [reload, projectId]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);
  const properties = useMemo(() => (load.status === "ready" ? load.properties : []), [load]);
  const catalog = useMemo<PropertyCatalog>(() => (load.status === "ready" ? load.catalog : { projects: [], zones: [], buildings: [] }), [load]);

  // Phạm vi theo dự án/phân khu: dùng cho thẻ thống kê (không bị ảnh hưởng bởi ô tìm kiếm, trạng thái...)
  const scoped = useMemo(() => {
    const projectOf = (zoneId: number) => catalog.zones.find((z) => z.id === zoneId)?.projectId;
    return properties.filter(
      (p) =>
        (filter.projectId === null || projectOf(p.zoneId) === filter.projectId) &&
        (filter.zoneId === null || p.zoneId === filter.zoneId) &&
        (filter.buildingId === null || p.buildingId === filter.buildingId),
    );
  }, [properties, catalog, filter.projectId, filter.zoneId, filter.buildingId]);

  const filtered = useMemo(() => {
    const k = filter.keyword.trim().toLowerCase();
    const aMin = bound(filter.areaMin), aMax = bound(filter.areaMax);
    const pMin = bound(filter.priceMin), pMax = bound(filter.priceMax);
    return scoped.filter(
      (p) =>
        (!k || p.propertyCode.toLowerCase().includes(k)) &&
        (!filter.status || p.status === filter.status) &&
        (aMin === null || p.area >= aMin) &&
        (aMax === null || p.area <= aMax) &&
        (pMin === null || p.price >= pMin * BILLION) &&
        (pMax === null || p.price <= pMax * BILLION),
    );
  }, [scoped, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages - 1);
  const start = current * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  const changeFilter = (next: PropertyFilter) => {
    setFilter(next);
    setPage(0);
  };

  const openEdit = (p: Property) => {
    setDetail(null);
    setForm({ property: p });
  };

  const save = async (input: PropertyInput, images: PropertyImageChanges) => {
    setSubmitting(true);
    try {
      if (form?.property) await propertyService.update(form.property.id, input, images);
      else await propertyService.create(input, images);
      toast.show(form?.property ? "Đã lưu thay đổi" : "Đã thêm căn mới");
      setForm(null);
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const changeStatus = async (p: Property, status: PropertyStatus) => {
    try {
      await propertyService.setStatus(p.id, status);
      toast.show(`Đã đổi trạng thái căn ${p.propertyCode}`);
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await propertyService.remove(deleting.id);
      toast.show(`Đã xóa căn ${deleting.propertyCode}`);
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    }
    setDeleting(null);
  };

  const project = catalog.projects.find((p) => p.id === projectId);
  if (load.status === "ready" && !project) {
    return (
      <div className="px-4 py-24 text-center" role="alert">
        <p className="text-xl font-semibold text-heading">Không tìm thấy dự án</p>
        <Link to="/admin/properties" className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700">Về danh sách dự án</Link>
      </div>
    );
  }

  return (
    <div className="animate-page-in">
      <AdminPageHeader
        soft
        breadcrumb={[{ label: "Dự án", to: "/admin/projects" }, { label: "Quản lý quỹ căn" }]}
        title={project ? `Quỹ căn ${project.name}` : "Quản lý quỹ căn"}
        desc="Theo dõi, quản lý và tra cứu toàn bộ sản phẩm bất động sản thuộc dự án."
        action={
          <button
            onClick={() => setForm({ property: null })}
            disabled={load.status !== "ready"}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
          >
            <Plus size={16} /> Thêm quỹ căn
          </button>
        }
      />

      {/* Thanh quản lý dự án đặt ngay dưới tiêu đề, giống các mục khác */}
      {Number.isFinite(projectId) && <ProjectManageBar projectId={projectId} />}

      <div className="space-y-5 px-4 pb-10 md:px-8">
        <PropertyStats items={scoped} />

        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <PropertyFilters filter={filter} onChange={changeFilter} onClear={() => changeFilter({ ...EMPTY_FILTER, projectId })} lockProject catalog={catalog} shown={filtered.length} total={scoped.length} />

          <div className="mt-5">
            {load.status === "loading" ? (
              <TableSkeleton rows={PAGE_SIZE} label="Đang tải quỹ căn" />
            ) : load.status === "error" ? (
              <div role="alert" className="rounded-2xl border border-dashed border-danger/30 bg-danger/5 px-6 py-12 text-center">
                <p className="font-semibold text-heading">Không tải được quỹ căn</p>
                <button onClick={() => { setLoad({ status: "loading" }); refresh(); }} className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">Thử lại</button>
              </div>
            ) : rows.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-14 text-center text-body">
                Không có căn nào phù hợp với bộ lọc.
              </p>
            ) : (
              <PropertyTable properties={rows} startIndex={start} catalog={catalog} highRise={project?.highRise ?? false} onView={setDetail} onEdit={openEdit} onStatus={changeStatus} onDelete={setDeleting} />
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <p className="text-sm text-body">
              {filtered.length === 0 ? "Hiển thị 0 căn" : `Hiển thị ${start + 1}–${start + rows.length} trong ${filtered.length} căn`}
            </p>
            <Pagination page={current} totalPages={totalPages} onChange={setPage} />
          </div>
        </section>
      </div>

      {detail && <PropertyDetailDrawer property={detail} catalog={catalog} onEdit={openEdit} onClose={() => setDetail(null)} />}
      {form && (
        <PropertyFormModal
          property={form.property}
          catalog={catalog}
          defaultProjectId={projectId}
          lockProject
          defaultZoneId={filter.zoneId ?? catalog.buildings.find((b) => b.id === filter.buildingId)?.zoneId ?? null}
          defaultBuildingId={filter.buildingId}
          submitting={submitting}
          onSubmit={save}
          onClose={() => setForm(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Xóa căn này?"
          message={`Bạn có chắc chắn muốn xóa căn ${deleting.propertyCode} không? Lưu ý: Không thể xóa căn đã có lịch sử đặt chỗ/booking (hãy đổi trạng thái sang "Đã bán" hoặc "Tạm dừng"). Hành động xóa không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
