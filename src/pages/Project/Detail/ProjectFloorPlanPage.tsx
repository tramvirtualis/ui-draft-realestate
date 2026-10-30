import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProjectTabs from "../../../components/Project/Detail/ProjectTabs";
import BookingLockModal from "../../../components/Project/Detail/BookingLockModal";
import UnitDetailModal from "../../../components/Project/Detail/inventory/UnitDetailModal";
import { canBook, toBookingUnit } from "../../../components/Project/Detail/inventory/toBookingUnit";
import ProjectSubHero from "../../../components/Project/Detail/ProjectSubHero";
import FloorPlanBoard from "../../../components/Project/Detail/floorPlan/FloorPlanBoard";
import SelectedUnitCard from "../../../components/Project/Detail/floorPlan/SelectedUnitCard";
import FeaturedUnits from "../../../components/Project/Detail/floorPlan/FeaturedUnits";
import { usePlanSize } from "../../../components/Project/Detail/floorPlan/planCoords";
import { useProjectUnits } from "../../../hooks/project/useProjectUnits";
import { floorPlanService } from "../../../services/project/floorPlanService";
import { projectService } from "../../../services/project/projectService";
import { isHighRise } from "../../../components/Admin/project/general/buildingType";
import { parseProjectId } from "../../../utils/slug";
import type { FloorPlanDto } from "../../../types/project/project.types";
import type { PinUnit } from "../../../components/Project/Detail/floorPlan/FloorPlanBoard";

// highRise: cao tầng ghim tòa nhà, bấm tòa mở bảng hàng của tòa
type PlanState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; plan: FloorPlanDto | null; highRise: boolean };

