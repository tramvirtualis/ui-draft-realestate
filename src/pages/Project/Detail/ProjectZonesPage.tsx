import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ProjectTabs from "../../../components/Project/Detail/ProjectTabs";
import ZonesHero from "../../../components/Project/Detail/zones/ZonesHero";
import ZonesToolbar, { type ZoneSort } from "../../../components/Project/Detail/zones/ZonesToolbar";
import ZoneStage from "../../../components/Project/Detail/zones/ZoneStage";
import ZoneGrid from "../../../components/Project/Detail/zones/ZoneGrid";
import { zoneService } from "../../../services/project/zoneService";
import type { ProjectZones, Zone } from "../../../types/project/zone.types";
import { parseProjectId } from "../../../utils/slug";

const NO_ZONES: Zone[] = [];

type State = { status: "loading" } | { status: "error" } | { status: "ready"; data: ProjectZones };

export default function ProjectZonesPage() {
  const { id } = useParams();
  const base = `/projects/${id}`;
  const [state, setState] = useState<State>({ status: "loading" });
  const [reload, setReload] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<ZoneSort>("default");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const content = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    zoneService
      .getProjectZones(parseProjectId(id) ?? 0)
      .then((data) => !cancelled && setState({ status: "ready", data }))
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [id, reload]);

  const zones = useMemo(() => (state.status === "ready" ? state.data.zones : NO_ZONES), [state]);
  const statuses = useMemo(() => [...new Set(zones.map((z) => z.status).filter((s): s is string => !!s))], [zones]);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const list = zones.filter((z) => (!k || z.name.toLowerCase().includes(k)) && (!status || z.status === status));
    return sort === "name" ? [...list].sort((a, b) => a.name.localeCompare(b.name, "vi")) : list;
  }, [zones, keyword, status, sort]);

  if (state.status === "loading") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div className="animate-pulse" aria-busy="true" aria-label="Đang tải phân khu">
          <div className="h-105 bg-primary-100" />
          <div className="container mx-auto grid gap-4 px-4 py-12 md:grid-cols-3 lg:px-8">
            {[0, 1, 2].map((n) => <div key={n} className="h-60 rounded-3xl bg-primary-50" />)}
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
          <p className="text-xl font-semibold text-heading">Không tải được danh sách phân khu</p>
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

  const { project } = state.data;
  // Phân khu đang chọn phải nằm trong danh sách đã lọc, nếu không thì lấy phân khu đầu tiên
  const selectedIndex = Math.max(0, filtered.findIndex((z) => z.id === selectedId));
  const selected = filtered[selectedIndex];

  const select = (zoneId: number) => {
    setSelectedId(zoneId);
    stage.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const step = (dir: 1 | -1) => setSelectedId(filtered[(selectedIndex + dir + filtered.length) % filtered.length].id);
  const clear = () => {
    setKeyword("");
    setStatus("");
  };

  return (
    <div className="overflow-x-clip bg-page">
      <ProjectTabs />
      <ZonesHero base={base} data={state.data} onJump={() => content.current?.scrollIntoView({ behavior: "smooth", block: "start" })} />

      <section ref={content} className="scroll-mt-32 py-14 md:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          {zones.length === 0 ? (
            <p className="rounded-[1.75rem] border border-dashed border-primary-200 bg-white/60 px-6 py-16 text-center text-body">
              Dự án {project.name} chưa có phân khu nào.
            </p>
          ) : (
            <>
              <ZonesToolbar
                keyword={keyword}
                onKeyword={setKeyword}
                statuses={statuses}
                status={status}
                onStatus={setStatus}
                sort={sort}
                onSort={setSort}
                total={zones.length}
                shown={filtered.length}
                onClear={clear}
              />

              {filtered.length === 0 ? (
                <div className="mt-10 rounded-[1.75rem] border border-dashed border-primary-200 bg-white/60 px-6 py-16 text-center">
                  <p className="font-semibold text-heading">Không có phân khu phù hợp</p>
                  <button onClick={clear} className="mt-4 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">
                    Xóa bộ lọc
                  </button>
                </div>
              ) : (
                <>
                  <div ref={stage} className="mt-10 scroll-mt-36">
                    <ZoneStage base={base} project={project} zone={selected} index={selectedIndex} total={filtered.length} onStep={step} />
                  </div>

                  <div className="mb-6 mt-20 flex items-end justify-between">
                    <h2 className="text-2xl font-bold text-heading md:text-3xl">Tất cả phân khu</h2>
                  </div>
                  {/* key theo bộ lọc để lưới chạy lại hiệu ứng khi danh sách đổi */}
                  <ZoneGrid key={`${keyword}|${status}|${sort}`} zones={filtered} selectedId={selected.id} onSelect={select} />
                </>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
