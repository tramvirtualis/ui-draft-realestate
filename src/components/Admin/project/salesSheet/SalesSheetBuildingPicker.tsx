import { Building2 } from "lucide-react";
import type { BuildingDto } from "../../../../types/project/building.types";
import type { SalesSheetSummary } from "../../../../types/project/salesSheet.types";

interface Props {
  buildings: BuildingDto[];
  selectedBuildingId: number | null;
  sheets: SalesSheetSummary[];
  onSelectBuilding: (id: number) => void;
}

/**
 * Mục 1: Khung chọn tòa nhà quản lý bảng hàng
 */
export default function SalesSheetBuildingPicker({
  buildings,
  selectedBuildingId,
  sheets,
  onSelectBuilding,
}: Props) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-footer">
            1. Chọn tòa nhà quản lý bảng hàng
          </h2>
          <p className="text-xs text-body">
            Mỗi tòa nhà có một bản vẽ/PDF bảng hàng ma trận các tầng riêng biệt.
          </p>
        </div>
        <span className="text-xs font-semibold text-body">
          {buildings.length} tòa nhà trong dự án
        </span>
      </div>

      {buildings.length === 0 ? (
        <div className="py-8 text-center text-sm text-body">
          Dự án này chưa có tòa nhà nào. Vui lòng vào mục{" "}
          <strong className="text-primary-600">Quản lý tòa nhà</strong> để tạo tòa trước.
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2.5">
          {buildings.map((b) => {
            const isSelected = b.id === selectedBuildingId;
            const sheet = sheets.find((s) => s.buildingId === b.id);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBuilding(b.id)}
                className={`group relative flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                  isSelected
                    ? "border-primary-600 bg-primary-600 text-white shadow-md shadow-primary-200"
                    : "border-line bg-white text-footer hover:border-primary-300 hover:bg-primary-50/50"
                }`}
              >
                <Building2 size={15} />
                <span>{b.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : sheet
                      ? "bg-emerald-100 text-emerald-700 font-bold"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {sheet ? `${sheet.pinCount} căn` : "Chưa có"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
