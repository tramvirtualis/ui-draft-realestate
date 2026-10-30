import { FileUp, Loader2, MapPin, Plus, Save, Trash2 } from "lucide-react";
import type { FundType } from "../../../../types/project/project.types";
import {
  FUND_TYPES,
  PIN_SCALE,
  fundColor,
  fundLabel,
} from "./salesSheetPin";

interface Props {
  activeFundTool: FundType | "UNCLASSIFIED";
  onSelectFundTool: (tool: FundType | "UNCLASSIFIED") => void;
  pinScale: number;
  onChangePinScale: (scale: number) => void;
  uploading: boolean;
  onChangePlanClick: () => void;
  onDeleteSheetClick: () => void;
  saving: boolean;
  dirty: boolean;
  onSavePins: () => void;
}

/**
 * Thanh công cụ bảng hàng: Dấu quỹ, tỷ lệ ghim, đổi bản vẽ, xóa, lưu
 */
export default function SalesSheetToolbar({
  activeFundTool,
  onSelectFundTool,
  pinScale,
  onChangePinScale,
  uploading,
  onChangePlanClick,
  onDeleteSheetClick,
  saving,
  dirty,
  onSavePins,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-xs">
        {/* DẢI CÁC DẤU QUỸ ĐÁNH DẤU */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mr-1 hidden sm:inline">
            Dấu quỹ:
          </span>
          {FUND_TYPES.map((fund) => {
            const isActive = activeFundTool === fund.key;
            return (
              <button
                key={fund.key}
                type="button"
                onClick={() => onSelectFundTool(fund.key)}
                className={`group flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs ${
                  isActive
                    ? "border-primary-500 bg-primary-50 text-footer ring-2 ring-primary-500/20 scale-105"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span
                  className="flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ color: fund.color }}
                >
                  <MapPin size={15} fill={fund.color} />
                </span>
                <span>{fund.label}</span>
                {isActive && (
                  <span className="rounded-full bg-primary-600 px-1.5 py-0.2 text-[9px] text-white">
                    Bút
                  </span>
                )}
              </button>
            );
          })}

          {/* Nút + cho quỹ chưa phân loại */}
          <button
            type="button"
            onClick={() => onSelectFundTool("UNCLASSIFIED")}
            title="Chưa phân loại"
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all shadow-xs ${
              activeFundTool === "UNCLASSIFIED"
                ? "border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-500/20"
                : "border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Plus size={15} />
          </button>
        </div>

        {/* CÁC NÚT ĐIỀU KHIỂN & LƯU VỊ TRÍ */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tinh chỉnh cỡ ghim */}
          <div className="flex items-center gap-1.5 rounded-xl bg-gray-50 border border-line px-2.5 py-1 text-xs">
            <span className="text-muted text-[11px]">Cỡ:</span>
            <input
              type="range"
              min={PIN_SCALE.min}
              max={PIN_SCALE.max}
              step={PIN_SCALE.step}
              value={pinScale}
              onChange={(e) => onChangePinScale(Number(e.target.value))}
              className="w-16 accent-primary-600"
            />
            <span className="font-semibold text-footer text-[11px]">{pinScale.toFixed(1)}×</span>
          </div>

          {/* Đổi bản vẽ */}
          <button
            type="button"
            disabled={uploading}
            onClick={onChangePlanClick}
            className="inline-flex items-center gap-1 rounded-xl border border-line px-3 py-1.5 text-xs font-semibold text-footer transition hover:bg-gray-50"
          >
            <FileUp size={13} />
            Đổi bản vẽ
          </button>

          {/* Nút Xóa bảng hàng */}
          <button
            type="button"
            onClick={onDeleteSheetClick}
            title="Xóa toàn bộ bảng hàng"
            className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={13} />
          </button>

          {/* NÚT LƯU VỊ TRÍ */}
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={onSavePins}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-primary-200 transition hover:bg-primary-700 active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Lưu vị trí
          </button>
        </div>
      </div>

      {/* THANH HƯỚNG DẪN ĐÁNH DẤU TRỰC QUAN */}
      <div className="flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50/70 px-3.5 py-2 text-xs text-footer">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{
              backgroundColor:
                activeFundTool === "UNCLASSIFIED"
                  ? "#6b7280"
                  : fundColor(activeFundTool),
            }}
          />
          <span>
            Đang cầm bút đánh dấu:{" "}
            <strong className="text-primary-700">
              {activeFundTool === "UNCLASSIFIED"
                ? "Quỹ chưa phân loại"
                : fundLabel(activeFundTool)}
            </strong>
            . Nhấp chuột vào bất kỳ ô căn hộ nào trên bản vẽ để đánh dấu ghim!
          </span>
        </div>
        {dirty && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 shrink-0">
            Có thay đổi chưa lưu
          </span>
        )}
      </div>
    </div>
  );
}
