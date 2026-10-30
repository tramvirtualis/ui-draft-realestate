import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building, Layers } from "lucide-react";
import { buildingService } from "../../../../services/project/buildingService";
import type { BuildingDto } from "../../../../types/project/building.types";

// Trang chi tiết dự án cao tầng: các tòa nhà theo phân khu (chỉ xem; thêm / sửa ở mục Tòa nhà)
export default function ProjectBuildingsCard({ projectId }: { projectId: number }) {
  const [buildings, setBuildings] = useState<BuildingDto[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    buildingService
      .list(projectId)
      .then((list) => !cancelled && setBuildings(list))
      .catch(() => !cancelled && setBuildings([]));
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-footer">
          Thông tin tòa nhà {buildings && <span className="text-sm font-normal text-body">({buildings.length})</span>}
        </h2>
        <Link to={`/admin/project-buildings?project=${projectId}`} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-footer transition hover:bg-primary-50">
          Quản lý tòa nhà
        </Link>
      </div>

      {buildings === null ? (
        <div className="mt-4 h-20 animate-pulse rounded-xl bg-primary-50" aria-busy="true" />
      ) : buildings.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-primary-200 bg-primary-50/50 px-4 py-8 text-center text-sm text-body">Dự án chưa có tòa nhà nào.</p>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {buildings.map((b) => (
            <li key={b.id} className="flex items-center gap-3 rounded-xl bg-primary-50/50 p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary-600" aria-hidden>
                <Building size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-footer">{b.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-body">
                  <Layers size={11} aria-hidden /> {b.floors} tầng · Phân khu {b.zoneName}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
