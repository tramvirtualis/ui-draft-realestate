import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import type { FundType } from "../../../../types/project/project.types";
import {
  FUND_TYPES,
  fundColor,
  type SheetPin,
} from "./salesSheetPin";

interface Props {
  pin: SheetPin | null;
  initialPriceBillion: string;
  onClose: () => void;
  onRemove: (propertyId: number) => void;
  onSave: (propertyId: number, fundType: FundType | null, priceBillion: string) => void;
}

/**
 * Modal chỉnh sửa ghim / ô ma trận khi bấm vào một ô đã ghim
 */
export default function SalesSheetEditPinModal({
  pin,
  initialPriceBillion,
  onClose,
  onRemove,
  onSave,
}: Props) {
  const [fundType, setFundType] = useState<FundType | null>(pin?.fundType ?? null);
  const [priceBillion, setPriceBillion] = useState(initialPriceBillion);

  useEffect(() => {
    if (pin) {
      setFundType(pin.fundType);
      setPriceBillion(initialPriceBillion);
    }
  }, [pin, initialPriceBillion]);

  if (!pin) return null;

  const handleSave = () => {
    onSave(pin.propertyId, fundType, priceBillion);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-line">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <h4 className="text-sm font-bold text-footer flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: fundColor(fundType) }}
            />
            Chỉnh sửa ô căn {pin.code}
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-footer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          {/* Giá bán tỷ VNĐ */}
          <div>
            <label className="text-xs font-semibold text-body">
              Giá bán hiển thị (tỷ VNĐ)
            </label>
            <div className="relative mt-1">
              <input
                type="text"
                placeholder="VD: 2.92 hoặc 5.36"
                value={priceBillion}
                onChange={(e) => setPriceBillion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                className="w-full rounded-xl border border-line px-3 py-2 text-sm font-bold text-footer outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
                tỷ
              </span>
            </div>
          </div>

          {/* Loại quỹ */}
          <div>
            <label className="text-xs font-semibold text-body">Đổi loại quỹ</label>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {FUND_TYPES.map((f) => {
                const isSelected = fundType === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFundType(f.key)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-1.5 px-2 text-xs font-bold transition ${
                      isSelected
                        ? "border-primary-500 bg-primary-50 text-footer ring-2 ring-primary-500/20"
                        : "border-line bg-gray-50 text-body hover:bg-white"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: f.color }} />
                    <span className="truncate">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between pt-3 border-t border-line">
          <button
            type="button"
            onClick={() => onRemove(pin.propertyId)}
            className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 size={13} />
            Xóa ô
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line px-3 py-1.5 text-xs font-semibold text-body hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-primary-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-primary-200 hover:bg-primary-700"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
