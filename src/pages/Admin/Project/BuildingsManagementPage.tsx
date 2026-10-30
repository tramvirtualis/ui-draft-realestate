import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building, Home, Layers, List, Pencil, Plus, Trash2 } from "lucide-react";
import AdminPageHeader from "../../../components/Admin/AdminPageHeader";
import ConfirmDialog from "../../../components/Admin/ConfirmDialog";
import ProjectManageBar from "../../../components/Admin/project/manage/ProjectManageBar";
import BuildingFormModal from "../../../components/Admin/project/buildings/BuildingFormModal";
import PropertyFormModal from "../../../components/Admin/project/properties/PropertyFormModal";
import SectionNotice from "../../../components/Admin/project/general/SectionNotice";
import SafeImage from "../../../components/common/SafeImage";
import { isHighRise } from "../../../components/Admin/project/general/buildingType";
import { useToast } from "../../../components/common/toastContext";
import { getErrorMessage } from "../../../api";
import { adminProjectService } from "../../../services/project/adminProjectService";
import { buildingService } from "../../../services/project/buildingService";
import { propertyService } from "../../../services/project/propertyService";
import { zoneApiService } from "../../../services/project/projectService";
import { useSelectedProject } from "../../../hooks/project/useSelectedProject";
import type { AdminProject } from "../../../types/project/adminProject.types";
import type { BuildingDto, BuildingInput } from "../../../types/project/building.types";
import type { ZoneDto } from "../../../types/project/project.types";
import type { Property, PropertyCatalog, PropertyImageChanges, PropertyInput } from "../../../types/project/property.types";

type Boot = { status: "loading" } | { status: "error" } | { status: "ready"; projects: AdminProject[] };
// null = đang tải; units + catalog để đếm căn của từng tòa và mở form thêm căn
type Data = { zones: ZoneDto[]; buildings: BuildingDto[]; units: Property[]; catalog: PropertyCatalog } | null;
type FormState = { building: BuildingDto | null; zoneId: number | null } | null;

