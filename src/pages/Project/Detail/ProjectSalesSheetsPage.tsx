import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProjectTabs from "../../../components/Project/Detail/ProjectTabs";
import ProjectSubHero from "../../../components/Project/Detail/ProjectSubHero";
import SelectedUnitCard from "../../../components/Project/Detail/floorPlan/SelectedUnitCard";
import FeaturedUnits from "../../../components/Project/Detail/floorPlan/FeaturedUnits";
import { fundColor, fundLabel } from "../../../components/Admin/project/salesSheet/salesSheetPin";
import BuildingSheetSelector, {
  type BuildingSheetItem,
} from "../../../components/Project/Detail/salesSheet/BuildingSheetSelector";
import SalesSheetViewer from "../../../components/Project/Detail/salesSheet/SalesSheetViewer";
import UnitDetailModal from "../../../components/Project/Detail/inventory/UnitDetailModal";
import BookingLockModal from "../../../components/Project/Detail/BookingLockModal";
import { canBook, toBookingUnit } from "../../../components/Project/Detail/inventory/toBookingUnit";
import { useProjectUnits } from "../../../hooks/project/useProjectUnits";
import { salesSheetService } from "../../../services/project/salesSheetService";
import { buildingService } from "../../../services/project/buildingService";
import type {
  SalesSheetDetail,
  SalesSheetSummary,
  SalesSheetPin,
} from "../../../types/project/salesSheet.types";
import { parseProjectId } from "../../../utils/slug";

