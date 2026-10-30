import { useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import type { Property } from "../../../../types/project/property.types";
import type { FundType } from "../../../../types/project/project.types";
import {
  FUND_TYPES,
  formatSheetPrice,
  fundColor,
} from "./salesSheetPin";

export type MarkingSubmitData = {
  mode: "SELECT_EXISTING" | "CREATE_NEW";
  propertyId?: number;
  code: string;
  priceBillion: string;
  floor: string;
  area: string;
  fundType: FundType | null;
};

interface Props {
  modalData: { x: number; y: number; fundType: FundType | null } | null;
  buildingName?: string;
  unpinnedSuggestions: Property[];
  creatingProperty: boolean;
  onClose: () => void;
  onConfirm: (data: MarkingSubmitData) => void;
}

/**
 * Modal đánh dấu ô ma trận: Chọn căn có sẵn hoặc Tạo căn mới
 */
export default function SalesSheetMarkingModal({
  modalData,
  buildingName,
  unpinnedSuggestions,
  creatingProperty,
  onClose,
  onConfirm,
}: Props) {
  const [markingMode, setMarkingMode] = useState<"SELECT_EXISTING" | "CREATE_NEW">(
    unpinnedSuggestions.length > 0 ? "SELECT_EXISTING" : "CREATE_NEW"
  );
  const [fundType, setFundType] = useState<FundType | null>(modalData?.fundType ?? "EXCLUSIVE");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    unpinnedSuggestions.length > 0 ? unpinnedSuggestions[0].id : null
  );
  const [priceBillion, setPriceBillion] = useState("");
  const [code, setCode] = useState("");
  const [floor, setFloor] = useState("");
  const [area, setArea] = useState("50");

  // Đồng bộ khi mở modal mới
  useEffect(() => {
    if (!modalData) return;
    setFundType(modalData.fundType);
    if (unpinnedSuggestions.length > 0) {
      setMarkingMode("SELECT_EXISTING");
      const first = unpinnedSuggestions[0];
      setSelectedPropertyId(first.id);
      if (first.price && first.price > 0) {
        const bStr =
          first.price >= 1_000_000_000
            ? (first.price / 1_000_000_000)
                .toFixed(2)
                .replace(/\.00$/, "")
                .replace(/(\.[1-9])0$/, "$1")
            : String(first.price);
        setPriceBillion(bStr);
      } else {
        setPriceBillion("");
      }
      setCode("");
      setFloor("");
      setArea("50");
    } else {
      setMarkingMode("CREATE_NEW");
      setSelectedPropertyId(null);
      setCode("");
      setFloor("");
      setArea("50");
      setPriceBillion("");
    }
  }, [modalData, unpinnedSuggestions]);

  if (!modalData) return null;

  const handleSubmit = () => {
    onConfirm({
      mode: markingMode,
      propertyId: selectedPropertyId ?? undefined,
      code,
      priceBillion,
      floor,
      area,
      fundType,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-line animate-modal-in">
        {/* Header modal */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <h4 className="text-sm font-bold text-footer flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: fundColor(fundType) }}
            />
            Đánh dấu ô bảng hàng {buildingName ? `(Tòa ${buildingName})` : ""}
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-footer"
          >
            <X size={16} />
          </button>
        </div>

        {/* TAB CHUYỂN ĐỔI CHẾ ĐỘ: 1. CHỌN CĂN CÓ SẴN - 2. TẠO CĂN MỚI */}
        <div className="mt-3.5 flex rounded-xl bg-gray-100 p-1 border border-line">
          <button
            type="button"
            onClick={() => setMarkingMode("SELECT_EXISTING")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
              markingMode === "SELECT_EXISTING"
                ? "bg-white text-footer shadow-xs"
                : "text-muted hover:text-footer"
            }`}
          >
            1. Chọn căn có sẵn ({unpinnedSuggestions.length})
          </button>
          <button
            type="button"
            onClick={() => setMarkingMode("CREATE_NEW")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition flex items-center justify-center gap-1 ${
              markingMode === "CREATE_NEW"
                ? "bg-white text-primary-700 shadow-xs"
                : "text-muted hover:text-footer"
            }`}
          >
            <Plus size={13} />
            2. Tạo căn mới
          </button>
        </div>

        <div className="mt-3.5 space-y-3.5">
          {/* CHỌN LOẠI QUỸ */}
          <div>
            <label className="text-xs font-semibold text-body">Loại quỹ</label>
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

          {/* CHẾ ĐỘ 1: CHỌN CĂN CÓ SẴN TRONG TÒA NHÀ CHƯA CÓ PIN */}
          {markingMode === "SELECT_EXISTING" ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-body">
                  Chọn căn hộ trong tòa ({unpinnedSuggestions.length} căn chưa ghim)
                </label>

                {unpinnedSuggestions.length === 0 ? (
                  <div className="mt-1.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-3 text-center">
                    <p className="text-xs text-amber-800 font-semibold">
                      Tất cả căn hộ trong tòa nhà đã được ghim!
                    </p>
                    <button
                      type="button"
                      onClick={() => setMarkingMode("CREATE_NEW")}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-700"
                    >
                      <Plus size={13} />
                      Bấm vào đây để tạo căn mới
                    </button>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedPropertyId ?? ""}
                      onChange={(e) => {
                        const pId = Number(e.target.value);
                        setSelectedPropertyId(pId);
                        const p = unpinnedSuggestions.find((item) => item.id === pId);
                        if (p && p.price && p.price > 0) {
                          const bStr =
                            p.price >= 1_000_000_000
                              ? (p.price / 1_000_000_000)
                                  .toFixed(2)
                                  .replace(/\.00$/, "")
                                  .replace(/(\.[1-9])0$/, "$1")
                              : String(p.price);
                          setPriceBillion(bStr);
                        } else {
                          setPriceBillion("");
                        }
                      }}
                      className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm font-bold text-footer outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="">-- Chọn một căn hộ --</option>
                      {unpinnedSuggestions.map((p) => {
                        const pPrice = formatSheetPrice(p.price);
                        return (
                          <option key={p.id} value={p.id}>
                            Căn {p.propertyCode}
                            {p.floor ? ` · Tầng ${p.floor}` : ""}
                            {p.area ? ` · ${p.area}m²` : ""}
                            {pPrice ? ` · ${pPrice}` : ""}
                          </option>
                        );
                      })}
                    </select>

                    {/* Danh sách bấm nhanh căn hộ */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted">Bấm nhanh vào căn:</span>
                        <button
                          type="button"
                          onClick={() => setMarkingMode("CREATE_NEW")}
                          className="text-[11px] font-bold text-primary-600 hover:underline inline-flex items-center gap-0.5"
                        >
                          <Plus size={11} /> Tạo căn mới
                        </button>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-gray-50 rounded-xl border border-line/60">
                        {unpinnedSuggestions.slice(0, 15).map((p) => {
                          const isCur = selectedPropertyId === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedPropertyId(p.id);
                                if (p.price && p.price > 0) {
                                  const bStr =
                                    p.price >= 1_000_000_000
                                      ? (p.price / 1_000_000_000)
                                          .toFixed(2)
                                          .replace(/\.00$/, "")
                                          .replace(/(\.[1-9])0$/, "$1")
                                      : String(p.price);
                                  setPriceBillion(bStr);
                                } else {
                                  setPriceBillion("");
                                }
                              }}
                              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                                isCur
                                  ? "bg-primary-600 text-white shadow-xs"
                                  : "border border-line bg-white text-footer hover:border-primary-400 hover:bg-primary-50/50"
                              }`}
                            >
                              {p.propertyCode}
                              {p.floor ? ` (T.${p.floor})` : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Giá bán hiển thị trên ô */}
              <div>
                <label className="text-xs font-semibold text-body">
                  Giá bán hiển thị trên ô (tỷ VNĐ)
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    placeholder="VD: 2.92 hoặc 5.36"
                    value={priceBillion}
                    onChange={(e) => setPriceBillion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !creatingProperty && selectedPropertyId) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    className="w-full rounded-xl border border-line px-3 py-2 text-sm font-bold text-footer outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
                    tỷ
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* CHẾ ĐỘ 2: TẠO CĂN MỚI CHO TÒA NHÀ */
            <div className="space-y-3">
              <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-2 text-center text-xs text-primary-800 font-semibold">
                Đang tạo căn mới cho tòa {buildingName}
              </div>

              {/* Nhập mã căn */}
              <div>
                <label className="text-xs font-semibold text-body">
                  Mã căn hộ mới <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="VD: 11, 12, CH-11..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !creatingProperty) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm font-bold text-footer outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              {/* Giá bán hiển thị trên thẻ */}
              <div>
                <label className="text-xs font-semibold text-body">
                  Giá bán hiển thị trên ô (tỷ VNĐ)
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    placeholder="VD: 2.92 hoặc 5.36"
                    value={priceBillion}
                    onChange={(e) => setPriceBillion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !creatingProperty) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    className="w-full rounded-xl border border-line px-3 py-2 text-sm font-bold text-footer outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
                    tỷ
                  </span>
                </div>
              </div>

              {/* Tầng & Diện tích */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-body">Tầng (tùy chọn)</label>
                  <input
                    type="number"
                    placeholder="VD: 5"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !creatingProperty) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    className="mt-1 w-full rounded-xl border border-line px-3 py-1.5 text-xs text-footer outline-none focus:border-primary-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-body">Diện tích (m²)</label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="VD: 50"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !creatingProperty) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                      className="w-full rounded-xl border border-line px-3 py-1.5 pr-8 text-xs font-bold text-footer outline-none focus:border-primary-400"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted">
                      m²
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between pt-3 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-body hover:bg-gray-50"
          >
            Hủy
          </button>
          <div className="flex items-center gap-2">
            {markingMode === "CREATE_NEW" && (
              <button
                type="button"
                onClick={() => setMarkingMode("SELECT_EXISTING")}
                className="rounded-xl border border-line px-3 py-2 text-xs font-semibold text-footer hover:bg-gray-50"
              >
                ← Chọn căn có sẵn
              </button>
            )}
            <button
              type="button"
              disabled={
                creatingProperty ||
                (markingMode === "SELECT_EXISTING" && !selectedPropertyId) ||
                (markingMode === "CREATE_NEW" && !code.trim())
              }
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary-200 hover:bg-primary-700 disabled:opacity-50"
            >
              {creatingProperty && <Loader2 size={13} className="animate-spin" />}
              {markingMode === "SELECT_EXISTING" ? "Đánh dấu căn này" : "Tạo & Đánh dấu ô"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