// Tòa nhà của dự án cao tầng, xếp theo phân khu (phân khu → tòa nhà → căn): thêm, sửa tên / số tầng, xóa tòa trống;
// mỗi tòa hiện số căn, thêm căn ngay vào tòa và mở quỹ căn lọc theo tòa
export default function BuildingsManagementPage() {
  const toast = useToast();
  const [boot, setBoot] = useState<Boot>({ status: "loading" });
  const [data, setData] = useState<Data>(null);
  const [form, setForm] = useState<FormState>(null);
  const [deleting, setDeleting] = useState<BuildingDto | null>(null);
  const [addingUnit, setAddingUnit] = useState<BuildingDto | null>(null); // tòa đang thêm căn
  const [submitting, setSubmitting] = useState(false);
  const [reload, setReload] = useState(0);

  const projects = boot.status === "ready" ? boot.projects : [];
  const { projectId } = useSelectedProject(projects);
  const project = projects.find((p) => p.id === projectId);
  const highRise = isHighRise(project?.buildingType);

  useEffect(() => {
    let cancelled = false;
    adminProjectService
      .list()
      .then((list) => !cancelled && setBoot({ status: "ready", projects: list }))
      .catch(() => !cancelled && setBoot({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (projectId === null || !highRise) return;
    let cancelled = false;
    setData(null); // đổi dự án: hiện khung chờ thay vì dữ liệu của dự án trước
    Promise.all([zoneApiService.getByProject(projectId), buildingService.list(projectId), propertyService.list(), propertyService.catalog()])
      .then(([zones, buildings, units, catalog]) => !cancelled && setData({ zones, buildings, units, catalog }))
      .catch(() => !cancelled && setData({ zones: [], buildings: [], units: [], catalog: { projects: [], zones: [], buildings: [] } }));
    return () => {
      cancelled = true;
    };
  }, [projectId, highRise, reload]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);

  const save = async (input: BuildingInput) => {
    setSubmitting(true);
    try {
      if (form?.building) await buildingService.update(form.building.id, input);
      else await buildingService.create(input);
      toast.show(form?.building ? "Đã lưu thay đổi" : "Đã thêm tòa nhà");
      setForm(null);
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const saveUnit = async (input: PropertyInput, images: PropertyImageChanges) => {
    setSubmitting(true);
    try {
      await propertyService.create(input, images);
      toast.show(`Đã thêm căn vào tòa ${addingUnit?.name ?? ""}`);
      setAddingUnit(null);
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await buildingService.remove(deleting.id);
      toast.show(`Đã xóa tòa ${deleting.name}`);
      refresh();
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    }
    setDeleting(null);
  };

  const header = (
    <AdminPageHeader
      soft
      breadcrumb={[{ label: "Dự án", to: "/admin/projects" }, { label: "Quản lý tòa nhà" }]}
      title="Quản lý tòa nhà"
      desc="Các tòa nhà của dự án cao tầng theo từng phân khu. Căn của dự án gắn vào tòa và có tầng không vượt số tầng của tòa."
      action={
        highRise && data && data.zones.length > 0 ? (
          <button
            onClick={() => setForm({ building: null, zoneId: null })}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
          >
            <Plus size={16} /> Thêm tòa nhà
          </button>
        ) : undefined
      }
    />
  );

  if (boot.status === "loading") {
    return (
      <div className="animate-page-in">
        {header}
        <div className="animate-pulse px-4 pb-10 md:px-8" aria-busy="true"><div className="h-60 rounded-2xl bg-primary-50" /></div>
      </div>
    );
  }

  if (boot.status === "error" || projectId === null) {
    return (
      <div className="animate-page-in">
        {header}
        <div role="alert" className="mx-4 rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-16 text-center md:mx-8">
          <p className="font-semibold text-heading">{boot.status === "error" ? "Không tải được danh sách dự án" : "Chưa có dự án nào"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-page-in">
      {header}
      <ProjectManageBar projectId={projectId} />

      <div className="px-4 pb-12 md:px-8">
        {!highRise ? (
          <SectionNotice
            icon={Home}
            title={`${project?.name ?? "Dự án"} là dự án thấp tầng`}
            desc="Tòa nhà chỉ có ở dự án cao tầng. Căn của dự án thấp tầng thuộc trực tiếp phân khu."
          />
        ) : data === null ? (
          <div className="space-y-3" aria-busy="true">
            {[0, 1].map((n) => <div key={n} className="h-36 animate-pulse rounded-2xl bg-primary-50" />)}
          </div>
        ) : data.zones.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 px-6 py-14 text-center">
            <p className="font-semibold text-heading">Dự án chưa có phân khu</p>
            <p className="mt-1 text-sm text-body">Tòa nhà nằm trong phân khu, hãy thêm phân khu trước.</p>
            <Link to={`/admin/projects/${projectId}/edit`} className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700">
              Thêm phân khu
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {data.zones.map((zone) => {
              const buildings = data.buildings.filter((b) => b.zoneId === zone.id);
              return (
                <section key={zone.id} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-bold text-footer">
                      Phân khu {zone.name} <span className="text-sm font-normal text-body">({buildings.length} tòa)</span>
                    </h2>
                    <button
                      onClick={() => setForm({ building: null, zoneId: zone.id })}
                      className="flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-footer transition hover:bg-primary-50"
                    >
                      <Plus size={14} /> Thêm tòa
                    </button>
                  </div>

                  {buildings.length === 0 ? (
                    <p className="mt-4 rounded-xl border border-dashed border-primary-200 bg-primary-50/40 px-4 py-6 text-center text-sm text-body">Phân khu chưa có tòa nhà nào.</p>
                  ) : (
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {buildings.map((b) => {
                        const unitCount = data.units.filter((u) => u.buildingId === b.id).length;
                        return (
                          <li key={b.id} className="rounded-xl border border-line bg-primary-50/30 p-4">
                            <div className="flex items-center gap-3">
                              {b.imageUrl ? (
                                <SafeImage src={b.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover shadow-sm" />
                              ) : (
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm" aria-hidden>
                                  <Building size={20} />
                                </span>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-footer" title={b.name}>{b.name}</p>
                                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-body">
                                  <Layers size={12} aria-hidden /> {b.floors} tầng · {unitCount} căn
                                </p>
                              </div>
                              <button onClick={() => setForm({ building: b, zoneId: b.zoneId })} aria-label={`Sửa tòa ${b.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-body transition hover:text-primary-600">
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => setDeleting(b)} aria-label={`Xóa tòa ${b.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-body transition hover:bg-danger/5 hover:text-danger">
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setAddingUnit(b)}
                                className="flex items-center justify-center gap-1.5 rounded-lg bg-primary-600 py-2 text-xs font-semibold text-white transition hover:bg-primary-700 active:scale-95"
                              >
                                <Plus size={13} /> Thêm căn
                              </button>
                              <Link
                                to={`/admin/properties/${projectId}?building=${b.id}`}
                                className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white py-2 text-xs font-semibold text-footer transition hover:bg-primary-50"
                              >
                                <List size={13} /> Xem căn
                              </Link>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      {form && data && (
        <BuildingFormModal
          building={form.building}
          zones={data.zones}
          defaultZoneId={form.zoneId}
          submitting={submitting}
          onSubmit={save}
          onClose={() => setForm(null)}
        />
      )}
      {addingUnit && data && (
        <PropertyFormModal
          property={null}
          catalog={data.catalog}
          defaultProjectId={projectId}
          defaultZoneId={addingUnit.zoneId}
          defaultBuildingId={addingUnit.id}
          lockProject
          submitting={submitting}
          onSubmit={saveUnit}
          onClose={() => setAddingUnit(null)}
        />
      )}
      {deleting && (() => {
        const unitsInBuilding = data?.units.filter((u) => u.buildingId === deleting.id).length ?? 0;
        return (
          <ConfirmDialog
            title="Xóa tòa nhà?"
            message={
              unitsInBuilding > 0
                ? `Tòa nhà "${deleting.name}" hiện đang có ${unitsInBuilding} căn. Bạn không thể xóa tòa khi còn căn bên trong (hãy chuyển hoặc xóa hết các căn trước).`
                : `Bạn có chắc chắn muốn xóa tòa "${deleting.name}" không? Vị trí của tòa trên mặt bằng cũng sẽ bị gỡ. Hành động này không thể hoàn tác.`
            }
            onConfirm={() => void confirmDelete()}
            onClose={() => setDeleting(null)}
          />
        );
      })()}
    </div>
  );
}
