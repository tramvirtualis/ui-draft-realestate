import { useMemo, useState } from "react";
import { MapPin, Search, Trash2, X } from "lucide-react";
import type { FundType } from "../../../../types/project/project.types";
import {
  FUND_TYPES,
  formatSheetPrice,
  fundColor,
  fundLabel,
  type SheetPin,
} from "./salesSheetPin";

interface Props {
  sheetPins: SheetPin[];
  selectedPinId: number | null;
  onSelectPin: (id: number) => void;
  onOpenEditPin: (pin: SheetPin) => void;
  onChangePinFund: (id: number, fund: FundType | null) => void;
  onRemovePin: (id: number) => void;
  fundCounts: {
    EXCLUSIVE: number;
    HIDDEN_CROSS: number;
    BONUS: number;
    UNCLASSIFIED: number;
  };
}

/**
 * Cột phải: Danh sách các ghim / ô đã đánh dấu trên bảng hàng
 */
export default function SalesSheetPinSidebar({
  sheetPins,
  selectedPinId,
  onSelectPin,
  onOpenEditPin,
  onChangePinFund,
  onRemovePin,
  fundCounts,
}: Props) {
  const [filterFundType, setFilterFundType] = useState<string>("all");
  const [searchPinCode, setSearchPinCode] = useState("");

  const filteredSheetPins = useMemo(() => {
    return sheetPins.filter((p) => {
      if (searchPinCode.trim()) {
        const q = searchPinCode.trim().toLowerCase();
        if (!p.code.toLowerCase().includes(q)) return false;
      }
      if (filterFundType !== "all") {
        if (filterFundType === "UNCLASSIFIED") {
          if (p.fundType !== null) return false;
        } else if (p.fundType !== filterFundType) {
          return false;
        }
      }
      return true;
    });
  }, [sheetPins, searchPinCode, filterFundType]);

  return (
    <div className="flex h-[620px] flex-col rounded-2xl border border-line bg-white shadow-sm lg:col-span-4 xl:col-span-3">
      {/* Header cột phải */}
      <div className="border-b border-line p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-footer">
              Ghim đã đánh dấu
            </h4>
            <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-bold text-primary-700">
              {sheetPins.length} vị trí
            </span>
          </div>
        </div>

        {/* Bộ lọc theo quỹ */}
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setFilterFundType("all")}
            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition ${
              filterFundType === "all"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tất cả ({sheetPins.length})
          </button>
          {FUND_TYPES.map((f) => {
            const count = fundCounts[f.key];
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilterFundType(f.key)}
                className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold transition ${
                  filterFundType === f.key
                    ? "bg-primary-50 ring-1 ring-primary-400 text-footer"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: f.color }}
                />
                <span>{f.label.replace("Quỹ ", "")}</span>
                <span>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Ô tìm kiếm mã căn */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm mã căn trong ghim..."
            value={searchPinCode}
            onChange={(e) => setSearchPinCode(e.target.value)}
            className="w-full rounded-lg border border-line bg-gray-50/60 pl-8 pr-3 py-1.5 text-xs text-footer outline-none focus:border-primary-400 focus:bg-white"
          />
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
          />
          {searchPinCode && (
            <button
              type="button"
              onClick={() => setSearchPinCode("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-footer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Danh sách ghim cuộn được */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sheetPins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-3">
              <MapPin size={24} />
            </div>
            <h5 className="text-xs font-bold text-footer">
              Chưa có ghim nào được đánh dấu
            </h5>
            <p className="mt-1.5 text-[11px] text-muted max-w-[200px]">
              Chọn một loại dấu quỹ ở thanh công cụ phía trên, sau đó nhấp vào bản vẽ để đánh dấu căn hộ!
            </p>
          </div>
        ) : filteredSheetPins.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted">
            Không tìm thấy ghim phù hợp với bộ lọc
          </div>
        ) : (
          filteredSheetPins.map((pin) => {
            const isSelected = selectedPinId === pin.propertyId;
            const color = fundColor(pin.fundType);
            const priceText = formatSheetPrice(pin.price);

            return (
              <div
                key={pin.propertyId}
                onClick={() => {
                  onSelectPin(pin.propertyId);
                  onOpenEditPin(pin);
                }}
                className={`group flex items-center justify-between rounded-xl border p-2.5 text-xs transition cursor-pointer ${
                  isSelected
                    ? "border-primary-500 bg-primary-50/70 shadow-sm ring-1 ring-primary-500/30"
                    : "border-line/70 bg-white hover:border-primary-200 hover:bg-gray-50/60"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Thẻ giá chữ nhật mô phỏng như trên ma trận */}
                    <span
                      className="rounded px-2 py-0.5 text-[11px] font-bold text-white shadow-2xs"
                      style={{ backgroundColor: color }}
                    >
                      {priceText || pin.code}
                    </span>
                    <span className="font-bold text-footer">
                      Căn {pin.code}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted">
                    <span>{fundLabel(pin.fundType)}</span>
                    <span>·</span>
                    <span>Tọa độ: {Math.round(pin.x)}%, {Math.round(pin.y)}%</span>
                  </div>
                </div>

                {/* Đổi nhanh loại quỹ hoặc xóa ghim */}
                <div className="flex items-center gap-1">
                  <select
                    value={pin.fundType ?? ""}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const val = (e.target.value || null) as FundType | null;
                      onChangePinFund(pin.propertyId, val);
                    }}
                    className="rounded-lg border border-line bg-gray-50 px-1.5 py-1 text-[10px] font-semibold text-footer outline-none"
                  >
                    <option value="">Chưa phân loại</option>
                    {FUND_TYPES.map((f) => (
                      <option key={f.key} value={f.key}>
                        {f.label.replace("Quỹ ", "")}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    title="Gỡ ghim này"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePin(pin.propertyId);
                    }}
                    className="rounded-lg p-1 text-muted transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
