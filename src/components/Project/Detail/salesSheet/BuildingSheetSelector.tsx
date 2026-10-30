import React from "react";
import { EyeOff, MapPin, Plus } from "lucide-react";
import {
  FUND_TYPES,
  UNCLASSIFIED,
} from "../../../Admin/project/salesSheet/salesSheetPin";

// id: khóa để chọn (id tòa nếu có, không thì id bảng hàng); sheetId: bảng hàng của tòa, không có = tòa chưa có bảng hàng
export interface BuildingSheetItem {
  id: number;
  sheetId?: number;
  buildingId?: number;
  name: string;
  code?: string;
  zoneName?: string;
  pinCount?: number;
}

interface Props {
  items: BuildingSheetItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  hiddenFunds: Set<string>;
  onToggleFund: (fundKey: string) => void;
  fundCounts?: Record<string, number>;
  onAddFundType?: () => void;
  totalBuildings?: number;
}

export default function BuildingSheetSelector({
  items,
  selectedId,
  onSelect,
  hiddenFunds,
  onToggleFund,
  fundCounts,
  onAddFundType,
  totalBuildings,
}: Props) {
  const displayTotal = totalBuildings ?? (items.length > 0 ? items.length : 0);
  const activeCount = items.filter((it) => it.sheetId != null).length;

  const fundsToShow = [
    ...FUND_TYPES,
    ...((fundCounts?.["UNCLASSIFIED"] ?? 0) > 0
      ? [{ key: "UNCLASSIFIED" as const, label: UNCLASSIFIED.label, color: UNCLASSIFIED.color }]
      : []),
  ];

  return (
    // Thanh công cụ kính: chọn tòa (viên thuốc, tòa đang chọn tím đặc) + bật / tắt ghim theo màu quỹ
    <div className="w-full rounded-[1.75rem] border border-white/80 bg-white/75 p-4 shadow-[0_24px_50px_-30px_rgba(10,15,26,0.45)] backdrop-blur md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-primary-600">Chọn tòa</h2>
        <p className="text-xs font-medium text-muted">
          <span className="font-semibold text-heading">{activeCount}/{displayTotal}</span> tòa có bảng hàng
        </p>
      </div>

      {/* Danh sách các tòa */}
      {items.length === 0 ? (
        <p className="mt-3 text-xs italic text-muted">Dự án hiện chưa có tòa nhà nào.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                aria-pressed={isSelected}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
                  isSelected
                    ? "btn-gloss text-white"
                    : "border border-primary-200 bg-white text-heading hover:border-primary-400 hover:text-primary-700"
                }`}
              >
                <span>{item.name}</span>
                {item.pinCount != null && item.pinCount > 0 && (
                  <span
                    className={`rounded-full px-1.5 text-[10px] font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-primary-50 text-primary-700"
                    }`}
                  >
                    {item.pinCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Bật / tắt hiển thị ghim theo màu quỹ */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-primary-100 pt-4">
        <span className="mr-1 font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Hiển thị quỹ</span>
        {fundsToShow.map((fund) => {
          const isHidden = hiddenFunds.has(fund.key);
          const count = fundCounts?.[fund.key];

          return (
            <button
              key={fund.key}
              type="button"
              onClick={() => onToggleFund(fund.key)}
              aria-pressed={!isHidden}
              title={
                isHidden
                  ? `Bấm để BẬT lại hiển thị ghim ${fund.label}`
                  : `Bấm để TẮT hiển thị ghim ${fund.label}`
              }
              className={`group flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                isHidden
                  ? "border-dashed border-primary-200 bg-transparent text-muted line-through opacity-70 hover:opacity-100"
                  : "border-primary-100 bg-white text-heading hover:border-primary-300"
              }`}
            >
              {isHidden ? (
                <span className="flex items-center justify-center text-muted">
                  <EyeOff size={14} />
                </span>
              ) : (
                <span
                  className="flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ color: fund.color }}
                >
                  <MapPin size={15} fill={fund.color} />
                </span>
              )}

              <span>{fund.label}</span>

              {count !== undefined && count > 0 && (
                <span
                  className={`rounded-full px-1.5 text-[10px] font-bold ${
                    isHidden ? "bg-primary-50 text-muted" : "bg-primary-50 text-primary-700"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* Nút dấu + chỉ hiện khi có handler thêm quỹ */}
        {onAddFundType && (
          <button
            type="button"
            onClick={onAddFundType}
            title="Thêm loại quỹ"
            aria-label="Thêm loại quỹ"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-200 bg-white text-muted transition hover:border-primary-400 hover:text-primary-700"
          >
            <Plus size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