// Bảng hàng (dự án cao tầng), cùng bố cục với "Mặt bằng quỹ căn" của thấp tầng: đầu trang, thanh chọn tòa + lọc quỹ,
// bảng hàng bên trái và thẻ "Căn đang chọn" bên phải, các căn nổi bật cuối trang
export default function ProjectSalesSheetsPage() {
  const { id } = useParams();
  const projectId = parseProjectId(id);
  const base = `/projects/${id}`;
  // ?building=<id>: mở sẵn tòa vừa bấm trên mặt bằng
  const [searchParams] = useSearchParams();
  const requestedBuildingId = Number(searchParams.get("building")) || null;

  const [reloadKey, setReloadKey] = useState(0);
  const unitsState = useProjectUnits(projectId, reloadKey);

  const [buildingItems, setBuildingItems] = useState<BuildingSheetItem[]>([]);
  const [totalProjectBuildings, setTotalProjectBuildings] = useState<number>(0);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const selectedItem = buildingItems.find((it) => it.id === selectedItemId) ?? null;
  const selectedSheetId = selectedItem?.sheetId ?? null;

  const [activeSheet, setActiveSheet] = useState<SalesSheetDetail | null>(null);
  const [sheetLoading, setSheetLoading] = useState(false);

  // Bộ lọc các quỹ bị tắt hiển thị ghim (mặc định rỗng: tất cả đều hiển thị)
  const [hiddenFunds, setHiddenFunds] = useState<Set<string>>(new Set());

  // Căn hộ đang được chọn trên bản vẽ
  const [selectedPinId, setSelectedPinId] = useState<number | null>(null);

  // Modal chi tiết căn và giữ chỗ
  const [detailUnitId, setDetailUnitId] = useState<number | null>(null);
  const [bookingUnitId, setBookingUnitId] = useState<number | null>(null);

  // 1. Tải danh sách bảng hàng và danh sách tòa nhà của dự án
  // "toà nào có bảng hàng mới hiện"
  useEffect(() => {
    if (projectId === undefined) return;
    let active = true;

    Promise.allSettled([
      salesSheetService.getListByProject(projectId),
      buildingService.list(projectId),
    ]).then(([sheetsRes, buildingsRes]) => {
      if (!active) return;

      const sheetList: SalesSheetSummary[] =
        sheetsRes.status === "fulfilled" ? sheetsRes.value : [];
      const buildingList =
        buildingsRes.status === "fulfilled" ? buildingsRes.value : [];

      setTotalProjectBuildings(buildingList.length);

      const items: BuildingSheetItem[] = [];

      if (buildingList.length > 0) {
        // Mọi tòa của dự án đều hiện, tòa chưa có bảng hàng thì vùng bảng hàng để trống
        buildingList.forEach((b) => {
          const sheet = sheetList.find((s) => s.buildingId === b.id);
          items.push({
            id: b.id,
            sheetId: sheet?.id,
            buildingId: b.id,
            name: b.name,
            code: sheet?.code,
            zoneName: b.zoneName || sheet?.zoneName || undefined,
            pinCount: sheet?.pinCount,
          });
        });
      } else {
        // Dự phòng nếu dự án chưa nạp danh sách tòa nhà
        sheetList.forEach((s) => {
          items.push({
            id: s.id,
            sheetId: s.id,
            buildingId: s.buildingId ?? undefined,
            name:
              s.buildingName ||
              s.name.replace(/^Bảng\s*hàng\s*/i, "").trim() ||
              s.name,
            code: s.code,
            zoneName: s.zoneName ?? undefined,
            pinCount: s.pinCount,
          });
        });
      }

      setBuildingItems(items);

      // Ưu tiên tòa được chỉ định trên URL, không thì chọn tòa đầu tiên có bảng hàng
      setSelectedItemId((prev) => {
        const requested = items.find((it) => requestedBuildingId != null && it.buildingId === requestedBuildingId);
        if (requested) return requested.id;
        if (prev && items.some((it) => it.id === prev)) return prev;
        return (items.find((it) => it.sheetId != null) ?? items[0])?.id ?? null;
      });
    });

    return () => {
      active = false;
    };
  }, [projectId, requestedBuildingId]);

  // 2. Tải chi tiết bảng hàng khi chọn một tòa nhà
  useEffect(() => {
    if (!selectedSheetId) {
      setActiveSheet(null);
      return;
    }

    let active = true;
    setSheetLoading(true);
    setSelectedPinId(null);

    salesSheetService
      .getById(selectedSheetId)
      .then((detail) => {
        if (active) setActiveSheet(detail);
      })
      .catch((err) => {
        console.error("Lỗi khi tải bảng hàng:", err);
        if (active) setActiveSheet(null);
      })
      .finally(() => {
        if (active) setSheetLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedSheetId]);

  // Bật / tắt hiển thị ghim cho từng màu quỹ
  // "mấy cái nút pin kia là bật tắt cái pin cho cái pin màu nào hiện"
  const handleToggleFund = (fundKey: string) => {
    setHiddenFunds((prev) => {
      const next = new Set(prev);
      if (next.has(fundKey)) {
        next.delete(fundKey); // Bật lại
      } else {
        next.add(fundKey); // Tắt đi
      }
      return next;
    });
  };

  // Tính số lượng ghim theo từng loại quỹ trên bảng hàng hiện tại
  const fundCounts = useMemo(() => {
    if (!activeSheet?.pins) return {};
    const counts: Record<string, number> = {};
    activeSheet.pins.forEach((p) => {
      const key = p.fundType ?? "UNCLASSIFIED";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [activeSheet?.pins]);

  // Danh sách toàn bộ căn hộ trong dự án để phục vụ modal chi tiết / giữ chỗ
  const units = useMemo(
    () => (unitsState.status === "ready" ? unitsState.data.units : []),
    [unitsState]
  );
  const detailUnit = useMemo(
    () => (detailUnitId != null ? units.find((u) => u.id === detailUnitId) ?? null : null),
    [units, detailUnitId]
  );
  const bookingUnit = useMemo(
    () => (bookingUnitId != null ? units.find((u) => u.id === bookingUnitId) ?? null : null),
    [units, bookingUnitId]
  );

  // Ghim đang chọn trên bảng hàng và căn tương ứng trong quỹ căn (hiện ở thẻ bên phải)
  const selectedPin = useMemo(
    () => activeSheet?.pins?.find((p) => p.id === selectedPinId) ?? null,
    [activeSheet?.pins, selectedPinId]
  );
  const selectedUnit = useMemo(
    () => (selectedPin ? units.find((u) => u.id === selectedPin.propertyId) ?? null : null),
    [units, selectedPin]
  );
  const featured = useMemo(
    () => [...units].sort((a, b) => Number(b.status === "available") - Number(a.status === "available")).slice(0, 3),
    [units]
  );

  const project = unitsState.status === "ready" ? unitsState.data.project : null;
  const bookingEnabled = project?.bookingEnabled ?? false;
  const available = units.filter((u) => u.status === "available").length;

  // Bấm một căn trên bảng hàng: chọn căn đó và mở chi tiết (như mặt bằng thấp tầng); bấm lại căn đang chọn thì bỏ chọn
  const pickPin = (pin: SalesSheetPin | null) => {
    setSelectedPinId(pin ? pin.id : null);
    if (pin) setDetailUnitId(pin.propertyId);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-page">
      <ProjectTabs highRise={true} />

      {/* Modal chi tiết căn hộ khi bấm xem từ ghim bảng hàng */}
      {detailUnit && (
        <UnitDetailModal
          projectId={projectId ?? null}
          key={detailUnit.id}
          unit={detailUnit}
          onClose={() => setDetailUnitId(null)}
          bookingEnabled={bookingEnabled}
          onBook={() => {
            if (!canBook(detailUnit) || !bookingEnabled) return;
            setDetailUnitId(null);
            setBookingUnitId(detailUnit.id);
          }}
        />
      )}

      {/* Modal giữ chỗ căn hộ */}
      {bookingUnit && (
        <BookingLockModal
          projectId={projectId ?? null}
          key={bookingUnit.id}
          propertyId={bookingUnit.id}
          unit={toBookingUnit(bookingUnit)}
          onClose={() => setBookingUnitId(null)}
          onBooked={() => setReloadKey((k) => k + 1)}
          onConflict={() => setReloadKey((k) => k + 1)}
        />
      )}

      <ProjectSubHero
        base={base}
        projectName={project?.name ?? "Dự án"}
        title="Bảng hàng"
        desc={`Chọn tòa để xem bảng hàng của ${project?.name ?? "dự án"}. Bấm vào một căn trên bảng hàng để xem chi tiết và giữ chỗ.`}
        statLabel="Quỹ căn khả dụng"
        statValue={`${available} căn`}
      />

      <section className="bg-page py-12">
        <div className="container mx-auto space-y-5 px-4 lg:px-8">
          {/* 1. Chọn tòa & bật / tắt hiển thị ghim theo quỹ */}
          <BuildingSheetSelector
            items={buildingItems}
            selectedId={selectedItemId}
            onSelect={setSelectedItemId}
            hiddenFunds={hiddenFunds}
            onToggleFund={handleToggleFund}
            fundCounts={fundCounts}
            totalBuildings={totalProjectBuildings}
          />

          {/* 2. Bảng hàng bên trái, căn đang chọn bên phải */}
          <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
            <SalesSheetViewer
              sheet={activeSheet}
              loading={sheetLoading}
              emptyBuildingName={selectedItem && selectedItem.sheetId == null ? selectedItem.name : undefined}
              hiddenFunds={hiddenFunds}
              selectedPinId={selectedPinId}
              onSelectPin={pickPin}
            />
            <SelectedUnitCard
              unit={selectedUnit}
              bookingEnabled={bookingEnabled}
              setBooking={(open) => {
                if (open && selectedUnit && canBook(selectedUnit) && bookingEnabled) setBookingUnitId(selectedUnit.id);
              }}
              onDetail={selectedUnit ? () => setDetailUnitId(selectedUnit.id) : undefined}
              emptyText="Bấm vào một căn trên bảng hàng để xem thông tin."
              meta={
                selectedPin && (
                  <span className="inline-flex items-center gap-2 text-xs text-body">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: fundColor(selectedPin.fundType) }}
                    >
                      {fundLabel(selectedPin.fundType)}
                    </span>
                    {activeSheet?.buildingName || activeSheet?.name}
                  </span>
                )
              }
            />
          </div>
        </div>
      </section>

      <FeaturedUnits featured={featured} base={base} />
    </div>
  );
}
