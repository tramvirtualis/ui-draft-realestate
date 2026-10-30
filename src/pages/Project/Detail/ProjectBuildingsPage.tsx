import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, ChevronRight, FileSpreadsheet, Layers, MapPin, Search } from "lucide-react";
import ProjectTabs from "../../../components/Project/Detail/ProjectTabs";
import ProjectSubHero from "../../../components/Project/Detail/ProjectSubHero";
import { isHighRise } from "../../../components/Admin/project/general/buildingType";
import SafeImage from "../../../components/common/SafeImage";
import { buildingService } from "../../../services/project/buildingService";
import { projectService } from "../../../services/project/projectService";
import { salesSheetService } from "../../../services/project/salesSheetService";
import type { BuildingDto } from "../../../types/project/building.types";
import { parseProjectId } from "../../../utils/slug";

// hasSheet: tòa đã có bảng hàng; sheetPins: số căn đã gắn trên bảng hàng của tòa
type BuildingRow = BuildingDto & { hasSheet: boolean; sheetPins: number };

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; projectName: string; highRise: boolean; buildings: BuildingRow[] };

// Nhãn tòa đã / chưa có bảng hàng
// onImage: nằm đè trên ảnh nên dùng nền trắng đặc cho dễ đọc
function SheetBadge({ hasSheet, onImage = false }: { hasSheet: boolean; onImage?: boolean }) {
  const tone = onImage
    ? `absolute right-3 top-3 bg-white/90 shadow-sm backdrop-blur ${hasSheet ? "text-success" : "text-muted"}`
    : hasSheet ? "bg-success/10 text-success" : "bg-primary-50 text-muted";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone}`}>
      {hasSheet ? "Đã có bảng hàng" : "Chưa có bảng hàng"}
    </span>
  );
}

// Tòa nhà của dự án cao tầng: danh sách theo phân khu, mỗi tòa mở bảng hàng của tòa
export default function ProjectBuildingsPage() {
  const { id } = useParams();
  const projectId = parseProjectId(id);
  const base = `/projects/${id}`;
  const [state, setState] = useState<State>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (projectId === undefined) return;
    let cancelled = false;
    Promise.all([
      projectService.getProject(projectId),
      buildingService.list(projectId),
      salesSheetService.getListByProject(projectId).catch(() => []),
    ])
      .then(([project, buildings, sheets]) => {
        if (cancelled) return;
        const sheetOf = new Map(sheets.flatMap((s) => (s.buildingId != null ? [[s.buildingId, s] as const] : [])));
        setState({
          status: "ready",
          projectName: project.name,
          highRise: isHighRise(project.buildingType),
          buildings: buildings.map((b) => ({ ...b, hasSheet: sheetOf.has(b.id), sheetPins: sheetOf.get(b.id)?.pinCount ?? 0 })),
        });
      })
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [projectId, reload]);

  const buildings = useMemo(() => (state.status === "ready" ? state.buildings : []), [state]);

  // Lọc theo tên tòa / phân khu rồi gom theo phân khu
  const groups = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const map = new Map<string, BuildingRow[]>();
    buildings
      .filter((b) => !k || b.name.toLowerCase().includes(k) || b.zoneName.toLowerCase().includes(k))
      .forEach((b) => map.set(b.zoneName, [...(map.get(b.zoneName) ?? []), b]));
    return [...map.entries()].map(([zone, list]) => ({
      zone,
      list: list.sort((a, b) => a.name.localeCompare(b.name, "vi", { numeric: true })),
    }));
  }, [buildings, keyword]);

  if (state.status === "loading") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div className="animate-pulse px-4 py-10 md:px-8" aria-busy="true" aria-label="Đang tải tòa nhà">
          <div className="h-40 rounded-3xl bg-primary-100" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((n) => <div key={n} className="h-44 rounded-3xl bg-primary-50" />)}
          </div>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div className="container mx-auto px-4 py-24 text-center lg:px-8" role="alert">
          <p className="text-xl font-semibold text-heading">Không tải được danh sách tòa nhà</p>
          <p className="mt-2 text-sm text-body">Vui lòng thử lại sau ít phút.</p>
          <button
            onClick={() => {
              setState({ status: "loading" });
              setReload((n) => n + 1);
            }}
            className="mt-6 rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const { projectName, highRise } = state;
  const withSheet = buildings.filter((b) => b.hasSheet).length;

  return (
    <div className="overflow-x-clip bg-page">
      <ProjectTabs highRise={highRise} />

      <ProjectSubHero
        base={base}
        projectName={projectName}
        title="Tòa nhà"
        desc={`Danh sách các tòa nhà của ${projectName} theo từng phân khu. Chọn một tòa để xem bảng hàng chi tiết.`}
        statLabel="Tòa đã có bảng hàng"
        statValue={`${withSheet}/${buildings.length} tòa`}
      />

      <section className="bg-page py-12">
        <div className="container mx-auto px-4 lg:px-8">
          {!highRise ? (
            <p className="rounded-[1.75rem] border border-dashed border-primary-200 bg-white/60 px-6 py-16 text-center text-body">
              Dự án {projectName} là dự án thấp tầng nên không chia theo tòa nhà.
            </p>
          ) : buildings.length === 0 ? (
            <p className="rounded-[1.75rem] border border-dashed border-primary-200 bg-white/60 px-6 py-16 text-center text-body">
              Dự án {projectName} chưa cập nhật tòa nhà nào.
            </p>
          ) : (
            <>
              <label className="relative block max-w-md">
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm theo tên tòa hoặc phân khu"
                  aria-label="Tìm tòa nhà"
                  className="w-full rounded-full border border-line bg-white py-3 pl-11 pr-4 text-sm text-heading outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </label>

              {groups.length === 0 ? (
                <div className="mt-8 rounded-[1.75rem] border border-dashed border-primary-200 bg-white/60 px-6 py-16 text-center">
                  <p className="font-semibold text-heading">Không có tòa nhà phù hợp</p>
                  <button onClick={() => setKeyword("")} className="btn-gloss mt-4 rounded-full px-5 py-2.5 text-sm font-medium text-white active:scale-95">
                    Xóa tìm kiếm
                  </button>
                </div>
              ) : (
                groups.map(({ zone, list }) => (
                  <div key={zone} className="mt-10">
                    <h2 className="flex items-center gap-2 font-heading text-lg font-extrabold uppercase tracking-tight text-heading">
                      <MapPin size={18} className="text-primary-600" aria-hidden /> Phân khu {zone}
                      <span className="font-sans text-sm font-normal normal-case text-muted">({list.length} tòa)</span>
                    </h2>
                    <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {list.map((b) => (
                        <li key={b.id}>
                          <Link
                            to={`${base}/sales-sheets?building=${b.id}`}
                            className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/80 shadow-[0_24px_50px_-30px_rgba(10,15,26,0.45)] backdrop-blur transition hover:-translate-y-0.5 hover:border-primary-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                          >
                            {b.imageUrl ? (
                              // Có ảnh: ảnh bìa trên cùng, nhãn bảng hàng đè góc ảnh
                              <div className="relative aspect-[16/10] overflow-hidden bg-primary-50">
                                <SafeImage
                                  src={b.imageUrl}
                                  alt={`Ảnh tòa ${b.name}`}
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                                <SheetBadge hasSheet={b.hasSheet} onImage />
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-3 px-5 pt-5">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
                                  <Building2 size={22} aria-hidden />
                                </span>
                                <SheetBadge hasSheet={b.hasSheet} />
                              </div>
                            )}
                            <div className="flex flex-1 flex-col px-5 pb-5">
                            <h3 className="heading-display mt-4 text-lg text-heading">Tòa {b.name}</h3>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-body">
                              <span className="flex items-center gap-1.5"><Layers size={14} aria-hidden /> {b.floors} tầng</span>
                              {b.hasSheet && b.sheetPins > 0 && (
                                <span className="flex items-center gap-1.5"><FileSpreadsheet size={14} aria-hidden /> {b.sheetPins} căn trên bảng hàng</span>
                              )}
                            </div>
                            <span className="mt-auto flex items-center gap-1 pt-5 text-sm font-semibold text-primary-600 group-hover:text-primary-700">
                              Xem bảng hàng <ChevronRight size={15} aria-hidden className="transition group-hover:translate-x-0.5" />
                            </span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