export default function ProjectFloorPlanPage() {
  const { id } = useParams();
  const projectId = parseProjectId(id);
  const base = `/projects/${id}`;
  const [reloadKey, setReloadKey] = useState(0); // tải lại quỹ căn sau khi giữ chỗ
  const state = useProjectUnits(projectId, reloadKey);
  const [planState, setPlanState] = useState<PlanState>({ status: "loading" });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [booking, setBooking] = useState(false);
  const [detail, setDetail] = useState(false); // popup chi tiết căn đang chọn
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId === undefined) return;
    let cancelled = false;
    // Không đọc được loại hình dự án thì hiển thị như thấp tầng
    Promise.all([floorPlanService.get(projectId), projectService.getProject(projectId).catch(() => null)])
      .then(([plan, project]) => !cancelled && setPlanState({ status: "ready", plan, highRise: isHighRise(project?.buildingType) }))
      .catch(() => !cancelled && setPlanState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const units = useMemo(() => (state.status === "ready" ? state.data.units : []), [state]);
  const plan = planState.status === "ready" ? planState.plan : null;
  const highRise = planState.status === "ready" && planState.highRise;
  const size = usePlanSize(plan);

  // Cao tầng: mỗi ghim là một tòa nhà, chữ trên ghim là tên tòa
  const buildingPins = useMemo((): PinUnit[] => {
    if (!plan || !highRise) return [];
    return plan.pins.flatMap((p) =>
      p.buildingId != null
        ? [{
            id: p.buildingId,
            code: p.buildingName ?? "",
            label: p.buildingName ?? "Tòa",
            title: `Tòa ${p.buildingName ?? ""} · Bấm để xem bảng hàng`,
            fundType: p.fundType,
            x: p.x,
            y: p.y,
          }]
        : [],
    );
  }, [plan, highRise]);

  // Chỉ hiện các căn đã được admin gán vị trí trên mặt bằng
  const pins = useMemo(() => {
    if (!plan || highRise) return [];
    const byId = new Map(units.map((u) => [u.id, u]));
    return plan.pins.flatMap((p) => {
      const u = p.propertyId != null ? byId.get(p.propertyId) : undefined;
      return u
        ? [{
            id: u.id,
            code: u.code,
            // Ghim chỉ hiển thị giá (tỷ VNĐ)
            label: u.priceBillion ? u.priceBillion.toFixed(1).replace(".", ",") : "LH",
            fundType: p.fundType,
            status: u.status,
            x: p.x,
            y: p.y,
          }]
        : [];
    });
  }, [plan, units, highRise]);

  const featured = useMemo(
    () => [...units].sort((a, b) => Number(b.status === "available") - Number(a.status === "available")).slice(0, 3),
    [units],
  );

  if (state.status === "loading" || planState.status === "loading") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div className="animate-pulse px-4 py-10 md:px-8" aria-busy="true">
          <div className="h-40 rounded-3xl bg-primary-100" />
          <div className="mt-6 h-[480px] rounded-3xl bg-primary-50" />
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="overflow-x-clip bg-page">
        <ProjectTabs />
        <div className="px-4 py-24 text-center" role="alert">
          <p className="text-xl font-semibold text-heading">{state.message}</p>
          <Link to="/projects" className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700">Về danh sách dự án</Link>
        </div>
      </div>
    );
  }

  const selected = units.find((u) => u.id === selectedId) ?? null;
  const available = units.filter((u) => u.status === "available").length;

  // Bấm một căn trên mặt bằng: chọn căn đó và mở chi tiết căn; từ đó khách bấm Booking Lock để giữ chỗ
  const pick = (unitId: number) => {
    setSelectedId(unitId);
    setDetail(true);
  };

  // Bấm một tòa trên mặt bằng cao tầng: mở bảng hàng của đúng tòa đó (tòa chưa có bảng hàng thì vùng bảng hàng để trống)
  const openBuilding = (buildingId: number) => navigate(`${base}/sales-sheets?building=${buildingId}`);

  return (
    <div className="overflow-x-clip bg-page">
      <ProjectTabs highRise={planState.status === "ready" ? highRise : undefined} />
      {detail && selected && (
        <UnitDetailModal
          projectId={projectId ?? null}
          key={selected.id}
          unit={selected}
          onClose={() => setDetail(false)}
          bookingEnabled={state.data.project.bookingEnabled}
          onBook={() => {
            if (!canBook(selected) || !state.data.project.bookingEnabled) return;
            setDetail(false);
            setBooking(true);
          }}
        />
      )}
      {booking && selected && (
        <BookingLockModal projectId={projectId ?? null} key={selected.id} propertyId={selected.id} unit={toBookingUnit(selected)} onClose={() => setBooking(false)} onBooked={() => setReloadKey((k) => k + 1)} onConflict={() => setReloadKey((k) => k + 1)} />
      )}

      <ProjectSubHero
        base={base}
        projectName={state.data.project.name}
        title={highRise ? "Mặt bằng" : "Mặt bằng quỹ căn"}
        desc={
          highRise
            ? `Xem vị trí từng tòa nhà của ${state.data.project.name}. Bấm vào một tòa để mở bảng hàng của tòa đó.`
            : `Chọn đúng phân khu, đúng tầng và đúng tầm nhìn. Dữ liệu sản phẩm được lấy từ giỏ hàng của ${state.data.project.name}.`
        }
        statLabel={highRise ? "Tòa nhà trên mặt bằng" : "Quỹ căn khả dụng"}
        statValue={highRise ? `${buildingPins.length} tòa` : `${available} căn`}
      />

      <section className="bg-page py-12">
        <div className={`container mx-auto grid gap-5 px-4 lg:px-8 ${highRise ? "" : "lg:grid-cols-[1fr_380px]"}`}>
          {plan && size && size !== "error" ? (
            <FloorPlanBoard
              imageUrl={plan.imageUrl}
              width={size.width}
              height={size.height}
              units={highRise ? buildingPins : pins}
              selected={highRise ? null : selectedId}
              onSelect={highRise ? openBuilding : pick}
              hint={highRise ? "Bấm vào tòa nhà để xem bảng hàng" : undefined}
              pinScale={plan.pinScale}
              pdfUrl={plan.pdfUrl}
              pdfPage={plan.pdfPage}
              pdfMode={size.mode}
              pdfDensity={size.density}
              pdfTiles={plan.tileBaseUrl && plan.tileLevels != null ? { baseUrl: plan.tileBaseUrl, levels: plan.tileLevels } : undefined}
            />
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-[1.75rem] border border-dashed border-primary-200 bg-white/70 px-6 text-center text-sm text-body">
              {!plan || planState.status === "error"
                ? highRise ? "Dự án chưa cập nhật mặt bằng." : "Dự án chưa cập nhật mặt bằng quỹ căn."
                : size === "error"
                  ? "Không tải được mặt bằng. Vui lòng thử lại sau."
                  : "Đang tải mặt bằng..."}
            </div>
          )}
          {!highRise && (
            <SelectedUnitCard
              unit={selected}
              setBooking={setBooking}
              bookingEnabled={state.data.project.bookingEnabled}
              onDetail={() => setDetail(true)}
              emptyText={pins.length ? "Bấm vào một căn trên mặt bằng để xem thông tin." : "Dự án chưa có căn nào để hiển thị."}
            />
          )}
        </div>
      </section>

      {!highRise && <FeaturedUnits featured={featured} base={base} />}
    </div>
  );
}
